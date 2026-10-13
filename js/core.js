/* SAGE ONE — Core: namespace, utils, state, i18n, theme */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  /* ---------- utils ---------- */
  S.$ = (sel, root) => (root || document).querySelector(sel);
  S.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  S.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.npr = (n) => 'NPR ' + Number(n).toLocaleString('en-IN');
  S.fmtSpark = (n) => Number(n).toLocaleString('en-IN');
  S.rand = (a, b) => a + Math.random() * (b - a);
  S.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- persisted state ---------- */
  const DEFAULTS = {
    onboarded: false,
    lang: 'en',
    theme: 'dark',
    user: { name: '', phone: '', email: '', location: 'Kathmandu, Nepal', avatar: null },
    kyc: { face: false, nid: false },
    spark: 2580,
    lifetimeEarned: 24500,
    earnings: { marketplace: 12400, jobs: 7500, referral: 2600, content: 1000 },
    skillPoints: 3,
    // Evolution: 13 stages × low/mid/high. Lifetime achievement — never decreases.
    evo: { stage: 1, level: 'low', progress: 22, maxStage: 13 },
    appliedJobs: [],
    enrolled: [],
    ownedFiles: [],
    chat: [],
    payMethod: 'fonepay',
    premium: false,
    tx: [],
    searchHistory: []
  };

  let state = null;
  const KEY = 'sage-one-state-v1';

  S.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULTS));
      state.user = Object.assign({}, DEFAULTS.user, state.user || {});
      state.kyc = Object.assign({}, DEFAULTS.kyc, state.kyc || {});
      state.evo = Object.assign({}, DEFAULTS.evo, state.evo || {});
      state.earnings = Object.assign({}, DEFAULTS.earnings, state.earnings || {});
    } catch (e) { state = JSON.parse(JSON.stringify(DEFAULTS)); }
    return state;
  };
  S.save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  S.state = function () { return state || S.load(); };
  S.set = function (patch) { Object.assign(state, patch); S.save(); };
  S.reset = function () { localStorage.removeItem(KEY); state = JSON.parse(JSON.stringify(DEFAULTS)); };

  /* ---------- evolution helpers ---------- */
  S.evo = function () { return S.state().evo; };
  S.evoData = function () { return S.DATA.EVOLUTIONS[S.evo().stage - 1]; };
  S.setLevelVars = function () {
    const e = S.evo();
    const d = S.DATA.EVOLUTIONS[e.stage - 1];
    const r = document.documentElement.style;
    r.setProperty('--accent', d.accent);
    r.setProperty('--accent-glow', d.glow);
    r.setProperty('--accent-soft', d.soft);
  };
  /* Skill progress drives Evolution (money never reduces it — Key Rule 1) */
  S.addProgress = function (amount, reason) {
    const e = S.evo();
    e.progress += amount;
    let leveled = null;
    const order = ['low', 'mid', 'high'];
    let idx = order.indexOf(e.level);
    const caps = { low: 40, mid: 80, high: 100 };
    while (e.progress >= caps[e.level]) {
      e.progress -= caps[e.level];
      if (idx < 2) {
        idx++; e.level = order[idx];
        leveled = { stage: e.stage, level: e.level };
      } else if (e.stage < e.maxStage) {
        e.stage++; e.level = 'low'; e.progress = Math.min(e.progress, 30);
        leveled = { stage: e.stage, level: 'low', newRank: true };
      } else { e.progress = caps.high; break; }
    }
    S.save();
    if (reason) S.toast('+' + amount + ' Evolution progress · ' + reason);
    return leveled;
  };
  S.addSpark = function (n, reason) {
    const s = S.state(); s.spark = Math.max(0, s.spark + n); S.save();
    if (reason) S.toast((n > 0 ? '+' : '') + n + ' Spark · ' + reason);
  };
  /* Credit an earning + append a wallet transaction (board 3: Money Earned) */
  S.creditEarning = function (amount, source) {
    const s = S.state();
    amount = Math.max(0, Math.round(amount));
    s.lifetimeEarned += amount;
    s.earnings.marketplace += amount;
    s.tx.unshift({ n: source || 'Client Payment', when: 'Just now', v: amount, ic: 'i-case' });
    if (s.tx.length > 12) s.tx = s.tx.slice(0, 12);
    S.save();
    return amount;
  };

  /* ---------- i18n ---------- */
  S.t = function (key) {
    const s = S.state();
    const dict = S.DATA.I18N;
    return (dict[key] && dict[key][s.lang]) || (dict[key] && dict[key].en) || key;
  };
  S.setLang = function (l) { S.state().lang = l; S.save(); };

  /* ---------- theme ---------- */
  S.applyTheme = function () {
    document.documentElement.setAttribute('data-theme', S.state().theme);
    S.setLevelVars();
  };
  S.setTheme = function (t) { S.state().theme = t; S.save(); S.applyTheme(); };

  /* ---------- toast ---------- */
  S.toast = function (msg) {
    const root = S.$('#toastRoot');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="tdot"></span>' + S.esc(msg);
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 2400);
    setTimeout(() => el.remove(), 2900);
  };

  /* ---------- sheet ---------- */
  S.sheet = function (html) {
    const root = S.$('#sheetRoot');
    root.classList.add('on');
    root.innerHTML = '<div class="sheet-scrim" data-act="close-sheet"></div><div class="sheet"><div class="grab"></div>' + html + '</div>';
  };
  S.closeSheet = function () {
    const root = S.$('#sheetRoot');
    root.classList.remove('on'); root.innerHTML = '';
  };

})(window.SAGE);
