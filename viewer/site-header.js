const headerMarkup = `
  <div class="brand">
    <a class="brand-home" href="index.html" aria-label="Beetbox Eval Arena home">
      <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
      <strong>BEETBOX EVAL ARENA</strong>
    </a>
    <span class="brand-byline">by <a href="https://keunwoochoi.github.io/">Keunwoo Choi</a><span aria-hidden="true">|</span><a href="https://github.com/keunwoochoi/beetbox-eval">Source code</a></span>
  </div>`;

document.querySelectorAll('[data-site-header]').forEach((header) => {
  header.innerHTML = headerMarkup;
});
