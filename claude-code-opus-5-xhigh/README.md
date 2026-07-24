# BEETBOX — beat sequencing · channel desk.

A 16-step, 12-channel drum machine with two melodic voices, a reactive ASCII
channel-scope, and a fully synthesised (no samples) Web Audio engine.

Open `index.html` in a browser. No build step, no dependencies.

## Files

| file | what it holds |
| --- | --- |
| `index.html` | markup shell |
| `styles.css` | the whole visual system |
| `app.js` | model, presets, synth voices, scheduler, ASCII field |

## Playing it

- **Space** — play / stop.
- **Click a cell** to write a beat. On the **Lead** and **Bass** rows a click
  cycles the pitch up through `A C D E G A⁺ C⁺` and off again; **right-click**
  cycles it down.
- **Click a track name** to mute / unmute that channel.
- **A S D F G H J** play the seven pitches. With **LOOP REC** armed they are
  written into whichever row the **LEAD / BASS** switch is pointing at, at the
  step the playhead is on.
- **CH·10 … CH·50** load presets (each carries its own tempo and swing).
  **CLEAR** empties the grid, **RANDOM** rolls a new one.
- **TEMPO** 70–170 BPM, **SWING** 0–60 % (delays the off-16ths), **VOLUME** 0–100.

## How it works

**Scheduler.** A `setInterval` tick looks ~120 ms ahead and schedules every step
that falls inside the window against `AudioContext.currentTime`, pushing
`{step, time, hits}` onto a queue. A `requestAnimationFrame` loop pops that queue
to move the playhead, so the UI follows the audio clock rather than wall time.

**Voices.** Every channel is built from oscillators and a shared white-noise
buffer — a pitch-swept sine for the kick, filtered noise plus a body tone for
the snare, three staggered noise bursts for the clap, and so on. Lead is a
square/saw pair through a sweeping low-pass; Bass is a saw plus a sub sine.
Everything lands on a master gain into a compressor.

**Channel-scope.** The field is a 38 × 14 character grid drawn to a canvas at
~16 fps. Each cell picks a glyph and colour from one ramp
(`- + / ( ) * ▴ K ▲ # ⬢ ⬣`) driven by a value: three layers of sheared value
noise for the resting texture, plus a heat buffer. While the transport runs, a
cursor tracks the playhead horizontally and drifts upward at ~10 rows/second,
injecting a radial pulse whose strength scales with how many channels fired on
the current step — which is what makes the bright `K`/`#`/hexagon blooms trail
across the field in time with the pattern.
