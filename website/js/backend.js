/* SAGE ONE web workspace — owner-authenticated bridge to the canonical Core API.
   Only identity, chat and explicitly queued tasks are live. Other screens remain prototype-level. */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const API_BASE = (window.SAGE_API_BASE_URL || 'https://sage-one-api.onrender.com').replace(/\/+$/, '');
  let ownerToken = null, sessionId = null, config = null, initPromise = null, gisPromise = null;
  function status(text, mode) {
    let el = document.getElementById('sageBackendStatus');
    if (!el) { el = document.createElement('div'); el.id = 'sageBackendStatus'; el.className = 'sage-backend-status'; document.body.appendChild(el); }
    el.textContent = text; el.dataset.mode = mode || 'neutral';
  }
  const toast = text => { if (S.toast) S.toast(text); };
  function headers() {
    if (!ownerToken) throw new Error('Sign in with the configured SAGE owner Google account first.');
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ownerToken };
  }
  async function request(path, body) {
    const response = await fetch(API_BASE + path, {
      method: body === undefined ? 'GET' : 'POST', headers: headers(),
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) throw new Error(String(data.detail || data.error || ('HTTP ' + response.status)).slice(0, 500));
    return data;
  }
  async function loadConfig() {
    if (config) return config;
    if (initPromise) return initPromise;
    initPromise = fetch(API_BASE + '/identity/config', { headers: { Accept: 'application/json' } })
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.detail || 'Identity configuration unavailable (HTTP ' + r.status + ').');
        config = data; status('CORE READY · SIGN IN', 'ready'); return data;
      }).catch(err => { status('CORE OFFLINE · ' + String(err.message || err).slice(0, 70), 'error'); throw err; })
      .finally(() => { initPromise = null; });
    return initPromise;
  }
  function loadGoogleScript() {
    if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
    if (gisPromise) return gisPromise;
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Google sign-in could not load. Check connection or browser privacy settings.'));
      document.head.appendChild(script);
    }).finally(() => { gisPromise = null; });
    return gisPromise;
  }
  async function handleGoogleCredential(response) {
    if (!response || !response.credential) { status('CORE SIGN-IN FAILED', 'error'); toast('Google did not return an identity token.'); return; }
    try {
      const r = await fetch(API_BASE + '/identity/google', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.success !== true) throw new Error(data.detail || 'Google identity verification failed.');
      if (data.owner_mode !== true) {
        ownerToken = null; status('OWNER ACCESS NOT GRANTED', 'error');
        toast('This Google account is not the configured SAGE owner. No owner access was granted.'); return;
      }
      // The Google ID token is held in memory only, never browser storage.
      ownerToken = response.credential; sessionId = null;
      const profile = data.profile || {}, identity = data.identity || {}, state = S.state();
      if (profile.name || identity.email) state.user.name = profile.name || identity.email;
      if (identity.email) state.user.email = identity.email;
      state.onboarded = true; S.save();
      status('CORE CONNECTED · OWNER', 'connected'); toast('SAGE Core owner identity verified.'); S.go('home');
    } catch (err) {
      ownerToken = null; status('CORE SIGN-IN FAILED', 'error');
      toast('SAGE sign-in failed: ' + String(err.message || err).slice(0, 140));
    }
  }
  async function renderGoogleButton() {
    const mount = document.getElementById('sageGoogleButton');
    if (!mount) return;
    mount.innerHTML = '<span class="tiny muted">Connecting secure Google sign-in…</span>';
    try {
      const cfg = await loadConfig();
      if (!cfg.google_client_id) throw new Error('Google sign-in is not configured on the SAGE backend.');
      await loadGoogleScript(); mount.innerHTML = '';
      window.google.accounts.id.initialize({ client_id: cfg.google_client_id, callback: handleGoogleCredential, auto_select: false, cancel_on_tap_outside: true });
      window.google.accounts.id.renderButton(mount, { type: 'standard', theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'pill', width: 270, logo_alignment: 'left' });
    } catch (err) {
      mount.innerHTML = '<div class="tiny" role="status">' + S.esc(String(err.message || err)) + '</div>';
      status('CORE SIGN-IN UNAVAILABLE', 'error');
    }
  }
  function flatten(value) {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      for (const key of ['text', 'answer', 'message', 'response', 'content', 'summary', 'output']) if (typeof value[key] === 'string' && value[key].trim()) return value[key].trim();
      if (value.result !== undefined) return flatten(value.result);
      if (value.data !== undefined) return flatten(value.data);
    }
    try { return JSON.stringify(value, null, 2); } catch (_) { return String(value); }
  }
  async function chat(message) {
    const data = await request('/chat', { message, ...(sessionId ? { session_id: sessionId } : {}) });
    if (data.session_id) sessionId = data.session_id;
    return flatten(data.response);
  }
  async function queueCommand(message) {
    const data = await request('/command', { message, ...(sessionId ? { session_id: sessionId } : {}), priority: 3 });
    if (data.session_id) sessionId = data.session_id;
    const task = data.task || {};
    return { id: task.id || task.task_id || data.task_id || 'queued', status: data.status || task.status || 'queued' };
  }
  function showAnswer(text, engine) {
    const clean = String(text || 'SAGE Core returned an empty response.').slice(0, 12000);
    const ans = { title: 'SAGE ONE · SAGE CORE', intro: clean, blocks: [], sources: [], followups: ['Queue my last request as a task'], confidence: null, engine: engine || 'core' };
    S.chatPush({ role: 'bot', type: 'ai', ai: { phase: 'done', ans, k: clean.length, bi: 0 } });
    S.save(); S.render(); if (S.chatOrbIdle) S.chatOrbIdle(); S._chatBusy = false;
  }
  async function sendChat(message) {
    if (!message || !message.trim()) return;
    if (!ownerToken) { toast('Sign in with the configured SAGE owner Google account to use live chat.'); S.go('auth'); return; }
    S._chatBusy = true; S.chatPush({ role: 'user', text: message.trim() }); S.render(); if (S.chatOrb) S.chatOrb('thinking');
    try { showAnswer(await chat(message.trim()), 'core'); }
    catch (err) {
      showAnswer('SAGE Core could not complete this request: ' + String(err.message || err) + '\n\nNo offline answer was substituted.', 'core-error');
      status('CORE REQUEST FAILED', 'error');
    }
  }
  async function queueLastRequest() {
    if (!ownerToken) { toast('Sign in with the configured SAGE owner account first.'); S.go('auth'); return; }
    const last = [...(S.state().chat || [])].reverse().find(m => m.role === 'user' && m.text && m.text.trim());
    if (!last) { toast('There is no previous request to queue.'); return; }
    try {
      const result = await queueCommand(last.text);
      toast('Task queued in SAGE Core · ' + result.id); status('CORE CONNECTED · TASK QUEUED', 'connected');
    } catch (err) { toast('Task was not queued: ' + String(err.message || err).slice(0, 140)); status('CORE TASK FAILED', 'error'); }
  }
  const DEMO_ONLY = new Set([
    'auth-continue', 'kyc-start', 'kyc-done', 'premium-upgrade', 'premium-confirm', 'premium-cancel',
    'buy-spark', 'buy-spark-amount', 'buy-spark-custom', 'send-spark', 'send-spark-go',
    'withdraw', 'withdraw-go', 'earn-tier', 'buy-listing', 'buy-confirm',
    'rs-analyze', 'fail-retry',
    'src-all', 'src-detail', 'apply-job', 'enroll', 'course-complete', 'sell-submit',
    'rs-tab', 'rs-source', 'agent-hire', 'hire-go', 'wf-run', 'ig-test',
    'ai-mode', 'ai-provider', 'ai-save'
  ]);
  S.backend = {
    apiBase: API_BASE, renderGoogleButton, isOwnerAuthenticated: () => !!ownerToken,
    chat, queueCommand,
    checkConfig: async () => { const cfg = await loadConfig(); return { googleConfigured: !!cfg.google_client_id, ownerModeAvailable: !!cfg.owner_mode_available }; },
    signOut: () => { ownerToken = null; sessionId = null; status('CORE READY · SIGN IN', 'ready'); },
    status: () => ({ configured: !!config, ownerAuthenticated: !!ownerToken })
  };
  const originalAct = S.act;
  if (typeof originalAct === 'function') S.act = function (name, arg) {
    if (name === 'auth-google') { renderGoogleButton(); toast('Use the secure Google button to sign in.'); return; }
    if (name === 'ai-test') {
      if (!S.backend) { toast('SAGE Core connection is not ready.'); return; }
      S.backend.checkConfig().then(cfg => toast(cfg.googleConfigured ? 'Core identity configuration loaded. AI provider health has not been tested.' : 'Core responded, but Google sign-in is not configured.'))
        .catch(err => toast('Core configuration check failed: ' + String(err.message || err).slice(0, 100)));
      return;
    }
    if (name === 'chat-quick' && arg === 'Queue my last request as a task') { queueLastRequest(); return; }
    if (DEMO_ONLY.has(name)) { toast('Prototype only: real payments, KYC, research, and media generation are not connected. No transaction was made.'); return; }
    return originalAct.call(this, name, arg);
  };
  const originalSendChat = S.sendChat;
  S.sendChat = function (text) {
    if (text === 'Queue my last request as a task') { queueLastRequest(); return; }
    if (ownerToken) { sendChat(text); return; }
    if (text && text.trim()) { toast('Sign in with the configured SAGE owner Google account to use live chat.'); S.go('auth'); return; }
    if (originalSendChat) return originalSendChat.call(this, text);
  };
  if (S.screens && S.screens.auth) {
    const auth = S.screens.auth, originalView = auth.view, originalMount = auth.mount;
    auth.view = function () {
      return originalView().replace(/<button class="google-btn" data-act="auth-google">[\s\S]*?<\/button>/,
        '<div class="google-live-wrap"><div id="sageGoogleButton"></div><div class="tiny muted">Secure Google sign-in · SAGE Core owner access only</div></div>')
        .replace('Your data is 100% secure · Encrypted end-to-end', 'Google identity is verified by SAGE Core; this tab keeps the token in memory only.');
    };
    auth.mount = function () { if (typeof originalMount === 'function') originalMount(); renderGoogleButton(); };
  }
  document.addEventListener('DOMContentLoaded', () => { loadConfig().catch(() => {}); });
})(window.SAGE);
