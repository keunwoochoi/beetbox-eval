# Beetbox Model Arena

[Beetbox Model Arena](https://keunwoochoi.github.io/beetbox-eval/) is an independent experiment in visual-to-code reconstruction. It compares interactive web implementations produced by different coding models from the same short prompt and the same 19-second reference video.

**This is an independent educational and research project. It is not affiliated with, endorsed by, or sponsored by Kimi or Moonshot AI.**

---

# Tech Report: Making Beetbox Eval Arena

@keunwoochoi, July 2026

I saw a short screen recording of Beetbox in the [Kimi K3 release post](https://www.kimi.com/blog/kimi-k3), but without any interactive demo. Well... If they could prompt, I can prompt it too. Even better that I have a working video of the app.

So I gave several coding agents the same screen recording, screenshots extracted at one-second intervals, and a short prompt. They generated a bunch of webapps.

Then I realized the responsibility as a human... to judge them! *cough cough taste is the moat cough cough*, so I did it.  Perhaps that simple eval is my biggest contribution to this webpage.

A K=1 trial is noisy, but I found the task useful for me. This beetbox app exposes several different capabilities: visual understanding, frontend implementation, audio synthesis, musical interpretation, interaction design, and the ability to finish a working product without detailed instructions.

**[Open the Beetbox Eval Arena](https://keunwoochoi.github.io/beetbox-eval/)**

## 1. The original input

Each agent received:

1. The 19-second Beetbox screen recording from the Kimi K3 release post (poorly trimmed by me)
2. Screenshots extracted from the recording at one frame per second
3. One short text prompt



### 1.1 Video and extracted frames



**▶ Watch the 19-second prompt video**



### 1.2 Prompt

> Recreate the Beetbox web app shown in `beetbox.mov` and `beetbox_frames/` as faithfully as possible. Work autonomously and place the complete implementation in the current directory.

I added the extracted frames because not every model or coding-agent environment may be able to directly process a video.

One exception: GPT-5.6 Luna received a retry after its first implementation did not produce sound. For the retry, I added one sentence: “It should produce sound.” (Now that I think about it, I am not sure if that was fair.)

## 2. It became a personal vibe check

There are many small prompts people use to get a quick sense of a generative model. “An astronaut riding a horse” became a familiar image-generation example. Simon Willison uses “[Generate an SVG of a pelican riding a bicycle](https://simonwillison.net/2025/Jun/6/six-months-in-llms/)” as a lightweight benchmark for coding-capable LLMs.



Examples from [Simon Willison’s pelican benchmark](https://simonwillison.net/2025/Jun/6/six-months-in-llms/) and the [TensorFlow Stable Diffusion tutorial](https://www.tensorflow.org/tutorials/generative/generate_images_with_stable_diffusion).



Unlike these images, an beetbox app is not as universally or immediately readable. You need to spend some time with each result. That said, these details are very interesting if you care about music or audio like me. Completing it reasonably well requires several capabilities at once:

- **Image understanding:** Reading an interface from a video and screenshots
- **Music:** Implementing a functional step sequencer
- **Music:** Reading and interpreting musical notation
- **Audio and music:** Producing sound rather than only visual playback
- **Audio and music:** Making tempo, swing, volume, muting, presets, and playback work together
- **Product and frontend:** Inferring interactions that are not fully demonstrated or specified

## 3. Models and coding agents

These are individual runs produced with different combinations of models, effort settings, and coding tools.


| Model               | Effort  | Coding tool | Input price ($/M tokens) |
| ------------------- | ------- | ----------- | ------------------------ |
| GPT-5.6 Sol         | xhigh   | Codex CLI   | 5                        |
| GPT-5.6 Sol         | medium  | Codex CLI   | 5                        |
| GPT-5.6 Terra       | high    | Codex CLI   | 2.5                      |
| GPT-5.6 Luna        | high    | Codex CLI   | 1                        |
| GPT-5.4             | default | Codex CLI   | 2.5                      |
| GPT-5.4 Mini        | default | Codex CLI   | 0.75                     |
| GPT-5.3 Codex Spark | default | Codex CLI   | 1.75                     |
| Claude Fable 5      | xhigh   | Claude Code | 10                       |
| Claude Opus 5       | xhigh   | Claude Code | 5                        |
| Claude Opus 5       | medium  | Claude Code | 5                        |
| Claude Opus 5       | low     | Claude Code | 5                        |
| Claude Opus 4.8     | xhigh   | Claude Code | 5                        |
| Claude Sonnet 5     | high    | Claude Code | 3                        |
| Claude Haiku 4.5    | default | Claude Code | 1                        |
| MiniMax M3          | default | OpenCode    | 0.6                      |
| Qwen3.7 Plus        | default | OpenCode    | 0.4                      |
| Kimi K3             | default | OpenCode    | 3                        |


The prices are the official prices and I didn't actually measure the token cost of each version.

## 4. Evaluation

The arena currently shows three manually judged columns, simply labeled as green / yellow / red.

### 4.1 Audio

Audio asks whether sound works and whether the instruments, levels, balance, and behavior make a convincing audio product.

- **Green:** Sound works and is reasonably well implemented.
- **Yellow:** Sound works, but there are noticeable quality, balance, or instrument problems.
- **Red:** Sound is absent or substantially broken.

The observed issues span from simply no sound to low volume or some detailed yet critical issue such as a overwhelmingly loud hi-hat sounds.

### 4.2 Visual prompt analysis

Visual Prompt Analysis asks whether the agent correctly understood important information shown in the recording and extracted frames.

- **Green:** Important visual details were read correctly.
- **Yellow:** Most were understood, with some likely mistakes.
- **Red:** Important details were substantially misunderstood.

One concrete example is the lead row. At beats 13 and 16, the recording shows `C+` and `A+`, which appear to mean notes one octave higher. Some agents seem to have read these as `C#` and `A#`.

### 4.3 Musicality

Musicality asks whether the notes shown in the sequencer are actually played at the expected pitches and tuning.

- **Green:** The relevant notes and pitches are correct.
- **Yellow:** The result is broadly similar but contains pitch or tuning errors.
- **Red:** The musical output is missing or substantially incorrect.

I intentioanally distinguished this from Audio. As an example, a lead can play the wrong pitch (low musicality) with a perfectly functional synthesizer (high audio score). A sequencer can play all the correct notes (high musicality) while using an extremely unpleasant hi-hat sound (low audio score). 

## 5. Other aspects I didn't evaluate

### 5.1 Functional controls

Playback, tempo, swing, volume, track muting, sequencer cells, and presets should work. A reconstruction that only resembles the recording visually is incomplete.

### 5.2 Preset interpretation

The recording includes presets named Darkroom, Grease, Backstreet, Daylight, and Acid.

Are the presets meaningfully different? Does Acid resemble an acid-oriented rhythm or timbre? What does an agent infer from a less literal name such as Daylight? Are the resulting patterns musically plausible? This would interesting, definitely much more subjective though. 

### 5.3 ASCII visualization

On top of the MIDI-like notes, the reference contains a visualization made from ASCII characters. A result can be judged by whether it reacts to playback, whether it resembles the original, whether it is merely random decoration, and whether it is aesthetically interesting.

### 5.4 Product completeness

Small details distinguish a working product from a screenshot reconstruction:

- Sensible default volume
- Reasonably normalized instruments
- No unexpectedly dominant sound
- Controls that update their displayed values
- Reliable playback after repeated interactions
- A usable layout across browsers and screen sizes

## 6. Discussion - Faithfulness versus interpretation

Comparing GPT-5.6 Sol at xhigh effort with Claude Fable 5 made one commonly reported difference between GPT and Claude much clearer to me.

GPT was more religious about following the input. Its ASCII visualization, in particular, closely reconstructed what was visible in the recording. Fable took more freedom. Its gradients are smoother, more complicated, and honestly very cool, but less literal. Opus showed a similar tendency.

Which behavior is better depends on what the user wants. For this reconstruction task, GPT’s restraint was probably preferable: an attractive addition can still be an error when it was not requested. For a less specified task, Claude’s willingness to assume more and exercise its own taste may produce the more interesting result. Sometimes it behaves as if it knows what would make the product better than the user does. Sometimes it may actually be right. Other times, that is precisely the problem.

## 7. Closing

At the end, you learn much more by actually using something and trying to make something yourself. Still true even if I use coding agents extensively for my work. So I'd suggest - try these models! Make something that you actually care about (and judge them!)

**[Open the Beetbox Eval Arena](https://keunwoochoi.github.io/beetbox-eval/)**