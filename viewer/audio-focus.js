(() => {
  if (window.__beetboxAudioFocusInstalled) return;
  window.__beetboxAudioFocusInstalled = true;

  const focusMessage = 'beetbox:audio-focus';
  const suspendMessage = 'beetbox:audio-suspend';
  const contexts = new Set();

  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const NativeAudioContext = window[name];
    if (!NativeAudioContext) continue;

    function ArenaAudioContext(...args) {
      const context = new NativeAudioContext(...args);
      contexts.add(context);
      context.addEventListener?.('statechange', () => {
        if (context.state === 'closed') contexts.delete(context);
      });
      return context;
    }

    ArenaAudioContext.prototype = NativeAudioContext.prototype;
    Object.setPrototypeOf(ArenaAudioContext, NativeAudioContext);
    window[name] = ArenaAudioContext;
  }

  function claimAudioFocus() {
    window.parent.postMessage({ type: focusMessage }, '*');
    for (const context of contexts) {
      if (!['running', 'closed'].includes(context.state)) context.resume().catch(() => {});
    }
  }

  window.addEventListener('pointerdown', claimAudioFocus, true);
  window.addEventListener('keydown', claimAudioFocus, true);
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.type !== suspendMessage) return;
    for (const context of contexts) {
      if (context.state === 'running') context.suspend().catch(() => {});
    }
    for (const media of document.querySelectorAll('audio, video')) media.pause();
  });
})();
