(() => {
  if (window.__beetboxAudioFocusInstalled) return;
  window.__beetboxAudioFocusInstalled = true;

  const focusMessage = 'beetbox:audio-focus';
  const suspendMessage = 'beetbox:audio-suspend';
  const focusId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  // Safari can leave a user-started AudioContext silent when it belongs to an
  // embedded document, even though the same page works at the top level. On
  // same-origin arena builds, create the implementation's contexts in the top
  // document instead. Do not install the muting shim in this mode: reliable
  // playback is more important than automatic focus on Apple WebKit.
  const isAppleWebKit = navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit/i.test(navigator.userAgent);
  if (isAppleWebKit && window.top !== window) {
    try {
      if (window.top.location.origin === window.location.origin) {
        const TopAudioContext = window.top.AudioContext || window.top.webkitAudioContext;
        if (TopAudioContext) {
          function TopLevelAudioContext(...args) {
            return Reflect.construct(TopAudioContext, args);
          }
          TopLevelAudioContext.prototype = TopAudioContext.prototype;
          Object.setPrototypeOf(TopLevelAudioContext, TopAudioContext);
          window.AudioContext = TopLevelAudioContext;
          window.webkitAudioContext = TopLevelAudioContext;
          return;
        }
      }
    } catch {
      // Local previews use different ports and fall through to message-based focus.
    }
  }

  const contexts = new Set();
  const focusGains = new Map();

  const audioNodePrototype = window.AudioNode?.prototype;
  const nativeConnect = audioNodePrototype?.connect;

  function focusGainFor(context) {
    if (!context || !nativeConnect) return null;
    if (focusGains.has(context)) return focusGains.get(context);
    const gain = context.createGain();
    gain.gain.value = 1;
    nativeConnect.call(gain, context.destination);
    focusGains.set(context, gain);
    return gain;
  }

  function rememberContext(context) {
    if (!context || contexts.has(context)) return;
    contexts.add(context);
    context.addEventListener?.('statechange', () => {
      if (context.state !== 'closed') return;
      contexts.delete(context);
      focusGains.delete(context);
    });
  }

  // Route each graph through a unity-gain focus control. Muting this node keeps
  // AudioContext running and avoids Safari's unreliable suspend/resume cycle.
  if (nativeConnect) {
    audioNodePrototype.connect = function connect(...args) {
      const context = this.context || args[0]?.context;
      rememberContext(context);
      if (context && args[0] === context.destination) args[0] = focusGainFor(context);
      return nativeConnect.apply(this, args);
    };
  }

  function claimAudioFocus() {
    for (const context of contexts) {
      if (!['running', 'closed'].includes(context.state)) context.resume().catch(() => {});
      const gain = focusGains.get(context);
      if (gain) gain.gain.setTargetAtTime(1, context.currentTime, 0.005);
    }
    window.parent.postMessage({ type: focusMessage, focusId }, '*');
  }

  window.addEventListener('pointerdown', claimAudioFocus, true);
  window.addEventListener('pointerup', claimAudioFocus, true);
  window.addEventListener('touchend', claimAudioFocus, true);
  window.addEventListener('click', claimAudioFocus, true);
  window.addEventListener('keydown', claimAudioFocus, true);
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.type !== suspendMessage) return;
    const isActive = event.data.focusId === focusId;
    for (const context of contexts) {
      const gain = focusGains.get(context);
      if (gain) gain.gain.setTargetAtTime(isActive ? 1 : 0, context.currentTime, 0.005);
    }
    if (!isActive) {
      for (const media of document.querySelectorAll('audio, video')) media.pause();
    }
  });
})();
