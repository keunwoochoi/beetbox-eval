# Beetbox Model Arena

Beetbox Model Arena is an independent experiment in visual-to-code reconstruction. It compares interactive web implementations produced by different coding models from the same short prompt and the same 19-second reference video.

**This is an independent educational and research project. It is not affiliated with, endorsed by, or sponsored by Kimi or Moonshot AI.**

## Motivation

The experiment was inspired by the Beetbox showcase in the [Kimi K3 release blog](https://www.kimi.com/blog/kimi-k3). The public showcase demonstrated the interface through video, but I wanted to explore what the implied product might feel like as an interactive, sound-producing web app.

I gave several coding models the visual reference plus one deliberately short instruction:

> Recreate the Beetbox web app shown in `beetbox.mov` and `beetbox_frames/` as faithfully as possible. Work autonomously and place the complete implementation in the current directory.

The arena preserves the resulting implementations and makes it possible to compare them beside the original capture. This is a qualitative exploration rather than a controlled benchmark: model versions, reasoning settings, harnesses, and agent behavior all affect the outcome.

## Live arena

[Open Beetbox Model Arena](https://keunwoochoi.github.io/beetbox-eval/)

Use **Fit** for a consistent 1454×1622 comparison canvas or **Responsive** for direct interaction. Browser audio begins only after user interaction.

## Run locally

```bash
cd viewer
npm install
npm start
```

Then open <http://localhost:4000/>. The local server starts each implementation on a separate preview port and reports its status to the arena.

## Export the GitHub Pages site

```bash
npm run export-pages
```

The exporter creates `_site/`, converts the preview servers to same-origin static paths, includes one canonical copy of the reference media, and omits development dependencies and duplicated evaluation inputs. Pushes to `main` deploy `_site/` through `.github/workflows/pages.yml`.

## Repository layout

- `prompt/`: canonical prompt, reference capture, and extracted frames
- `viewer/`: local arena UI and preview-server orchestrator
- `scripts/export-pages.mjs`: static GitHub Pages exporter
- Model-named directories: implementation artifacts produced by each evaluated model and harness

## Source and attribution

The Beetbox reference capture originates from the [Kimi K3 release blog](https://www.kimi.com/blog/kimi-k3) and is included here solely as source material for this independent evaluation and commentary. Beetbox, Kimi, Moonshot AI, and associated names and visual materials belong to their respective owners. The reconstructed implementations are experimental outputs and should not be understood as official Beetbox implementations.
