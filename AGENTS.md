# Repository guide for coding agents

## Project structure

- `prompt/` contains the canonical prompt, reference video, and extracted frames used for evaluation runs.
- Each model-named top-level directory contains one implementation produced by a coding agent. Treat these as preserved evaluation artifacts and do not modify them unless the user explicitly requests work on that run.
- `viewer/` contains the arena interface, metadata, shared audio bridge, and local preview server.
- `viewer/runs.mjs` is the canonical run catalog used by both local development and static export.
- `scripts/export-pages.mjs` generates the deployable `_site/` directory.
- `.github/workflows/pages.yml` exports and deploys the arena to GitHub Pages.

## Local development

Run the arena locally with:

```bash
cd viewer
npm install
npm start
```

Then open <http://localhost:4000/>.

The local viewer starts implementations on separate preview ports. Local cross-port behavior can differ from the same-origin GitHub Pages export, especially for iframe audio.

## Static export and deployment

Generate the GitHub Pages output with:

```bash
npm run export-pages
```

The exporter recreates `_site/`, copies viewer assets and model implementations, rewrites root-relative asset paths, injects `viewer/audio-focus.js` into exported run pages, and generates static `runs.json` metadata.

Do not fix deployment by editing only `_site/`; it is generated and will be replaced. Make changes in `viewer/`, the relevant model directory, or `scripts/export-pages.mjs`, then run the exporter.

Pushes to `main` trigger the GitHub Pages workflow.

## Arena behavior

- Desktop uses a persistent model catalog and can optionally show the reference capture.
- Mobile uses a modal model picker, remains in solo mode, and does not show the reference.
- Preview sizing respects per-run `previewWidth` metadata in `viewer/runs.mjs`; do not assume every implementation uses the default width.
- `viewer/audio-focus.js` is shared infrastructure for iframe audio focus, mobile AudioContext activation, and visibility-based audio suspension.
- `viewer/site-header.js` provides the shared top header for arena pages.
- `viewer/about-dialog.js` provides the About content and interaction.

## Editing principles

- Keep the arena focused on the implementations. Do not add explanatory labels, status indicators, guides, duplicate selectors, secondary descriptions, or new controls unless the user explicitly asks for them.
- Prefer removing redundant interface elements over explaining them.
- Preserve the distinction between generated model artifacts and shared arena infrastructure.
- Do not normalize, repair, or improve an evaluated model result merely to make it compare better.
- Keep `viewer/index.html` and `viewer/arena.html` consistent where they intentionally share layout and assets.
- When editing Markdown, do not hard-wrap prose inside sentences. Use line breaks only at structural boundaries.
