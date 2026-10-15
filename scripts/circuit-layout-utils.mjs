import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { normalizeLicense } from './photo-utils.mjs';

/** Require explicit attribution-free terms and original-work provenance. */
export function verifyCircuitLicense(metadata) {
  const value = key => String(metadata?.[key]?.value ?? '');
  const attribution = value('AttributionRequired').toLowerCase();
  const ownWork =
    value('Credit')
      .replace(/<[^>]*>/g, '')
      .trim()
      .toLowerCase() === 'own work';
  if (
    attribution !== 'false' ||
    !ownWork ||
    !value('Artist').trim() ||
    value('Restrictions').trim()
  ) {
    throw new Error(
      'Attribution-free license or original-work provenance not verified'
    );
  }
  if (
    normalizeLicense(value('LicenseUrl')) ===
    'https://creativecommons.org/publicdomain/zero/1.0/'
  )
    return 'CC0-1.0';
  if (
    value('Categories').split('|').includes('PD-self') &&
    value('Copyrighted').toLowerCase() === 'false' &&
    value('License') === 'pd'
  )
    return 'PD-self';
  throw new Error(
    'Only verified CC0 and explicit PD-self releases are accepted'
  );
}

/** Approved external origins only; SVGs are never inserted as raw HTML. */
export function safeCircuitUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'upload.wikimedia.org' &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname.endsWith('.svg')
    );
  } catch {
    return false;
  }
}

/** Validate SVG XML and reject active content, labels and opaque backgrounds. */
export function inspectCircuitSvg(xml) {
  if (Buffer.byteLength(xml) > 250000 || /<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error('Oversized SVG or document entities');
  if (XMLValidator.validate(xml) !== true) throw new Error('Malformed SVG XML');
  const parsed = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
    attributeNamePrefix: '@_'
  }).parse(xml);
  const root = parsed.svg;
  if (!root || root['@_xmlns'] !== 'http://www.w3.org/2000/svg')
    throw new Error('Not an SVG document');
  const box = String(root['@_viewBox'] ?? '')
    .trim()
    .split(/[ ,]+/)
    .map(Number);
  const dimension = value =>
    /^\d+(?:\.\d+)?(?:px)?$/.test(String(value)) ? parseFloat(value) : NaN;
  const width = box.length === 4 ? box[2] : dimension(root['@_width']);
  const height = box.length === 4 ? box[3] : dimension(root['@_height']);
  if (!(
    width > 0 &&
    height > 0 &&
    Number.isFinite(width) &&
    Number.isFinite(height)
  ))
    throw new Error('Invalid SVG dimensions');
  const allowed = new Set([
    'svg',
    'g',
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'polygon',
    'defs',
    'marker',
    'clipPath',
    'linearGradient',
    'radialGradient',
    'stop',
    'title',
    'desc'
  ]);
  let paths = 0;
  function visit(node, tag) {
    if (Array.isArray(node)) {
      node.forEach(item => visit(item, tag));
      return;
    }
    if (node === null || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('@_')) {
        const name = key.slice(2).split(':').pop().toLowerCase();
        if (
          name.startsWith('on') ||
          name === 'base' ||
          (name === 'href' && !String(value).startsWith('#'))
        )
          throw new Error('Active content or external resource');
        if (/javascript:|data:/i.test(String(value)))
          throw new Error('External SVG style resource');
        for (const match of String(value).matchAll(/url\((.*?)\)/gi)) {
          if (
            !match[1]
              .trim()
              .replace(/^['"]|['"]$/g, '')
              .startsWith('#')
          )
            throw new Error('External SVG style resource');
        }
        if (
          name === 'style' &&
          /background(?:-color)?\s*:/i.test(String(value))
        )
          throw new Error('Opaque background style');
        continue;
      }
      if (key === '#text' || key.startsWith('?')) continue;
      // Editor/RDF metadata does not render. It is not copied into the application.
      if (key === 'metadata' || /^(sodipodi|inkscape|rdf|dc|cc):/.test(key))
        continue;
      if (!allowed.has(key))
        throw new Error(`Unsupported or annotated SVG element: ${key}`);
      if (key === 'path') paths += Array.isArray(value) ? value.length : 1;
      visit(value, key);
    }
    if (tag === 'rect') {
      const size = (value, base) =>
        String(value).endsWith('%')
          ? (parseFloat(value) * base) / 100
          : parseFloat(value);
      const rectWidth = size(node['@_width'], width);
      const rectHeight = size(node['@_height'], height);
      if (rectWidth >= width * 0.9 && rectHeight >= height * 0.9)
        throw new Error('Possible opaque background rectangle');
    }
  }
  visit(root, 'svg');
  if (!paths) throw new Error('SVG has no track paths');
  return { width, height };
}
