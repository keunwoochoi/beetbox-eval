(() => {
  if (window.__beetboxAudioFocusInstalled) return;
  window.__beetboxAudioFocusInstalled = true;

  const focusMessage = 'beetbox:audio-focus';
  const suspendMessage = 'beetbox:audio-suspend';
  const focusId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = isIOS || /Android|Mobile/i.test(navigator.userAgent);

  // There is only one preview on phones. Keep its audio graph completely
  // untouched and instead resume every newly-created context immediately,
  // while the tap that created it still owns browser user activation.
  if (isMobile) {
    const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
    if (!NativeAudioContext) return;
    const mobileContexts = new Set();
    const unlockedContexts = new WeakSet();

    function unlockContext(context) {
      if (context.state === 'closed') return;
      if (context.state !== 'running') context.resume().catch(() => {});
      if (unlockedContexts.has(context)) return;
      try {
        const source = context.createBufferSource();
        const gain = context.createGain();
        gain.gain.value = 0;
        source.buffer = context.createBuffer(1, 1, context.sampleRate);
        source.connect(gain);
        gain.connect(context.destination);
        source.start(0);
        unlockedContexts.add(context);
      } catch {
        // The next tap retries.
      }
    }

    function MobileAudioContext(...args) {
      const context = Reflect.construct(NativeAudioContext, args);
      mobileContexts.add(context);
      context.addEventListener?.('statechange', () => {
        if (context.state === 'closed') mobileContexts.delete(context);
      });
      unlockContext(context);
      return context;
    }

    MobileAudioContext.prototype = NativeAudioContext.prototype;
    Object.setPrototypeOf(MobileAudioContext, NativeAudioContext);
    window.AudioContext = MobileAudioContext;
    window.webkitAudioContext = MobileAudioContext;

    function unlockMobileAudio() {
      for (const context of mobileContexts) unlockContext(context);
    }

    function unlockAfterApplicationHandler() {
      unlockMobileAudio();
      queueMicrotask(unlockMobileAudio);
    }

    window.addEventListener('pointerdown', unlockAfterApplicationHandler, true);
    window.addEventListener('pointerup', unlockAfterApplicationHandler, true);
    window.addEventListener('touchend', unlockAfterApplicationHandler, true);
    window.addEventListener('click', unlockAfterApplicationHandler, true);
    window.addEventListener('keydown', unlockAfterApplicationHandler, true);
    return;
  }

  // Safari can leave a user-started AudioContext silent when it belongs to an
  // embedded document, even though the same page works at the top level. On
  // same-origin arena builds, create the implementation's contexts in the top
  // document instead. Do not install the muting shim in this mode: reliable
  // playback is more important than automatic focus on Apple WebKit.
  const isAppleWebKit = navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit/i.test(navigator.userAgent);
  if (isAppleWebKit && !isIOS && window.top !== window) {
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
  const unlockedContexts = new WeakSet();

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
      if (!unlockedContexts.has(context) && context.state !== 'closed') {
        try {
          const source = context.createBufferSource();
          const gain = context.createGain();
          gain.gain.value = 0;
          source.buffer = context.createBuffer(1, 1, context.sampleRate);
          source.connect(gain);
          gain.connect(context.destination);
          source.start(0);
          unlockedContexts.add(context);
        } catch {
          // A later gesture will retry if the context is not ready yet.
        }
      }
      const gain = focusGains.get(context);
      if (gain) gain.gain.setTargetAtTime(1, context.currentTime, 0.005);
    }
    window.parent.postMessage({ type: focusMessage, focusId }, '*');
  }

  function claimAfterApplicationHandler() {
    claimAudioFocus();
    queueMicrotask(claimAudioFocus);
  }

  window.addEventListener('pointerdown', claimAfterApplicationHandler, true);
  window.addEventListener('pointerup', claimAfterApplicationHandler, true);
  window.addEventListener('touchend', claimAfterApplicationHandler, true);
  window.addEventListener('click', claimAfterApplicationHandler, true);
  window.addEventListener('keydown', claimAfterApplicationHandler, true);
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
