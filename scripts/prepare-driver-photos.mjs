import { normalizeLicense, imageCandidates } from './photo-utils.mjs';

import { readFile, writeFile } from 'node:fs/promises';

// Location of the local JSON catalog.
// This file stores image URLs and attribution metadata, not image files.
// The actual photographs remain hosted on Wikimedia's servers.
const catalogPath = new URL(
  '../src/app/data/driver-photos.json',
  import.meta.url
);

// Load previously discovered driver photos.
// If the catalog does not exist or cannot be read, start with an empty object.
const reportPath = new URL(
  '../src/app/data/driver-photo-report.json',
  import.meta.url
);
const report = {
  generatedAt: new Date().toISOString(),
  missing: [],
  retained: [],
  errors: []
};
let catalog = {};
try {
  catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
} catch {}

// Identify this project when making requests to Wikimedia and other APIs.
const agent =
  'Formula1Project/1.0 (https://github.com/GiorgosNdinas/Formula1-Project)';

// Small delay utility to avoid sending requests too aggressively.
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch JSON from an API with basic retry handling.
 *
 * - Waits 350 ms before each request.
 * - Allows up to three attempts.
 * - Retries HTTP 429 (rate limited) and 503 (service unavailable).
 * - Respects the Retry-After header when present.
 * - Times out each request after 15 seconds.
 */
async function json(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await pause(350);

    const response = await fetch(url, {
      headers: { 'User-Agent': agent },
      signal: AbortSignal.timeout(15000)
    });

    // Retry temporary API failures with a delay.
    if ([429, 503].includes(response.status) && attempt < 2) {
      const seconds = Number(response.headers.get('retry-after'));

      await pause(
        Math.min(
          60000,
          Math.max(
            5000,
            Number.isFinite(seconds) ? seconds * 1000 : 5000 * 2 ** attempt
          )
        )
      );

      continue;
    }

    // Stop if the API returns another unsuccessful response.
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  throw new Error('Rate limited');
}

// Convert simple HTML-formatted metadata into readable plain text.
// Wikimedia attribution fields may contain HTML tags and entities.
const plain = value =>
  String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

// Build a Wikimedia MediaWiki API URL with query parameters.
const api = (host, parameters) =>
  `https://${host}/w/api.php?${new URLSearchParams({
    format: 'json',
    ...parameters
  })}`;

/**
 * Check whether an image URL points to an approved Wikimedia host.
 *
 * Only HTTPS images hosted by Wikimedia's upload or thumbnail
 * servers are accepted.
 */
const safeImage = url => {
  try {
    const u = new URL(url);

    return (
      u.protocol === 'https:' &&
      (u.hostname === 'upload.wikimedia.org' ||
        u.hostname === 'thumb.wikimedia.org')
    );
  } catch {
    return false;
  }
};

try {
  // Store unique drivers by their Ergast/Jolpica driver ID.
  // A Map prevents duplicates across different racing seasons.
  const drivers = new Map();

  // Maximum time allowed for photo discovery: eight minutes.
  const deadline = Date.now() + 8 * 60 * 1000;

  /**
   * Collect drivers from:
   *
   * 1. The current season's driver standings.
   * 2. The top three championship finishers from every
   *    historical season starting in 1950.
   *
   * This is not a complete list of every historical F1 driver.
   */
  for (const endpoint of [
    'current/driverStandings.json?limit=100',
    ...Array.from(
      { length: new Date().getUTCFullYear() - 1950 },
      (_, i) => `${1950 + i}/driverStandings.json?limit=3`
    )
  ]) {
    // Retrieve championship standings from the Jolpica F1 API.
    const result = await json(`https://api.jolpi.ca/ergast/f1/${endpoint}`);

    // Extract driver information from each returned standings list.
    for (const season of result.MRData.StandingsTable.StandingsLists) {
      for (const standing of season.DriverStandings) {
        drivers.set(standing.Driver.driverId, standing.Driver);
      }
    }
  }

  console.log(
    `Resolving photos for ${drivers.size} current and historical podium drivers.`
  );

  // Count how many photo records are successfully refreshed.
  let resolved = 0;

  // Process each unique driver.
  for (const [id, driver] of drivers) {
    // Stop photo discovery if the time budget has expired.
    // Drivers without images can use initials in the website UI.
    if (Date.now() > deadline) {
      console.warn(
        'Photo refresh time budget reached; unresolved drivers use initials.'
      );
      break;
    }

    const existing = catalog[id];

    // Reuse cached metadata if it was checked within the last 30 days.
    // This reduces API requests and improves refresh performance.
    if (
      existing &&
      Date.now() - Date.parse(existing.checkedAt) < 30 * 86400000
    ) {
      continue;
    }

    const reasons = [];
    try {
      /**
       * STEP 1: Locate the driver's Wikipedia article.
       *
       * Jolpica provides a Wikipedia URL for each driver.
       * Only English Wikipedia links are accepted here.
       */
      const article = new URL(driver.url);

      if (article.hostname !== 'en.wikipedia.org') {
        continue;
      }

      const title = decodeURIComponent(
        article.pathname.replace(/^\/wiki\//, '')
      );

      /**
       * STEP 2: Find the driver's Wikidata ID.
       *
       * Wikipedia articles can link to a Wikidata entity.
       * Wikidata IDs look like Q12345.
       */
      const wiki = await json(
        api('en.wikipedia.org', {
          action: 'query',
          prop: 'pageprops|pageimages',
          piprop: 'name',
          pilicense: 'free',
          ppprop: 'wikibase_item',
          redirects: '1',
          titles: title
        })
      );

      const qid = Object.values(wiki.query?.pages ?? {})[0]?.pageprops
        ?.wikibase_item;

      // Skip drivers without a valid Wikidata entity.
      if (!qid || !/^Q\d+$/.test(qid)) {
        continue;
      }

      /**
       * STEP 3: Find the driver's image in Wikidata.
       *
       * Property P18 represents an image associated with an entity.
       */
      const data = await json(
        api('www.wikidata.org', {
          action: 'wbgetentities',
          ids: qid,
          props: 'claims'
        })
      );

      const claims = data.entities?.[qid]?.claims?.P18 ?? [];

      const pageImage = Object.values(wiki.query?.pages ?? {})[0]?.pageimage;
      const filenames = imageCandidates(claims, pageImage);
      let found = false;
      if (!filenames.length)
        reasons.push('No Wikidata or free Wikipedia image found');
      for (const filename of filenames) {
        try {
          /**
           * STEP 4: Retrieve image information from Wikimedia Commons.
           *
           * Request:
           * - A thumbnail up to 480 pixels wide.
           * - The image description page.
           * - Creator/author information.
           * - License details.
           * - Attribution requirements.
           */
          const info = await json(
            api('commons.wikimedia.org', {
              action: 'query',
              prop: 'imageinfo',
              titles: `File:${filename}`,
              iiprop: 'url|extmetadata',
              iiurlwidth: '480',
              iiextmetadatafilter:
                'Artist|LicenseShortName|LicenseUrl|AttributionRequired|Copyrighted',
              iiextmetadatalanguage: 'en'
            })
          );

          const file = Object.values(info.query?.pages ?? {})[0]
            ?.imageinfo?.[0];

          const metadata = file?.extmetadata;
          const licenseUrl = normalizeLicense(metadata?.LicenseUrl?.value);
          let author = plain(metadata?.Artist?.value);
          if (!author && licenseUrl) {
            // Cropped files sometimes omit the creator but explicitly identify a source file.
            // Credit the source creator only when the source has the same verified license.
            const page = await json(
              api('commons.wikimedia.org', {
                action: 'query',
                prop: 'revisions',
                rvprop: 'content',
                rvslots: 'main',
                titles: `File:${filename}`
              })
            );
            const text =
              Object.values(page.query?.pages ?? {})[0]?.revisions?.[0]?.slots
                ?.main?.['*'] ?? '';
            const source = text
              .match(
                /\{\{\s*Extracted from\s*\|\s*(?:1\s*=\s*)?([^|}]+)\s*(?:\||\}\})/i
              )?.[1]
              ?.trim();
            if (source) {
              const original = await json(
                api('commons.wikimedia.org', {
                  action: 'query',
                  prop: 'imageinfo',
                  titles: `File:${source}`,
                  iiprop: 'extmetadata',
                  iiextmetadatafilter: 'Artist|LicenseUrl'
                })
              );
              const originalMetadata = Object.values(
                original.query?.pages ?? {}
              )[0]?.imageinfo?.[0]?.extmetadata;
              if (
                normalizeLicense(originalMetadata?.LicenseUrl?.value) ===
                licenseUrl
              )
                author = plain(originalMetadata?.Artist?.value);
            }
          }

          /**
           * STEP 5: Validate the image before using it.
           *
           * Only images with explicitly allowed Creative Commons
           * licenses are accepted:
           *
           * - CC BY versions 2.0, 2.5, 3.0 and 4.0
           * - CC BY-SA versions 2.0, 2.5, 3.0 and 4.0
           * - CC0 1.0
           *
           * Images must also have:
           * - A known author.
           * - An approved Wikimedia HTTPS thumbnail URL.
           *
           * Note: License validation does not replace the need
           * to display attribution and comply with license terms.
           */
          if (!licenseUrl || !author || !safeImage(file?.thumburl)) {
            reasons.push(
              `${filename}: ${!licenseUrl ? 'unsupported or missing license' : !author ? 'creator not verifiable' : 'missing or unsafe thumbnail'}`
            );
            continue;
          }

          /**
           * STEP 6: Save photo metadata to the local JSON catalog.
           *
           * The image itself is NOT downloaded.
           * The website can load it directly from Wikimedia.
           *
           * Attribution information is preserved for display.
           */
          catalog[id] = {
            url: file.thumburl,
            sourceUrl: file.descriptionurl,
            author,
            license: plain(metadata.LicenseShortName?.value),
            licenseUrl: licenseUrl.replace(/^http:/, 'https:'),
            wikidataId: qid,
            checkedAt: new Date().toISOString()
          };

          resolved++;
          found = true;
          break;
        } catch (error) {
          reasons.push(`${filename}: ${error.message}`);
        }
      }
      if (!found) {
        const entry = {
          driverId: id,
          name: `${driver.givenName} ${driver.familyName}`,
          reasons
        };
        (existing ? report.retained : report.missing).push(entry);
      }
    } catch (error) {
      const entry = {
        driverId: id,
        name: `${driver.givenName} ${driver.familyName}`,
        reasons: [error.message]
      };
      (existing ? report.retained : report.missing).push(entry);
      // A failed photo lookup should not stop the entire refresh.
      // Existing metadata is retained when an individual lookup fails.
      console.warn(
        `Photo ${id}: ${error.message}; retaining previous metadata or initials.`
      );
    }
  }

  // Include drivers skipped before image lookup and drivers beyond the time budget.
  const reported = new Set(report.missing.map(entry => entry.driverId));
  for (const [id, driver] of drivers) {
    if (!catalog[id] && !reported.has(id))
      report.missing.push({
        driverId: id,
        name: `${driver.givenName} ${driver.familyName}`,
        reasons: [
          'No verified identity/image, or lookup did not finish within the time budget'
        ]
      });
  }
  report.catalogCount = Object.keys(catalog).length;
  report.driversChecked = drivers.size;
  // Save the updated catalog in a readable JSON format.
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Missing photos: ${report.missing.map(d => d.driverId).join(', ') || 'none'}`
  );
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(
    `Driver photos: ${Object.keys(catalog).length} licensed external images (${resolved} refreshed).`
  );
} catch (error) {
  /**
   * Handle failures affecting the overall discovery process.
   *
   * If the standings API or another outer operation fails,
   * retain the previously loaded photo catalog.
   *
   * The website can continue using existing photo metadata
   * and initials for drivers without images.
   */
  report.errors.push(error.message);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.warn(
    `Photo discovery unavailable: ${error.message}. Using the last catalog; standings remain available.`
  );

  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
}
