/* SAGE ONE — Voice system.
   - LISTEN: Web Speech API STT (voice → text), en-IN / ne-NP depending on app language.
   - SPEAK: speechSynthesis TTS (text → voice), with watchdog so the UI never sticks.
   - WAKE STANDBY: opt-in "SAGE …" wake word with a visible disclosure (browser speech
     service hears audio while standby is ON — never silent, never secret).
   - VOICE COMMANDS: spoken phrases that CHANGE the app — theme, language, name, screen
     navigation, Spark balance, mute, and "SAGE, stop" (halts listening, speech, wake and
     any in-flight AI reveal).
   - Anything that is not a command becomes a chat message (owner sign-in rule unchanged:
     live chat requires SAGE Core sign-in, exactly like typed chat).
   Honesty: unsupported browser → explicit UNAVAILABLE state, never a fake mic or answer. */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const TTS = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';

  const V = S.voice = {
    supported: !!SR,
    ttsSupported: TTS,
    state: 'idle',      // idle | listening | thinking | speaking | unavailable
    muted: false,       // spoken replies off (mic keeps working)
    wake: false,        // wake-word standby (explicit opt-in)
    wakeArmed: false,
    lastError: null
  };

  /* ================= copy (English + Nepali) ================= */
  const L = {
    tap:       { en: 'TAP TO SPEAK',            ne: 'बोल्न ट्याप गर्नुहोस्' },
    listening: { en: 'LISTENING…',              ne: 'सुनिँदैछ…' },
    armed:     { en: 'GO AHEAD — I’M LISTENING', ne: 'भन्नुहोस् — म सुनिँदैछु' },
    thinking:  { en: 'SAGE IS THINKING…',       ne: 'SAGE सोचिँदैछ…' },
    speaking:  { en: 'SAGE IS SPEAKING',        ne: 'SAGE बोलिँदैछ' },
    speakStop: { en: 'TAP ■ TO INTERRUPT',      ne: 'रोक्न ■ ट्याप गर्नुहोस्' },
    listenStop:{ en: 'SPEAK NOW · ■ TO STOP',   ne: 'बोल्नुहोस् · रोक्न ■' },
    standby:   { en: 'SAY “SAGE” + YOUR COMMAND', ne: '“SAGE” भनेर आदेश दिनुहोस्' },
    mutedSub:  { en: 'REPLIES MUTED · MIC ON',  ne: 'जवाफ मौन · माइक चालु' },
    unavail:   { en: 'VOICE UNAVAILABLE',       ne: 'आवाज उपलब्ध छैन' },
    unavDesc:  { en: 'This browser has no speech input. Chrome or Edge required — typed chat still works.',
                 ne: 'यो ब्राउजरमा आवाज इनपुट छैन। Chrome वा Edge चाहिन्छ — टाइप गरेर च्याट गर्न सकिन्छ।' },
    denied:    { en: 'Microphone permission denied. Allow the mic to talk to SAGE.',
                 ne: 'माइक्रोफोन अनुमति दिइएन। SAGE सँग कुरा गर्न माइक अनुमति दिनुहोस्।' },
    netFail:   { en: 'Speech service unreachable — check your connection. Typed chat still works.',
                 ne: 'आवाज सेवा पहुँचमा छैन — इन्टरनेट जाँच गर्नुहोस्।' },
    noTts:     { en: 'Speech output unavailable — replies will stay on screen.',
                 ne: 'आवाज आउँदैन — जवाफ स्क्रिनमा मात्र देखिन्छ।' },
    wakeOn:    { en: 'Wake standby ON — say “SAGE” first. While on, your browser’s speech service receives audio.',
                 ne: 'वेक स्ट्यान्डबाइ चालु — पहिले “SAGE” भन्नुहोस्। चालु रहँदा ब्राउजरको आवाज सेवामा अडियो जान्छ।' },
    wakeOff:   { en: 'Wake standby OFF',        ne: 'वेक स्ट्यान्डबाइ बन्द' },
    stopped:   { en: 'Voice stopped · wake off', ne: 'आवाज रोकियो · वेक बन्द' },
    yes:       { en: 'Yes? Go ahead.',          ne: 'हजुर? भन्नुहोस्।' },
    signIn:    { en: 'Please sign in with your Google account to use live chat.',
                 ne: 'लाइभ च्याटको लागि आफ्नो गुगल खाताले साइन इन गर्नुहोस्।' },
    noChange:  { en: 'Tell me what to change: theme to dark, light or blue — language to Nepali or English — your name — or a screen like “open settings”.',
                 ne: 'के बदल्ने भन्नुहोस्: थिम (डार्क/लाइट/ब्लु) — भाषा (नेपाली/अंग्रेजी) — नाम — वा स्क्रिन जस्तै “सेटिङ खोल”।' },
    themeDark: { en: 'Dark theme applied.',     ne: 'गाढा थिम लागू भयो।' },
    themeLight:{ en: 'Light theme applied.',    ne: 'हल्का थिम लागू भयो।' },
    themeBlue: { en: 'Blue theme applied.',     ne: 'निलो थिम लागू भयो।' },
    langNe:    { en: 'Language switched to Nepali.', ne: 'भाषा नेपालीमा बदलियो।' },
    langEn:    { en: 'Language switched to English.', ne: 'भाषा अंग्रेजीमा बदलियो।' },
    nameSet:   { en: n => 'Name changed to ' + n + '.', ne: n => 'नाम ' + n + ' मा बदलियो।' },
    opened:    { en: r => 'Opening ' + r + '.', ne: r => r + ' खोलिँदैछ।' },
    notScreen: { en: 'That screen is not available.', ne: 'त्यो स्क्रिन उपलब्ध छैन।' },
    sparkBal:  { en: n => n + ' Spark available.', ne: n => n + ' Spark उपलब्ध छ।' },
    mutedOn:   { en: 'Voice replies muted — the mic still works.', ne: 'जवाफको आवाज बन्द — माइक चालु छ।' },
    mutedOff:  { en: 'Voice replies on.',        ne: 'जवाफको आवाज चालु।' },
    alreadyNe: { en: 'Nepali is already active.', ne: 'नेपाली पहिले नै सक्रिय छ।' },
    alreadyEn: { en: 'English is already active.', ne: 'अंग्रेजी पहिले नै सक्रिय छ।' }
  };
  function isNe() { try { return S.state().lang === 'ne'; } catch (_) { return false; } }
  function t(k, arg) {
    const e = L[k]; if (!e) return '';
    const v = isNe() && e.ne ? e.ne : e.en;
    return typeof v === 'function' ? v(arg || '') : v;
  }
  function toast(msg) { try { S.toast(msg); } catch (_) {} }

  /* ================= state / paint ================= */
  let pill = null;

  function ensurePill() {
    if (pill && document.body && document.body.contains(pill)) return pill;
    pill = document.createElement('div');
    pill.className = 'voice-pill';
    pill.id = 'voicePill';
    pill.dataset.state = V.state;
    pill.setAttribute('role', 'status');
    pill.setAttribute('aria-live', 'polite');
    pill.innerHTML =
      '<button class="vp-mic" data-act="voice-toggle" aria-label="Talk to SAGE" title="Talk to SAGE (voice in)">' + S.icon('i-mic') + '</button>' +
      '<div class="vp-text"><b id="vpLabel"></b><span id="vpSub"></span></div>' +
      '<button class="vp-chip" data-act="voice-wake" id="vpWake" aria-pressed="false" ' +
      'title="Wake-word standby: say “SAGE” then your command. While ON, your browser’s speech service receives audio.">WAKE</button>' +
      '<button class="vp-stop" data-act="voice-stop" aria-label="Stop voice" title="Stop listening, speaking and wake standby">■</button>';
    document.body.appendChild(pill);
    paint();
    return pill;
  }

  function stateLabel() {
    if (V.state === 'unavailable') return t('unavail');
    if (V.state === 'listening') return V.wakeArmed ? t('armed') : t('listening');
    if (V.state === 'thinking') return t('thinking');
    if (V.state === 'speaking') return t('speaking');
    return t('tap');
  }
  function stateSub() {
    if (V.state === 'unavailable') return isNe() ? 'Chrome वा Edge प्रयोग गर्नुहोस्' : 'Use Chrome or Edge';
    if (V.state === 'listening') return t('listenStop');
    if (V.state === 'thinking') return isNe() ? 'प्रशोधन गर्ँदैछ…' : 'Processing…';
    if (V.state === 'speaking') return t('speakStop');
    if (V.wake) return t('standby');
    if (V.muted) return t('mutedSub');
    return isNe() ? 'सधैं रोक्न ■ थिच्नुहोस्' : '■ stops everything anytime';
  }

  function paint() {
    if (!pill || !document.body || !document.body.contains(pill)) return;
    pill.dataset.state = V.state;
    const label = pill.querySelector('#vpLabel');
    const sub = pill.querySelector('#vpSub');
    const mic = pill.querySelector('.vp-mic');
    const wakeBtn = pill.querySelector('#vpWake');
    if (label) label.textContent = stateLabel();
    if (sub) sub.textContent = stateSub();
    if (mic) mic.classList.toggle('live', V.state === 'listening');
    if (wakeBtn) {
      wakeBtn.classList.toggle('on', V.wake);
      wakeBtn.setAttribute('aria-pressed', V.wake ? 'true' : 'false');
      wakeBtn.textContent = V.wake ? 'WAKE ON' : 'WAKE';
    }
    const cm = document.getElementById('voiceMic');
    if (cm) cm.classList.toggle('live', V.state === 'listening');
  }
  V.paint = paint;

  function setState(next) {
    const changed = V.state !== next;
    V.state = next;
    paint();
    if (!changed) return;
    try {
      if (S.currentRoute && S.currentRoute() === 'chat' && S.chatOrb) {
        if (next === 'listening') S.chatOrb('listening');
        else if (next === 'speaking') S.chatOrb('speaking');
        else if (next === 'thinking') S.chatOrb('thinking');
        else if (next === 'idle' && !S._chatBusy) S.chatOrbIdle();
      }
    } catch (_) {}
  }

  /* ================= TTS (text → voice) ================= */
  function cleanForSpeech(text) {
    return String(text || '')
      .replace(/[*_#>`|~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 700);
  }

  function endSpeak() {
    if (V._speakGuard) { clearTimeout(V._speakGuard); V._speakGuard = null; }
    V._curUtterance = null;
    if (!V._speaking) return;
    V._speaking = false;
    if (V.state === 'speaking') setState(V.wake && V.wakeArmed ? 'listening' : 'idle');
  }

  function speak(text) {
    if (!TTS || V.muted) return false;
    const clean = cleanForSpeech(text);
    if (!clean) return false;
    /* Coalesce bursts: never cancel/storm the speech engine (a burst of commands or
       wake confirmations queues one utterance — newest text wins). */
    if (V._speakQ || (V._speaking && Date.now() - (V._lastSpeakAt || 0) < 700)) {
      V._speakQ = clean;
      if (!V._speakQTimer) {
        const delay = V._speaking ? Math.max(850 - (Date.now() - (V._lastSpeakAt || 0)), 150) : 120;
        V._speakQTimer = setTimeout(() => {
          V._speakQTimer = null;
          const next = V._speakQ;
          V._speakQ = null;
          if (next && !V.muted) doSpeak(next);
        }, delay);
      }
      return true;
    }
    return doSpeak(clean);
  }
  function doSpeak(clean) {
    try {
      window.speechSynthesis.cancel();   // half-duplex: never talk over ourselves
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = isNe() ? 'ne-NP' : 'en-IN';
      u.rate = 1.03;
      u.pitch = 1;
      let voices = [];
      try { voices = window.speechSynthesis.getVoices() || []; } catch (_) {}
      const want = u.lang.slice(0, 2).toLowerCase();
      const pref = voices.filter(v => v && v.lang && v.lang.replace('_', '-').toLowerCase().indexOf(want) === 0);
      if (pref.length) u.voice = pref.find(v => v.lang.replace('_', '-').toLowerCase() === u.lang.toLowerCase()) || pref[0];
      V._curUtterance = u;
      V._speaking = true;
      V._lastSpeakAt = Date.now();
      setState('speaking');
      // Watchdog: if the engine never fires onend (no audio device, stuck voice), free the UI.
      const guard = Math.min(30000, 3500 + clean.length * 85);
      V._speakGuard = setTimeout(() => { if (V._curUtterance === u) endSpeak(); }, guard);
      u.onend = () => { if (V._curUtterance === u) endSpeak(); };
      u.onerror = (e) => {
        if (V._curUtterance !== u) return;
        endSpeak();
        if (e && e.error === 'not-allowed') { V.muted = true; paint(); toast(t('noTts')); }
      };
      window.speechSynthesis.speak(u);
      return true;
    } catch (_) { endSpeak(); return false; }
  }
  V.speak = speak;
  V.stopSpeech = function () {
    V._speakQ = null;
    if (V._speakQTimer) { clearTimeout(V._speakQTimer); V._speakQTimer = null; }
    if (TTS) { try { window.speechSynthesis.cancel(); } catch (_) {} }
    endSpeak();
  };

  /* ================= STT (voice → text) ================= */
  let armTimer = null, restartFails = 0;

  function stripWake(text) {
    const m = /^(hey\s+|ok\s+)?sage(?! one)(\s*[,\-:]\s*|\s+)([\s\S]*)$/i.exec(text)
      || /^(सेज|सेजी|हे सेज)(\s*[,\-:]\s*|\s+)([\s\S]*)$/i.exec(text);
    return m ? String(m[3] || '').trim() : String(text || '').trim();
  }
  function hasWakeWord(text) {
    return /(^|[^a-z])sage([^a-z]|$)/i.test(String(text || '')) || /सेज/.test(String(text || ''));
  }

  function onFinal(raw, mode) {
    const text = String(raw || '').trim();
    if (!text) return;
    restartFails = 0;
    /* Half-duplex echo guard: while SAGE speaks (or right after), a continuous
       recognizer may transcribe SAGE's own voice — drop it, never act on it. */
    if (V._speaking || (V._lastSpeakAt && Date.now() - V._lastSpeakAt < 1200)) return;

    /* Wake standby: only act on utterances that start with the wake word. */
    if (mode === 'wake' && !V.wakeArmed) {
      if (!hasWakeWord(text)) return;                 // ignored — never transcribed into chat
      const rest = stripWake(text);
      if (rest) { V.handleTranscript(rest); return; } // "SAGE stop" / "SAGE open settings" → direct
      V.wakeArmed = true;
      setState('listening'); paint();
      toast(t('yes'));                                // visual ack only — speaking would echo into the mic
      if (armTimer) clearTimeout(armTimer);
      armTimer = setTimeout(() => { V.wakeArmed = false; paint(); }, 10000);
      return;
    }

    if (armTimer) { clearTimeout(armTimer); armTimer = null; }
    V.wakeArmed = false;
    /* One-shot capture: release the mic before acting/speaking (less echo). */
    if (mode !== 'wake') { try { V._rec && V._rec.stop(); } catch (_) {} }
    V.handleTranscript(stripWake(text));
  }

  function startListening(mode) {
    if (!SR) { ensurePill(); setState('unavailable'); toast(t('unavDesc')); return; }
    if (V.state === 'speaking') V.stopSpeech();        // stop talking so we can hear
    try {
      const rec = new SR();
      V._rec = rec;
      rec.lang = isNe() ? 'ne-NP' : 'en-IN';
      rec.interimResults = true;
      rec.continuous = (mode === 'wake');
      rec.maxAlternatives = 1;
      let finalText = '';
      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        const sub = pill && pill.querySelector('#vpSub');
        if (sub && interim && V.state === 'listening') sub.textContent = '“' + interim.slice(0, 46) + '”';
        if (finalText) { const txt = finalText; finalText = ''; onFinal(txt, mode); }
      };
      rec.onerror = (e) => {
        const err = (e && e.error) || '';
        V.lastError = err;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          V.wake = false; ensurePill(); setState('unavailable'); toast(t('denied'));
        } else if (err === 'network') {
          toast(t('netFail'));
        } else if (err === 'no-speech' || err === 'aborted') {
          /* benign — onend handles standby restart */
        } else {
          ensurePill(); setState('unavailable');
          toast('Speech input error: ' + err + '. Typed chat still works.');
        }
      };
      rec.onend = () => {
        V._rec = null;
        if (V._stopRequested) return;
        if (V.state === 'listening') {
          if (mode === 'wake' && V.wake) {
            restartFails++;
            if (restartFails > 6) {                    // service keeps ending the session — be honest, not looping
              V.wake = false; setState('idle');
              toast(isNe() ? 'वेक स्ट्यान्डबाइ सेवा रोकियो — धेरै पटक असफल भयो।' : 'Wake standby stopped — the speech service kept ending the session.');
              return;
            }
            setTimeout(() => { if (V.wake && !V._rec) startListening('wake'); }, 400 + restartFails * 350);
            return;
          }
          setState('idle');
        }
      };
      V._stopRequested = false;
      rec.start();
      setState('listening');
      ensurePill();
    } catch (err) {
      ensurePill(); setState('unavailable');
      toast('Voice input failed to start: ' + String((err && err.message) || err).slice(0, 90));
    }
  }

  /* ================= stop: "SAGE, stop" + ■ button ================= */
  V.stopAll = function () {
    V._stopRequested = true;
    V.wake = false;
    V.wakeArmed = false;
    if (armTimer) { clearTimeout(armTimer); armTimer = null; }
    try { V._rec && V._rec.stop(); } catch (_) {}
    V._rec = null;
    if (TTS) { try { window.speechSynthesis.cancel(); } catch (_) {} }
    V._speakQ = null;
    if (V._speakQTimer) { clearTimeout(V._speakQTimer); V._speakQTimer = null; }
    endSpeak();
    if (V._watch) { clearInterval(V._watch); V._watch = null; }
    /* Abort an in-flight AI reveal (stop halts stoppable activity). */
    try {
      const msgs = (S.state() && S.state().chat) || [];
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (m.type === 'ai' && m.ai && m.ai.ans && m.ai.phase !== 'done') {
          m.ai.phase = 'done';
          m.ai.k = m.ai.ans.intro.length;
          m.ai.bi = m.ai.ans.blocks.length;
          S.save(); S._chatBusy = false;
          if (S.currentRoute() === 'chat' && S.render) S.render();
          if (S.chatOrbIdle) S.chatOrbIdle();
          break;
        }
        if (m.role === 'user') break;
      }
    } catch (_) {}
    ensurePill();
    setState(V.state === 'unavailable' ? 'unavailable' : 'idle');
    toast(t('stopped'));
  };

  function isStopCmd(x) {
    x = String(x || '').toLowerCase().trim();
    return /^(sage|सेज)\s*,?\s*(stop|halt|pause|quit)(\s+(it|now|listening|talking|speaking|that|everything))?(\s+please)?$/.test(x)
      || /^(stop|halt|pause|quit)(\s+(it|now|listening|talking|speaking|that|everything))?(\s+please)?$/.test(x)
      || /^(सेज\s*,?\s*)?(रोक्नुहोस्|रोक्नुहोस|रोक|बन्द\s*गर्नुहोस्|बन्द\s*गर)$/.test(x);
  }

  /* ================= reply watcher (speak SAGE's answer) ================= */
  function watchReply() {
    if (V._watch) clearInterval(V._watch);
    const t0 = Date.now();
    V._watch = setInterval(() => {
      const msgs = (S.state() && S.state().chat) || [];
      const last = msgs[msgs.length - 1];
      const ai = last && last.type === 'ai' && last.ai;
      const finish = () => {
        if (V._watch) { clearInterval(V._watch); V._watch = null; }
        if (V.state === 'thinking') setState('idle');
      };
      if (ai && ai.phase === 'done' && ai.ans) {
        const a = ai.ans;
        const spoken = [a.title && a.title !== 'SAGE ONE · SAGE CORE' ? a.title : '', a.intro]
          .filter(Boolean).join('. ');
        finish();
        if (spoken) speak(spoken);
      } else if (ai && ai.phase === 'fail') {
        finish();
      } else if (Date.now() - t0 > 90000) {
        finish();   // timeout: honest — no invented spoken answer
      }
    }, 500);
  }

  function sendToChat(text) {
    ensurePill();
    let authed = true;
    try {
      authed = !(S.backend && typeof S.backend.isOwnerAuthenticated === 'function') || S.backend.isOwnerAuthenticated();
    } catch (_) {}
    S.sendChat(text);                 // same hardened path as typed chat (toast + auth route when signed out)
    if (!authed) { speak(t('signIn')); return; }
    setState('thinking');
    watchReply();
  }

  /* ================= voice commands: "change this" → it changes ================= */
  function titleCase(s) {
    return String(s).toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).slice(0, 40);
  }
  function done(msgKey, arg) {
    const msg = t(msgKey, arg);
    if (msg) { toast(msg); speak(msg); }
    return true;
  }

  const NAV = {
    home:        ['home', 'main screen', 'start page', 'गृहपृष्ठ', 'होम'],
    chat:        ['chat', 'assistant', 'mentor', 'च्याट'],
    settings:    ['settings', 'preferences', 'सेटिङ'],
    evolution:   ['evolution', 'evolve', 'इभोल्युसन'],
    marketplace: ['marketplace', 'market', 'shop', 'store', 'बजार'],
    jobs:        ['jobs', 'job board', 'career', 'जागिर'],
    learning:    ['learning', 'courses', 'course', 'सिकाइ'],
    research:    ['research', 'research lab', 'रिसर्च'],
    wallet:      ['wallet', 'balance', 'ब्यालेन्स'],
    earn:        ['earn', 'earnings', 'income', 'कमाइ'],
    spark:       ['spark', 'spark shop', 'स्पार्क'],
    premium:     ['premium', 'प्रिमियम'],
    profile:     ['profile', 'my account', 'प्रोफाइल'],
    files:       ['files', 'documents', 'फाइल'],
    apps:        ['apps hub', 'all apps', 'apps', 'एप्स'],
    aistudio:    ['ai studio', 'aistudio'],
    logostates:  ['logo states', 'animations', 'orb states'],
    community:   ['community', 'forum', 'समुदाय'],
    fees:        ['fees', 'transactions', 'transaction history', 'लेनदेन']
  };
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  V.command = function (text) {
    const raw = String(text || '').trim();
    if (!raw) return false;
    const x = raw.toLowerCase();
    const q = /\?/.test(raw);
    const wh = /\b(what|what's|tell|explain|how|why|who|when|where|does|do|is|are|can|could|would|should)\b/.test(x);
    let st; try { st = S.state(); } catch (_) { return false; }

    /* --- mute / unmute spoken replies --- */
    if (!q && /^(unmute|un mute|voice on|sound on|turn on (voice|sound|speech|speaking)|आवाज चालु|स्पिकर चालु)$/.test(x)) {
      V.muted = false; V.stopSpeech(); paint();
      return done('mutedOff');
    }
    if (!q && /\b(mute|silence|stop (speaking|talking)|quiet|आवाज बन्द|म्युट)\b/.test(x)) {
      V.muted = true; V.stopSpeech(); paint();
      toast(t('mutedOn'));      // stays silent by definition — toast only
      return true;
    }

    /* --- theme change --- */
    if (!q && !wh) {
      const colorM = /(dark|light|blue|गाढा|हल्का|निलो)\b/i.exec(raw);
      const intent = /(theme|mode|थिम|मोड|डार्क|लाइट)/i.test(raw);
      if (colorM && intent) {
        const c = colorM[1].toLowerCase();
        const theme = c === 'dark' || c === 'गाढा' ? 'dark' : c === 'light' || c === 'हल्का' ? 'light' : 'blue';
        if (st.theme !== theme) S.act('theme', theme);
        else toast((theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Blue') + ' theme already active.');
        return done(theme === 'dark' ? 'themeDark' : theme === 'light' ? 'themeLight' : 'themeBlue');
      }
    }

    /* --- language change --- */
    if (!q) {
      const wantNe = /(nepali|नेपाली)/i.test(raw);
      const wantEn = /(english|अङ्ग्रेजी|अंग्रेजी)/i.test(raw);
      const explicit = /\b(language|lang|switch|change|set|use|convert|बानी|भाषा|बदल)\b/i.test(raw);
      const bare = /^(nepali|नेपाली|english|अङ्ग्रेजी|अंग्रेजी)[\s!.]*$/.test(x);
      if (wantNe && (explicit || bare)) {
        if (st.lang === 'ne') { toast(t('alreadyNe')); speak(t('alreadyNe')); return true; }
        S.act('lang', 'ne');
        return done('langNe');
      }
      if (wantEn && (explicit || bare)) {
        if (st.lang === 'en') { toast(t('alreadyEn')); speak(t('alreadyEn')); return true; }
        S.act('lang', 'en');
        return done('langEn');
      }
    }

    /* --- rename (user name) --- */
    if (!q) {
      let m = /(?:change|set|rename|update)\s+(?:my\s+)?name\s*(?:to|is|:|=)?\s*([A-Za-z\u0900-\u097F][\w\u0900-\u097F' .-]{1,38})/i.exec(raw)
        || /^call me\s+(.+)$/i.exec(raw);
      if (m) {
        const name = titleCase(m[1].replace(/[.!?]+$/, ''));
        const tooPlain = /^(when|later|tomorrow|tonight|today|soon|asap|me|you)\b/i.test(name);
        if (name.length >= 2 && !tooPlain) {
          st.user.name = name;
          S.save();
          try { S.render(); } catch (_) {}
          const msg = t('nameSet', name);
          toast(msg); speak(msg);
          return true;
        }
      }
    }

    /* --- Spark balance (spoken answer) --- */
    if (!q && /(\bhow much\b|\bcheck\b|\bbalance\b|\bकति\b).*(\bspark\b|\bsparks\b|\bस्पार्क\b)|^(show |)(spark|स्पार्क)( balance| कति|)$/.test(x)) {
      const n = typeof st.spark === 'number' ? st.spark : 0;
      const msg = t('sparkBal', n);
      toast(msg); speak(msg);
      return true;
    }

    /* --- navigation: "open settings", "show me my wallet" --- */
    const navVerb = /\b(open|go to|show|take me to|navigate|display|switch to|jump to|खोल|खोल्नुहोस्)\b/i.test(raw);
    if (navVerb && !q) {
      let best = null, bestLen = 0;
      for (const route in NAV) {
        for (const a of NAV[route]) {
          const re = new RegExp('(^|[^a-z\u0900-\u097f])' + escRe(a) + '($|[^a-z\u0900-\u097f])', 'i');
          if (a.length > bestLen && re.test(raw)) { best = route; bestLen = a.length; }
        }
      }
      if (best && S.screens && S.screens[best]) {
        if (best !== S.currentRoute()) S.go(best);
        return done('opened', best);
      }
      if (best && !S.screens[best]) { toast(t('notScreen')); speak(t('notScreen')); return true; }
      /* nav verb but no known screen → not a command; let it fall through to chat */
    }

    /* --- vague "change …" without a target: say exactly what can change --- */
    if (!q && /^(change|modify|update|set|make|बदल|परिवर्तन)/.test(x) && x.length < 80) {
      toast(t('noChange'));
      speak(t('noChange'));
      return true;
    }

    return false;
  };

  /* ================= transcript entry (public, also used by tests) ================= */
  V.handleTranscript = function (text) {
    text = String(text || '').trim();
    if (!text) return;
    if (/^(hey\s+)?sage$/i.test(text)) { ensurePill(); toast(t('yes')); return; }
    if (isStopCmd(text)) { V.stopAll(); return; }
    if (V.command(text)) return;
    sendToChat(text);
  };

  /* ================= toggles ================= */
  V.toggle = function () {
    ensurePill();
    if (!SR) { setState('unavailable'); toast(t('unavDesc')); return; }
    if (V.state === 'listening') { V.stopAll(); return; }
    if (V.state === 'unavailable') setState('idle');
    startListening('tap');
  };

  V.toggleWake = function () {
    ensurePill();
    if (!SR) { setState('unavailable'); toast(t('unavDesc')); return; }
    V.wake = !V.wake;
    V.wakeArmed = false;
    if (armTimer) { clearTimeout(armTimer); armTimer = null; }
    if (V.wake) {
      toast(t('wakeOn'));                     // disclosure every time it is turned on
      restartFails = 0;
      startListening('wake');
    } else {
      V._stopRequested = true;
      try { V._rec && V._rec.stop(); } catch (_) {}
      V._rec = null;
      if (V.state === 'listening') setState('idle'); else paint();
      toast(t('wakeOff'));
    }
    paint();
  };

  /* ================= wiring: actions + render repaint ================= */
  const originalAct = S.act;
  if (typeof originalAct === 'function') S.act = function (name, arg) {
    switch (name) {
      case 'voice-toggle': V.toggle(); return;
      case 'voice-stop': V.stopAll(); return;
      case 'voice-wake': V.toggleWake(); return;
      case 'voice-mute':
        V.muted = !V.muted;
        if (V.muted) V.stopSpeech();
        paint();
        toast(V.muted ? t('mutedOn') : t('mutedOff'));
        return;
    }
    return originalAct.call(this, name, arg);
  };

  const originalRender = S.render;
  if (typeof originalRender === 'function') S.render = function () {
    const r = originalRender.apply(this, arguments);
    try { paint(); } catch (_) {}
    return r;
  };

  /* Preload voice list (Chrome loads async; first speak() may otherwise pick no voice). */
  if (TTS) {
    try { window.speechSynthesis.getVoices(); } catch (_) {}
    try {
      window.speechSynthesis.addEventListener('voiceschanged', function () { try { window.speechSynthesis.getVoices(); } catch (_) {} });
    } catch (_) {}
  }

  /* Boot: surface honest capability state to the console (never silently). */
  try {
    if (!SR) console.info('[SAGE voice] Speech input unavailable in this browser — mic controls will say so.');
    else if (!TTS) console.info('[SAGE voice] Speech output unavailable — replies will stay on screen.');
  } catch (_) {}

})(window.SAGE);
