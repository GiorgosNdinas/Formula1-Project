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

### Circuit layouts and attribution

The catalog now uses **160 external SVG layouts for 78 circuits** from
[Jules Roy's F1 Circuits SVG collection](https://github.com/f1db/f1-circuits-svg),
pinned to commit `c1bcd6fcb1b6fdb662136daa6bc19f3a2f870f65` and licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
This replaces the earlier attribution-free-only circuit policy with the owner's
approval. Driver-photo licensing is unchanged.

Every displayed circuit includes the author, license link and full credits link.
The `/circuit-credits` hash route lists the copyright notice, original artwork,
license evidence, modification statement and reviewed season ranges. Original
white SVGs are displayed unchanged, scaled to fit; no SVG files are saved locally.

`npm run circuits:prepare` checks the pinned copyright/license hash, validates SVG
XML, and caches verified metadata for 30 days. Temporary upstream outages retain
only matching reviewed metadata. Explicit validation failures stop deployment.
Changing the upstream revision or approving another season requires a source
manifest review; new seasons are never inferred automatically.

All 24 races in the 2025 schedule and all 23 in the retrieved 2026 schedule are
covered. Two upstream season gaps were reviewed explicitly against official F1
sources: Shanghai's return in 2024�2025 and Sepang's return in 2026. Their evidence
and the outline-only inference are recorded in the source manifest. No future
season ranges are extrapolated.

Results and credits load lazily to keep the expanded metadata out of the initial
homepage download. Mobile race details stack below 650px; credit text wraps and
the credits page collapses to a single column on narrow screens.
