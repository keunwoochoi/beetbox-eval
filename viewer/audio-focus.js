(() => {
  if (window.__beetboxAudioFocusInstalled) return;
  window.__beetboxAudioFocusInstalled = true;

  const focusMessage = 'beetbox:audio-focus';
  const suspendMessage = 'beetbox:audio-suspend';
  const contexts = new Set();

  function rememberContext(context) {
    if (!context || contexts.has(context)) return;
    contexts.add(context);
    context.addEventListener?.('statechange', () => {
      if (context.state === 'closed') contexts.delete(context);
    });
  }

  // Discover contexts when their native audio graphs are connected instead of
  // replacing AudioContext itself. Safari is particularly sensitive to Web
  // Audio constructor shims, while every audible graph eventually connects an
  // AudioNode to another node or to the destination.
  const audioNodePrototype = window.AudioNode?.prototype;
  const nativeConnect = audioNodePrototype?.connect;
  if (nativeConnect) {
    audioNodePrototype.connect = function connect(...args) {
      rememberContext(this.context);
      rememberContext(args[0]?.context);
      return nativeConnect.apply(this, args);
    };
  }

  function claimAudioFocus() {
    for (const context of contexts) {
      if (!['running', 'closed'].includes(context.state)) context.resume().catch(() => {});
    }
    window.parent.postMessage({ type: focusMessage }, '*');
  }

  window.addEventListener('pointerdown', claimAudioFocus, true);
  window.addEventListener('pointerup', claimAudioFocus, true);
  window.addEventListener('touchend', claimAudioFocus, true);
  window.addEventListener('click', claimAudioFocus, true);
  window.addEventListener('keydown', claimAudioFocus, true);
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.type !== suspendMessage) return;
    for (const context of contexts) {
      if (context.state === 'running') context.suspend().catch(() => {});
    }
    for (const media of document.querySelectorAll('audio, video')) media.pause();
  });
})();
