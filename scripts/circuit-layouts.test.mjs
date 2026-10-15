import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import '@angular/compiler';
import * as core from '@angular/core';
import {
  inspectCircuitSvg,
  safeCircuitUrl,
  verifyCircuitLicense
} from './circuit-layout-utils.mjs';

/** Execute the actual TypeScript matcher and component; no copied matching logic. */
function loadTypeScript(relativePath, dependencies = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
      useDefineForClassFields: false
    }
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: name => {
      if (!(name in dependencies))
        throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    }
  });
  return exports;
}

const { selectCircuitLayout } = loadTypeScript(
  '../src/app/servicies/circuit-layout.matcher.ts'
);
const base = {
  id: 'normal',
  circuitId: 'bahrain',
  seasonRanges: [
    { from: 2004, to: 2009 },
    { from: 2012, to: 2026 }
  ],
  attributionRequired: false,
  license: 'CC0-1.0'
};
const catalog = {
  entries: [base],
  exceptions: [
    { circuitId: 'bahrain', season: 2020, round: 16, reason: 'Outer Circuit' }
  ]
};

test('Sakhir exception prevents an incorrect normal Bahrain map', () => {
  assert.equal(selectCircuitLayout(catalog, 'bahrain', 2020, 15)?.id, 'normal');
  assert.equal(selectCircuitLayout(catalog, 'bahrain', 2020, 16), undefined);
});

test('year gaps, unknown circuits and unreviewed future seasons use fallback', () => {
  assert.equal(selectCircuitLayout(catalog, 'bahrain', 2010, 1), undefined);
  assert.equal(selectCircuitLayout(catalog, 'bahrain', 2027, 1), undefined);
  assert.equal(selectCircuitLayout(catalog, 'silverstone', 2020, 1), undefined);
  assert.equal(selectCircuitLayout(catalog, 'bahrain', 2020, 0), undefined);
});

test('conflicting ranges cannot silently choose an unrelated image', () => {
  assert.equal(
    selectCircuitLayout(
      { ...catalog, entries: [base, { ...base, id: 'conflicting' }] },
      'bahrain',
      2020,
      15
    ),
    undefined
  );
});

test('an explicit reviewed race override can replace a blocked configuration', () => {
  const exact = { ...base, id: 'outer', rounds: [16] };
  const selected = selectCircuitLayout(
    {
      entries: [base, exact],
      exceptions: [{ ...catalog.exceptions[0], layoutId: 'outer' }]
    },
    'bahrain',
    2020,
    16
  );
  assert.equal(selected?.id, 'outer');
});

test('circuit identity remains stable when the displayed name changes', () => {
  assert.equal(
    selectCircuitLayout(
      { ...catalog, entries: [{ ...base, circuitName: 'Renamed venue' }] },
      'bahrain',
      2020,
      15
    )?.id,
    'normal'
  );
});

test('attribution requirements cannot be bypassed by a catalog flag alone', () => {
  const metadata = {
    Artist: { value: 'Creator' },
    Credit: { value: 'Own work' },
    AttributionRequired: { value: 'false' },
    LicenseUrl: {
      value: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en'
    }
  };
  assert.equal(verifyCircuitLicense(metadata), 'CC0-1.0');
  assert.throws(() =>
    verifyCircuitLicense({
      ...metadata,
      LicenseUrl: { value: 'https://creativecommons.org/licenses/by/4.0/' }
    })
  );
  assert.throws(() =>
    verifyCircuitLicense({
      ...metadata,
      Credit: { value: 'Unspecified source' }
    })
  );
});

const svg = body =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${body}</svg>`;
test('safe, transparent SVG dimensions preserve the original aspect ratio', () => {
  assert.equal(
    inspectCircuitSvg(
      svg('<path d="M0 0L100 100" stroke="black" fill="none"/>')
    ).width,
    800
  );
});

test('reject scripts, external resources, labels, malformed SVG and opaque backgrounds', () => {
  for (const body of [
    '<script>alert(1)</script>',
    '<svg:script xmlns:svg="http://www.w3.org/2000/svg">alert(1)</svg:script>',
    '<text>DRS</text>',
    '<image href="https://example.org/image.png"/>',
    '<path d="M0 0" onload="alert(1)"/>',
    '<rect width="100%" height="100%" fill="white"/>',
    '<path style="fill:url(https://example.org/pattern)"/>',
    '<foreignObject/>'
  ])
    assert.throws(() => inspectCircuitSvg(svg(body)));
  assert.throws(() => inspectCircuitSvg('<svg>'));
  assert.throws(() =>
    inspectCircuitSvg('<!DOCTYPE svg>' + svg('<path d="M0 0"/>'))
  );
});

test('external SVG host validation rejects credentialed and lookalike URLs', () => {
  assert.equal(
    safeCircuitUrl(
      'https://upload.wikimedia.org/wikipedia/commons/a/ab/Track.svg'
    ),
    true
  );
  for (const url of [
    'http://upload.wikimedia.org/Track.svg',
    'https://upload.wikimedia.org.evil.example/Track.svg',
    'https://name:secret@upload.wikimedia.org/Track.svg'
  ])
    assert.equal(safeCircuitUrl(url), false);
});

test('component ignores stale load errors and updates signals when the race changes', () => {
  class CircuitLayoutService {}
  const { CircuitLayoutComponent } = loadTypeScript(
    '../src/app/components/circuit-layout/circuit-layout.component.ts',
    {
      '@angular/core': core,
      '../../servicies/circuit-layout.service': { CircuitLayoutService }
    }
  );
  const injector = core.createEnvironmentInjector([
    {
      provide: CircuitLayoutService,
      useValue: {
        find: id =>
          id ? { svgUrl: `https://example.org/${id}.svg` } : undefined
      }
    }
  ]);
  try {
    const component = core.runInInjectionContext(
      injector,
      () => new CircuitLayoutComponent()
    );
    component.circuitId = 'first';
    component.season = '2025';
    component.round = '1';
    assert.equal(component.loading(), true);
    component.circuitId = 'second';
    component.failed('https://example.org/first.svg');
    assert.equal(component.image()[0].svgUrl, 'https://example.org/second.svg');
    component.loaded('https://example.org/second.svg');
    assert.equal(component.loading(), false);
    component.failed('https://example.org/second.svg');
    assert.equal(component.image().length, 0);
  } finally {
    injector.destroy();
  }
});
