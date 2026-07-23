const dialog = document.createElement('dialog');
dialog.className = 'about-dialog';
dialog.setAttribute('aria-labelledby', 'about-dialog-title');
dialog.innerHTML = `
  <div class="about-dialog-card">
    <header class="about-dialog-header">
      <div>
        <h1 id="about-dialog-title">Can AI one-shot implement Beetbox? 🥁</h1>
        <p>screen recording --&gt; [AI] --&gt; webapp?</p>
      </div>
      <button class="about-dialog-close" type="button" aria-label="Close About Beetbox Eval Arena">Close</button>
    </header>

    <section class="about-dialog-content">
      <section class="landing-prompt" aria-labelledby="prompt-heading">
        <h1 class="prompt-section-title">The Prompt</h1>
        <video controls playsinline preload="metadata" poster="reference/beetbox_frames/second_00.jpg" src="reference/beetbox.mov"></video>
        <div class="landing-prompt-copy">
          <h2 id="prompt-heading">Prompt</h2>
          <p>Recreate the Beetbox web app shown in <code>beetbox.mov</code> and <code>beetbox_frames/</code> as faithfully as possible. Work autonomously and place the complete implementation in the current directory.</p>
        </div>
        <p class="prompt-note">The video comes from <a href="https://www.kimi.com/blog/kimi-k3">Kimi K3's release post</a>. I kept the text prompt minimal and also supplied one screenshot per second, so models without video input received a consistent visual reference while video-capable models could use the full clip.</p>

        <section class="runner-notes" aria-labelledby="runner-heading">
          <h2 id="runner-heading">Runners</h2>
          <p><strong>GPT models</strong> Codex CLI</p>
          <p><strong>Claude models</strong> Claude Code</p>
          <p><strong>MiniMax, Qwen, and Kimi</strong> OpenCode</p>
        </section>

        <section class="judging-notes" aria-labelledby="judging-heading">
          <h2 id="judging-heading">How I judged the columns</h2>
          <div>
            <h3>Audio</h3>
            <p>My rating considers both whether audio works and whether the instruments, balance, and musical behavior sound convincing. A functioning but poor-sounding result can still receive yellow.</p>
          </div>
          <div>
            <h3>Visual prompt analysis</h3>
            <p>This is my best judgment of whether the model read the visual details correctly. One useful check is the lead pad: <code>C+</code> and <code>A+</code> indicate notes an octave higher, but some models appear to have mistaken them for C-sharp and A-sharp.</p>
          </div>
          <div>
            <h3>Music</h3>
            <p>This rating focuses on whether the written notes are actually played at the correct pitches. Green means the notes are correct, yellow means the result is broadly similar but mistuned or inconsistently transcribed, and red means the musical result fails. Sound quality is judged separately under Audio.</p>
          </div>
          <p class="rating-key"><i class="pass"></i> strong <i class="warn"></i> partial <i class="fail"></i> failed</p>
        </section>

        <section class="evaluation-notes" aria-labelledby="evaluation-heading">
          <h2 id="evaluation-heading">Other potential evaluation criteria</h2>
          <div class="evaluation-item">
            <h3>Does it work?</h3>
            <p>It should make sound, and the sequencer, tempo, swing, and volume controls should actually work.</p>
          </div>
          <div class="evaluation-item">
            <h3>Did it read the reference correctly?</h3>
            <p>On the lead channel, steps 13 and 16 appear to be <code>C+</code> and <code>A+</code>—an octave up—not C-sharp and A-sharp. That small detail is a useful image-understanding test.</p>
          </div>
          <div class="evaluation-item">
            <h3>How does it sound?</h3>
            <p>Are the 12 sounds musically convincing and balanced? Overall loudness and per-instrument levels matter: a very quiet mix or one instrument disappearing is still a product flaw.</p>
          </div>
          <div class="evaluation-item">
            <h3>What did it invent?</h3>
            <p>The ASCII visualization is subjective, so its complexity and character matter. I also listen for whether DARKROOM, GREASE, BACKSTREET, DAYLIGHT, and ACID produce convincing, distinct rhythms suggested by their names.</p>
          </div>
        </section>
      </section>
    </section>
  </div>`;

document.body.append(dialog);

let opener = null;

document.querySelectorAll('[data-about-open]').forEach((button) => {
  button.addEventListener('click', () => {
    opener = button;
    dialog.showModal();
    dialog.querySelector('.about-dialog-close').focus();
  });
});

dialog.querySelector('.about-dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());
