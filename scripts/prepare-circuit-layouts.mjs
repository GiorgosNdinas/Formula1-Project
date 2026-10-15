import { readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  inspectCircuitSvg,
  safeCircuitUrl,
  verifyCircuitLicense
} from './circuit-layout-utils.mjs';

const sourcePath = new URL('./circuit-layout-sources.json', import.meta.url);
const catalogPath = new URL(
  '../src/app/data/circuit-layouts.json',
  import.meta.url
);
const reportPath = new URL(
  '../src/app/data/circuit-layout-report.json',
  import.meta.url
);
const sources = JSON.parse(await readFile(sourcePath, 'utf8'));
let previous = { entries: [] };
try {
  const loaded = JSON.parse(await readFile(catalogPath, 'utf8'));
  if (Array.isArray(loaded.entries)) previous = loaded;
} catch {}
const digest = value => createHash('sha256').update(value).digest('hex');
const report = {
  checkedAt: new Date().toISOString(),
  verified: [],
  cached: [],
  rejected: [],
  retained: [],
  pending: sources.pendingSources,
  missingCircuitIds: [],
  discoveryErrors: []
};
const agent =
  'Formula1Project/1.0 (https://github.com/GiorgosNdinas/Formula1-Project)';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Sequential, bounded requests with server-directed backoff and timeouts. */
async function request(url, attempt = 0) {
  await pause(400);
  let response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': agent },
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    throw Object.assign(new Error(error.message), { temporary: true });
  }
  if ([429, 503].includes(response.status) && attempt < 2) {
    const delay = Math.max(
      5000,
      Number(response.headers.get('retry-after')) * 1000 || 5000 * 2 ** attempt
    );
    await pause(Math.min(delay, 60000));
    return request(url, attempt + 1);
  }
  if (!response.ok)
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      temporary: response.status === 429 || response.status >= 500
    });
  return response;
}

/** Treat temporary MediaWiki API errors and invalid responses as retryable outages. */
async function requestJson(url) {
  let data;
  try {
    data = await (await request(url)).json();
  } catch (error) {
    if (error instanceof SyntaxError || error.name === 'AbortError')
      error.temporary = true;
    throw error;
  }
  if (data.error) {
    const temporary = [
      'maxlag',
      'ratelimited',
      'readonly',
      'internal_api_error'
    ].some(code => String(data.error.code).startsWith(code));
    throw Object.assign(new Error(`API ${data.error.code}`), { temporary });
  }
  return data;
}

/** Write complete JSON atomically so Angular never reads a partial catalog. */
async function save(path, data) {
  const temp = new URL(path.href + '.tmp');
  await writeFile(temp, JSON.stringify(data, null, 2) + '\n');
  await rename(temp, path);
}

const circuits = new Map();
try {
  for (let offset = 0; ; offset += 100) {
    const result = await requestJson(
      `https://api.jolpi.ca/ergast/f1/circuits.json?limit=100&offset=${offset}`
    );
    for (const circuit of result.MRData.CircuitTable.Circuits)
      circuits.set(circuit.circuitId, circuit);
    if (offset + 100 >= Number(result.MRData.total)) break;
  }
} catch (error) {
  report.discoveryErrors.push(`Circuit identity lookup: ${error.message}`);
}

const entries = [];
for (const source of sources.sources) {
  const reviewKey = digest(JSON.stringify(source));
  const cached = previous.entries.find(
    entry =>
      entry.id === source.id &&
      entry.reviewKey === reviewKey &&
      safeCircuitUrl(entry.svgUrl) &&
      entry.attributionRequired === false
  );
  if (cached && Date.now() - Date.parse(cached.verifiedAt) < 30 * 86400000) {
    entries.push(cached);
    report.cached.push(source.id);
    continue;
  }
  try {
    if (!circuits.size)
      throw Object.assign(
        new Error('Circuit identities temporarily unavailable'),
        { temporary: true }
      );
    if (!circuits.has(source.circuitId))
      throw new Error('Unknown Jolpica circuit ID');
    if (
      !source.provenance ||
      !source.configurationEvidenceUrls.length ||
      !source.seasonRanges.every(
        range =>
          Number.isInteger(range.from) &&
          Number.isInteger(range.to) &&
          range.from <= range.to
      )
    )
      throw new Error('Missing provenance or bounded configuration evidence');
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'imageinfo',
      titles: `File:${source.commonsFile}`,
      iiprop: 'url|extmetadata',
      iiextmetadatafilter:
        'Artist|Credit|License|LicenseShortName|LicenseUrl|AttributionRequired|Copyrighted|Restrictions|Categories'
    });
    const info = await requestJson(
      `https://commons.wikimedia.org/w/api.php?${params}`
    );
    const file = Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0];
    const license = verifyCircuitLicense(file?.extmetadata);
    if (!safeCircuitUrl(file?.url))
      throw new Error('Unapproved external SVG origin');
    const svgResponse = await request(file.url);
    if (!svgResponse.headers.get('content-type')?.includes('image/svg+xml'))
      throw new Error('Response is not SVG');
    const xml = await svgResponse.text();
    const dimensions = inspectCircuitSvg(xml);
    entries.push({
      id: source.id,
      circuitId: source.circuitId,
      circuitName: source.circuitName,
      seasonRanges: source.seasonRanges,
      ...(source.rounds ? { rounds: source.rounds } : {}),
      svgUrl: file.url,
      sourceUrl: file.descriptionurl,
      license,
      licenseEvidenceUrl: file.descriptionurl,
      attributionRequired: false,
      author: file.extmetadata.Artist.value.replace(/<[^>]*>/g, '').trim(),
      provenance: source.provenance,
      configurationEvidenceUrls: source.configurationEvidenceUrls,
      verifiedAt: new Date().toISOString(),
      sha256: digest(xml),
      reviewKey,
      ...dimensions,
      presentation: source.presentation
    });
    report.verified.push(source.id);
  } catch (error) {
    const detail = { id: source.id, reason: error.message };
    if ((error.temporary || error.name === 'AbortError') && cached) {
      entries.push(cached);
      report.retained.push(detail);
    } else report.rejected.push(detail);
  }
}

report.missingCircuitIds = [...circuits.keys()].filter(
  id => !entries.some(entry => entry.circuitId === id)
);
await save(catalogPath, {
  schemaVersion: 1,
  entries,
  exceptions: sources.exceptions
});
await save(reportPath, report);
console.log(
  `Circuit layouts: ${entries.length} verified/cached, ${report.rejected.length} rejected, ${report.pending.length} source collections pending review.`
);
for (const issue of report.rejected)
  console.warn(`${issue.id}: ${issue.reason}`);
