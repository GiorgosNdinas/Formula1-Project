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
