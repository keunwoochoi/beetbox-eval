# BEETBOX — beat sequencing · channel desk

A faithful recreation of the Beetbox web app shown in `beetbox.mov` /
`beetbox_frames/`. Single self-contained file, no dependencies, no build step.

## Run

Open `index.html` in any modern browser (double-click, or serve it):

```sh
open index.html            # macOS
# or
python3 -m http.server     # then visit http://localhost:8000
```

Click anywhere once so the browser allows audio, then press **PLAY** (or hit
**Space**).

## What's inside

- **Transport** — PLAY/STOP, TEMPO (70–170 BPM), SWING (0–60 %), VOLUME
  (0–100, default 90), and an ON AIR lamp that lights up blue and pulses on
  the beat while playing.
- **Channel presets** — `CH·10 DARKROOM` and `CH·50 ACID` are transcribed
  step-for-step (and note-for-note) from the video, including their tempo and
  swing settings (132 BPM / 0 % and 140 BPM / 8 %). `GREASE`, `BACKSTREET`
  and `DAYLIGHT` are built in the same spirit (funk / boom-bap / house).
- **CLEAR / RANDOM** — wipe or randomize the pattern (keeps tempo/swing,
  deselects the preset chip, exactly as in the video).
- **ASCII visualizer** — a 64×16 character field of flowing `/ ( ) + - *`
  waves in steel blues with sparse cyan accents. Every scheduled hit fires a
  glyph burst (`⬢ ● # K ▲ *`) at the playhead's horizontal position and the
  track's vertical position, fading over ~half a second. Click the field to
  splash a burst by hand.
- **Sequencer** — 12 tracks × 16 steps. Drum cells toggle white; the two
  melodic tracks (Lead, Bass) cycle through the A-minor-pentatonic ladder
  `A C D E G A⁺ C⁺` on click (right-click steps the pitch down), rendered as
  a grayscale ramp that brightens with pitch. Clicking a track name mutes it.
  The playhead tints the current column light blue (cyan on active cells) and
  highlights the current step number.
- **LOOP REC + keys** — a 7-key pentatonic keyboard (`A S D F G H J`) that
  plays the LEAD or BASS voice; with LOOP REC armed while playing, key hits
  are written into the pattern at the current step, live-looper style.
- **Audio** — all 12 voices are synthesized with the Web Audio API (no
  samples): sine-drop kick, noise/bandpass snare & clap, filtered-noise hats,
  shaker, rimshot, tom, dual-square cowbell, long-tail crash, saw+sub acid
  bass with a filter sweep, and a detuned square lead through a feedback
  delay. A lookahead scheduler drives the 16th-note clock with per-offbeat
  swing.

## Keyboard shortcuts

| Key            | Action                              |
|----------------|-------------------------------------|
| `Space`        | play / stop                         |
| `A S D F G H J`| play (and loop-record) scale notes  |
