# Formula1Project

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## GitHub Pages and external driver photos

The public site is deployed by `.github/workflows/deploy.yml` on pushes to `master` or `main`. In repository Settings → Pages, select GitHub Actions. Only GitHub's automatically supplied GITHUB_TOKEN is used. Hosting and standard Actions runners are free for this public repository.

Run `npm ci`, `npm run photos:prepare`, then `npm run build:pages`. Output: `dist/formula1-project/browser`. Hash navigation preserves deep links on GitHub Pages.

Driver photographs are loaded directly from Wikimedia; image binaries are never downloaded into this repository. `scripts/prepare-driver-photos.mjs` matches Jolpica driver IDs through their Wikipedia articles and Wikidata P18 image statements. It covers the current field and historical season podiums. `src/app/data/driver-photos.json` contains only URLs and attribution metadata. Approved license families: CC BY, CC BY-SA (2.0–4.0), and CC0. Unknown licenses and ambiguous/missing identities are skipped. Photographer, source page, and license links are displayed beneath each image. No API key or running backend is required.

Metadata is refreshed after 30 days during deployment builds. Requests run sequentially, identify the project, and respect rate-limit backoff. Existing entries are retained on API failure. Missing/broken photos use initials rather than local driver images. Portraits are illustrative and may not be from the selected season. License terms on each source file still apply; the catalog is not a guarantee of all non-copyright rights. Existing local driver assets remain for reversible migration, but are no longer used by the podium.

Mobile layouts include a collapsible navigation menu, stacked podium cards, wrapping season controls, and horizontally scrollable results tables. The homepage retains the video with a pause control and adds direct links to Results and Winners. Reduced-motion preferences hide the background video.

### Photo discovery diagnostics

Photo discovery tries up to eight non-deprecated Wikidata images, preferred first, followed by Wikipedia's free page image. Supported CC license deed/legalcode URL variants are normalized. If a cropped Commons file lacks the creator, the script follows an explicit `Extracted from` link and uses its creator only when the source license matches. Unverified attribution is never guessed.

`src/app/data/driver-photo-report.json` records missing drivers, rejection reasons, retained cached entries and discovery errors. It is not imported into the website bundle. Unknown license families still use the initials fallback. The catalog and report are refreshed by `npm run photos:prepare` during GitHub Pages deployment. Run `node --test scripts/photo-utils.test.mjs` to check alternative selection and license URL validation.

## Verified external circuit layouts

The Results information band now places a reusable `CircuitLayoutComponent` between race details and location/date. On phones it stacks vertically. The SVG stays on Wikimedia, keeps its aspect ratio and transparency, and is displayed as a white silhouette. No circuit credits appear in the UI because only explicitly attribution-free artwork is admitted. Missing or failed images show the circuit name and a placeholder. No image HTML is injected.

`npm run circuits:prepare` refreshes `src/app/data/circuit-layouts.json` and produces `circuit-layout-report.json`. Discovery reads Jolpica circuit identities and the reviewed source manifest `scripts/circuit-layout-sources.json`. It does not guess by filename or search on each page visit. Metadata is cached for 30 days. Unchanged cached files are not downloaded again; SVG bytes are inspected in memory only. Temporary network/API failures preserve matching verified cached entries. Explicit license/provenance/SVG failures exclude the affected entry. Both JSON files are written atomically before compilation.

The initial eight Commons maps are AlexJ's original-work CC0 low-detail circuit diagrams. Reviewed season ranges:

| Circuit                 | Seasons                                         |
| ----------------------- | ----------------------------------------------- |
| Albert Park             | 1996–2019                                       |
| Bahrain GP layout       | 2004–2009, 2012–2026; **2020 round 16 blocked** |
| Catalunya               | 2007–2020                                       |
| Hockenheim              | 2002–2019                                       |
| Monaco                  | 2003–2014                                       |
| Sepang                  | 1999–2015                                       |
| Silverstone             | 2010 only                                       |
| Valencia street circuit | 2008–2012                                       |

Ranges are deliberately conservative. Gaps, later reconfigurations and unsupported circuits (including Lusail) show the placeholder. Bahrain 2010 and 2020 Sakhir must never show the standard GP image. Exact round overrides take priority; ambiguous matches fail closed. Stable circuit IDs handle naming changes without fuzzy matching. The catalog records the source page, license evidence, author, configuration evidence, verification time and content hash.

MasterPlay007's CC0 collection remains a pending source because individual provenance/historical configuration evidence is incomplete. CC BY/CC BY-SA circuit files are excluded. Do not broaden ranges or accept newly discovered artwork without checking its evidence. `sources` is an explicit approval manifest, not a license inferred from a filename.

The only new library is the build/test-only `fast-xml-parser`, used to validate SVG XML safely. No backend, API key, runtime parsing library or paid service is needed. The existing Pages workflow now prepares circuits and runs `npm run circuits:test` before the production build; driver photo steps are preserved. No scheduled job is created.

Tests exercise the actual matching function and Angular component signal state, Sakhir exceptions, year gaps, ambiguous mappings, URL and attribution checks, SVG safety, and stale image-load events. Run `npm run circuits:test` and `node --test scripts/photo-utils.test.mjs`.

External hosting has no availability guarantee. Commons allows hotlinking, but files can change or disappear between checks. Runtime failures show a placeholder; no source is silently mirrored into Angular assets. To expand coverage, add an evidence-backed source/range to the manifest, regenerate metadata, inspect the result and test the new boundary years.
