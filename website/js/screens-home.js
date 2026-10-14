/* SAGE ONE — Home, Apps Hub, Chat (AI mentor + research mode) */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const R = S.screens = S.screens || {};

  const APPS = [
    { id: 'research', name: 'Research', sub: 'Deep research flow', ic: 'i-search', g: 'linear-gradient(135deg,#0aa6c9,#083448)' },
    { id: 'jobs', name: 'Jobs', sub: 'Find your next job', ic: 'i-case', g: 'linear-gradient(135deg,#1b5cff,#0b2f7a)' },
    { id: 'marketplace', name: 'Marketplace', sub: 'Buy & Sell', ic: 'i-bag', g: 'linear-gradient(135deg,#00a86b,#073a28)' },
    { id: 'learning', name: 'Learning', sub: 'Grow your skills', ic: 'i-book', g: 'linear-gradient(135deg,#8b3fe4,#2a1060)' },
    { id: 'community', name: 'Community', sub: 'Connect & Share', ic: 'i-users', g: 'linear-gradient(135deg,#e0335c,#4a0a1e)' },
    { id: 'aistudio', name: 'AI Studio', sub: 'Create with AI', ic: 'i-sparkles', g: 'linear-gradient(135deg,#0aa6c9,#083448)' },
    { id: 'files', name: 'Files', sub: 'Your documents', ic: 'i-folder', g: 'linear-gradient(135deg,#d98324,#4a2708)' },
    { id: 'logostates', name: 'Logo States', sub: '10 animations', ic: 'i-orbit', g: 'linear-gradient(135deg,#2e86ff,#0b1b3f)' },
    { id: 'premium', name: 'Premium', sub: 'Unlock more. Do more.', ic: 'i-crown', g: 'linear-gradient(135deg,#6d4dff,#2a1060)' }
  ];
  S.APPS = APPS;

  /* ===== HOME ===== */
  R.home = {
    view: () => {
      const st = S.state(), e = st.evo, d = S.DATA.EVOLUTIONS[e.stage - 1];
      const uname = st.user.name ? st.user.name.split(' ')[0] : 'Explorer';
      const caps = { low: 40, mid: 80, high: 100 }[e.level];
      const nextLabel = e.level === 'high' ? 'Next Evolution (Low)' : e.level === 'low' ? 'Level Up to Mid' : 'Level Up to High';
      const desk = S.isDesktop();
      const askBar = `<div class="hh-ask">
        <span>${S.icon('i-search')}</span>
        <input id="homeAsk" placeholder="Ask SAGE anything…" autocomplete="off">
        <button class="hh-mic" data-act="voice-toggle" aria-label="Talk to SAGE" title="Talk to SAGE (voice in)">${S.icon('i-mic')}</button>
        <button class="hh-send" data-act="home-ask">${S.icon('i-send')}</button>
      </div>`;
      const actions = [
        { k: 'Research', ic: 'i-search', act: 'rs-start' },
        { k: 'Analyze', ic: 'i-layers', act: 'rs-analyze' },
        { k: 'Create', ic: 'i-sparkles', act: 'nav', arg: 'aistudio' },
        { k: 'Execute', ic: 'i-bolt', act: 'nav', arg: 'jobs' },
        { k: 'More', ic: 'i-grid', act: 'nav', arg: 'apps' }
      ];
      const actionRow = `<div class="hh-actions">${actions.map(a => `
        <button class="hh-act" data-act="${a.act}"${a.arg ? ` data-arg="${a.arg}"` : ''}>${S.icon(a.ic)}<span>${a.k}</span></button>`).join('')}</div>`;
      const hero = desk ? `
      <div class="dhero">
        <div class="dhero-col left">${S.DATA.TAGLINE.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="dhero-orb">${S.stateOrb('idle', 250)}</div>
        <div class="dhero-col right"><span>YOUR IDEAS</span><i>+</i><span>SAGE</span><i>=</i><span class="hl">REAL RESULTS</span></div>
      </div>
      ${askBar}${actionRow}` : `
      <div class="home-hero mb12">
        <div class="hh-orb">${S.stateOrb('idle', 170)}</div>
        <div class="hh-tags">${S.DATA.TAGLINE.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="hh-claim">YOUR IDEAS <i>+</i> SAGE <i>=</i> <b>REAL RESULTS</b></div>
        ${askBar}${actionRow}
      </div>`;
      return `
      <div class="row between mb12" style="min-height:44px">
        <div class="row" style="gap:11px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--grad-btn);display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:var(--glow)">
            ${st.user.avatar ? st.user.avatar : (st.user.name ? S.esc(uname[0].toUpperCase()) : 'S')}
          </div>
          <div><div class="tiny muted">Namaste 🙏</div><div style="font-weight:600;font-size:14px">${S.esc(st.user.name || 'SAGE User')}</div></div>
        </div>
        <div class="row" style="gap:8px">
          ${S.sparkTag()}
          <div class="iconbox" style="width:38px;height:38px" data-act="nav" data-arg="settings">${S.icon('i-gear')}</div>
        </div>
      </div>

      ${hero}

      <!-- Stage hero -->
      <div class="stage-hero mb12">
        <div class="st-moon"></div><div class="st-peak"></div>
        <div class="st-content">
          <div style="flex:none">${S.emblem(e.stage, e.level, 96)}</div>
          <div class="grow">
            <div class="st-rank">STAGE ${e.stage} · ${S.esc(d.name)}</div>
            <div class="st-name">${S.esc(d.title)}</div>
            <div class="st-desc">${S.esc(d.desc)}</div>
            <div class="row between mt8"><span class="tiny muted">${e.level.toUpperCase()} intensity</span><span class="tiny" style="color:var(--accent-glow)">${e.progress}%</span></div>
            <div class="bar accent mt8"><i style="width:${Math.min(100, e.progress)}%"></i></div>
          </div>
        </div>
        <button class="btn xs soft mt12" style="width:100%" data-act="nav" data-arg="evolution">View Evolution ${S.icon('i-arrow-r')}</button>
      </div>

      <!-- Quick actions -->
      <div class="sect-label">${S.t('home.quick')}</div>
      <div class="quick-grid">
        <div class="quick" data-act="nav" data-arg="earn"><div class="qi">${S.icon('i-wallet')}</div><span>Earn</span></div>
        <div class="quick" data-act="nav" data-arg="wallet"><div class="qi">${S.icon('i-bank')}</div><span>Wallet</span></div>
        <div class="quick" data-act="nav" data-arg="spark"><div class="qi">${S.icon('i-bolt')}</div><span>Spark</span></div>
        <div class="quick" data-act="nav" data-arg="evolution"><div class="qi">${S.icon('i-diamond')}</div><span>Evolve</span></div>
        <div class="quick" data-act="nav" data-arg="logostates"><div class="qi">${S.icon('i-orbit')}</div><span>Logo States</span></div>
        <div class="quick" data-act="nav" data-arg="premium"><div class="qi">${S.icon('i-crown')}</div><span>Premium</span></div>
      </div>

      <!-- Earnings strip -->
      <div class="sect-label">Earnings <span class="link" data-act="nav" data-arg="earn">Details →</span></div>
      <div class="card glow row between" data-act="nav" data-arg="earn" style="cursor:pointer">
        <div><div class="tiny muted">Total Earnings</div><div style="font-size:19px;font-weight:800">${S.npr(st.lifetimeEarned)}</div></div>
        <span class="pill green">${S.icon('i-trend')} +12%</span>
      </div>

      <!-- Live Activity + Recent (board 2) -->
      <div class="home-panels">
        <div class="sect-label">Live Activity</div>
        <div class="card">
          ${S.DATA.LIVE_ACTIVITY.map(a => `
          <div class="la-row" data-act="rs-start">
            <span class="src-badge" style="background:${a.c};color:${a.dark ? '#111' : '#fff'}">${a.g}</span>
            <div class="grow"><b class="small">${a.n}</b><div class="tiny muted">Found ${a.s} sources</div></div>
            <span class="tiny muted">${a.when}</span>${S.icon('i-arrow-r')}
          </div>`).join('')}
        </div>
        <div class="sect-label">Recent</div>
        <div class="card">
          ${S.DATA.RECENT.map(r => `
          <div class="la-row" data-act="chat">
            <span class="iconbox" style="width:32px;height:32px">${S.icon(r.ic)}</span>
            <div class="grow"><b class="small ellipsis">${r.n}</b><div class="tiny muted">${r.when}</div></div>
            ${S.icon('i-arrow-r')}
          </div>`).join('')}
        </div>
      </div>

      <!-- SAGE Apps -->
      <div class="sect-label">${S.t('home.apps')} <span class="link" data-act="nav" data-arg="apps">${S.t('home.allapps')} →</span></div>
      <div class="quick-grid">
        ${APPS.map(a => `
        <div class="quick" data-act="nav" data-arg="${a.id}">
          <div class="qi" style="background:${a.g}">${S.icon(a.ic)}</div>
          <span>${a.name}</span>
        </div>`).join('')}
      </div>

      <!-- Evolution banner -->
      <div class="banner mt16" data-act="train-evolution" style="cursor:pointer">
        <div class="row between">
          <div><h4>Train your Evolution</h4><p>Complete skill actions to raise ${nextLabel.toLowerCase()} — money never reduces it.</p></div>
          <div style="color:var(--accent-glow)">${S.icon('i-bolt')}</div>
        </div>
      </div>
      <div class="notice">SAGE ONE · More Than An App — It's Your Future Partner</div>`;
    }
  };

  /* ===== APPS HUB ===== */
  R.apps = {
    view: () => `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">SAGE Apps</h2><div class="tiny muted">All your tools in one place</div></div>
        ${S.sparkTag()}
      </div>
      <div class="search-bar"><span>${S.icon('i-search')}</span><input placeholder="Search apps & tools…" data-act="noop"></div>
      <div class="grid2">
        ${APPS.map(a => `
        <div class="card glow" data-act="nav" data-arg="${a.id}" style="cursor:pointer">
          <div class="qi" style="width:44px;height:44px;border-radius:13px;background:${a.g};display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:10px">${S.icon(a.ic)}</div>
          <div style="font-weight:600;font-size:13.5px">${a.name}</div>
          <div class="tiny muted" style="margin-top:2px">${a.sub}</div>
        </div>`).join('')}
      </div>
      <div class="sect-label">System</div>
      <div class="list-item" data-act="nav" data-arg="earn"><div class="iconbox">${S.icon('i-wallet')}</div><div class="grow"><b class="small">Earning System</b><div class="tiny muted">Withdraw to bank · income sources</div></div>${S.icon('i-arrow-r')}</div>
      <div class="list-item" data-act="nav" data-arg="fees"><div class="iconbox">${S.icon('i-bank')}</div><div class="grow"><b class="small">Transaction &amp; Fees</b><div class="tiny muted">Marketplace &amp; withdrawal rates</div></div>${S.icon('i-arrow-r')}</div>
      <div class="list-item" data-act="nav" data-arg="evolution"><div class="iconbox accent">${S.icon('i-diamond')}</div><div class="grow"><b class="small">Evolution</b><div class="tiny muted">13 stages · 3 intensity levels</div></div>${S.icon('i-arrow-r')}</div>
      <div class="list-item" data-act="nav" data-arg="settings"><div class="iconbox">${S.icon('i-gear')}</div><div class="grow"><b class="small">Settings &amp; Themes</b><div class="tiny muted">Dark · Light · Blue</div></div>${S.icon('i-arrow-r')}</div>`
  };

  /* ===== CHAT (AI Mentor) ===== */
  R.chat = {
    nonav: true,
    flush: true,
    chat: true,
    view: () => `
      <div class="chat-wrap">
        <div class="chat-head">
          <button class="backbtn" style="position:static;width:34px;height:34px" data-act="back">${S.icon('i-arrow-l')}</button>
          <div class="sage-ava" id="chatOrb">${S.stateOrb(S._chatBusy ? 'thinking' : 'idle', 38)}</div>
          <div class="grow"><div style="font-weight:700;font-size:14px">SAGE</div>
            <div class="tiny" style="color:#4fe39b;display:flex;gap:5px;align-items:center"><span class="dot"></span>${S.t('chat.online')} · AI Mentor</div></div>
          <div class="iconbox" style="width:34px;height:34px" data-act="nav" data-arg="evolution">${S.icon('i-diamond')}</div>
        </div>
        <div class="chat-body" id="chatBody">${renderChat()}</div>
        <div class="chat-input">
          <input class="input" id="chatInput" placeholder="${S.t('chat.placeholder')}" autocomplete="off">
          <button class="send-btn mic-btn" id="voiceMic" data-act="voice-toggle" aria-label="Talk to SAGE" title="Talk to SAGE (voice in)">${S.icon('i-mic')}</button>
          <button class="send-btn" data-act="chat-send">${S.icon('i-send')}</button>
        </div>
      </div>`,
    mount() {
      scrollChat(); S.resumeStream();
      const inp = S.$('#chatInput');
      if (inp) {
        inp.addEventListener('focus', () => S.chatOrb('listening'));
        inp.addEventListener('blur', () => { if (!S._chatBusy) S.chatOrbIdle(); });
      }
      S.chatOrb(S._chatBusy ? 'thinking' : 'idle');
    }
  };

  /* ===== chat orb state (listening / thinking / idle) ===== */
  S._chatBusy = false;
  S.chatOrb = function (state) {
    const el = S.$('#chatOrb');
    if (el) el.innerHTML = S.stateOrb(state, 38);
  };
  S.chatOrbIdle = function () {
    S.chatOrb(document.activeElement === S.$('#chatInput') ? 'listening' : 'idle');
  };

  function scrollChat() {
    const b = S.$('#chatBody'); if (b) setTimeout(() => { b.scrollTop = b.scrollHeight; }, 60);
  }

  function aiMsgHTML(m) {
    const a = m.ai;
    if (!a || !a.ans || a.phase === 'think') {
      return `<div class="msg bot ai-think">${S.stateOrb('thinking', 22)}SAGE is thinking…</div>`;
    }
    const ans = a.ans;
    let inner = `<div class="ai-top"><span class="ai-ava">${S.logo(20, { spin: false })}</span><b>SAGE</b>${S.AI.badge(ans)}</div>`;
    inner += `<div class="ai-title">${S.esc(ans.title)}</div>`;
    inner += `<p class="ai-p">${S.esc(ans.intro.slice(0, a.k))}${a.k < ans.intro.length ? '<span class="ai-caret"></span>' : ''}</p>`;
    inner += ans.blocks.slice(0, a.bi).map(S.AI.blockHTML).join('');
    if (a.phase === 'done') inner += S.AI.tailHTML(ans) + S.AI.fuHTML(ans);
    return `<div class="msg bot ai-msg">${inner}</div>`;
  }

  function renderChat() {
    const msgs = S.state().chat;
    let html = '';
    if (!msgs.length) {
      html += `<div class="msg bot">Namaste 🙏 I'm <b>SAGE</b> — your personal AI mentor &amp; execution partner. Ask me anything: travel, careers, skills, or your Evolution.</div>`;
      html += `<div class="tiny muted" style="text-align:center;margin:6px 0">— Try asking —</div><div class="quick-prompts" style="padding:0 0 6px">` +
        S.DATA.CHAT_QS.map(q => `<button class="qp" data-act="chat-quick" data-arg="${S.esc(q)}">${S.esc(q)}</button>`).join('') + `</div>`;
    }
    for (const m of msgs) {
      if (m.role === 'user') {
        html += `<div class="msg user">${S.esc(m.text)}</div>`;
      } else if (m.type === 'ai') {
        html += aiMsgHTML(m);
      } else if (m.type === 'research') {
        html += `<div class="research-card" id="rc-${m.id}">
          <div class="row mb8"><div style="width:26px;height:26px">${S.stateOrb('searching', 26)}</div><b class="small">SAGE is researching…</b></div>
          ${S.DATA.RESEARCH_STEPS.map((s, i) => `<div class="research-step" data-si="${i}"><span class="rs-dot">${i + 1}</span>${s}</div>`).join('')}
        </div>`;
      } else {
        html += `<div class="msg bot">${m.html || S.esc(m.text)}
          ${m.actions && m.actions.length ? `<div class="mt8" style="display:flex;flex-direction:column;gap:7px">
            <div class="tiny muted">Next steps</div>
            ${m.actions.map(a => `<button class="btn xs soft" style="width:100%;justify-content:flex-start" data-act="chat-action" data-arg="${S.esc(a)}">${S.icon('i-arrow-r')} ${S.esc(a)}</button>`).join('')}
          </div>` : ''}
        </div>`;
        if (m.sources) html += m.sources.map(s => `<div class="msg bot" style="padding:8px 12px;margin-top:-6px"><div class="src">${S.icon('i-link')}<div><b>${S.esc(s.n)}</b><div class="tiny muted">${S.esc(s.u)}</div></div></div></div>`).join('');
      }
    }
    return html;
  }

  S.chatPush = function (msg) {
    const st = S.state();
    st.chat.push(Object.assign({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 7) }, msg));
    if (st.chat.length > 30) st.chat = st.chat.slice(-30);
    S.save();
  };

  /* ===== AI streaming ===== */
  let streamTimer = null;

  function repaintChat() {
    const b = S.$('#chatBody');
    if (b) { b.innerHTML = renderChat(); b.scrollTop = b.scrollHeight; }
  }

  /* Time-based reveal: progress is derived from elapsed time, not tick count,
     so a throttled/backgrounded tab still catches up on the next tick. */
  function startStream(id) {
    if (streamTimer) { clearInterval(streamTimer); streamTimer = null; }
    const t0 = Date.now();
    streamTimer = setInterval(() => {
      const m = S.state().chat.find(x => x.id === id);
      if (!m || !m.ai || !m.ai.ans || m.ai.phase === 'done' || S.currentRoute() !== 'chat') {
        clearInterval(streamTimer); streamTimer = null; return;
      }
      const ai = m.ai, ans = ai.ans;
      const el = Date.now() - t0;
      const introMs = Math.max(700, Math.min(3200, Math.round(ans.intro.length * 16)));
      if (ai.phase === 'intro') {
        const target = Math.min(ans.intro.length, Math.round((ans.intro.length * el) / introMs));
        ai.k = Math.max(ai.k, target);
        if (ai.k >= ans.intro.length) { ai.k = ans.intro.length; ai.phase = 'blocks'; }
      }
      if (ai.phase === 'blocks') {
        const per = Math.max(150, Math.min(320, Math.round(2600 / Math.max(1, ans.blocks.length))));
        const n = Math.floor((el - introMs) / per);
        ai.bi = Math.max(ai.bi, Math.min(ans.blocks.length, Math.max(0, n)));
        if (ai.bi >= ans.blocks.length) ai.phase = 'done';
      }
      repaintChat();
      if (ai.phase === 'done') {
        clearInterval(streamTimer); streamTimer = null;
        S._chatBusy = false;
        S.chatOrbIdle();
        S.save();
      }
    }, 60);
  }
  S.resumeStream = function () {
    const msgs = S.state().chat;
    const last = msgs[msgs.length - 1];
    if (last && last.type === 'ai' && last.ai && last.ai.ans && last.ai.phase !== 'done') startStream(last.id);
  };

  function pushAI(text) {
    S._chatBusy = true;
    S.chatOrb('thinking');
    S.chatPush({ role: 'bot', type: 'ai', ai: { phase: 'think', ans: null, k: 0, bi: 0 } });
    S.render();
    S.chatOrb('thinking');
    const id = S.state().chat[S.state().chat.length - 1].id;
    S.AI.answer(text).then(ans => {
      const m = S.state().chat.find(x => x.id === id);
      if (!m) return;
      m.ai = { phase: 'intro', ans: ans, k: 0, bi: 0 };
      S.save();
      if (S.currentRoute() === 'chat') { repaintChat(); startStream(id); }
      else { m.ai.k = ans.intro.length; m.ai.bi = ans.blocks.length; m.ai.phase = 'done'; S.save(); S._chatBusy = false; }
    });
  }

  S.sendChat = function (text) {
    if (!text || !text.trim()) return;
    text = text.trim();
    S._chatBusy = true;
    S.chatPush({ role: 'user', text });
    S.render();
    S.chatOrb('thinking');
    if (S.AI.isResearch(text)) {
      S.chatPush({ role: 'bot', type: 'research' });
      S.render();
      const rid = S.state().chat[S.state().chat.length - 1].id;
      let step = 0;
      const timer = setInterval(() => {
        if (S.currentRoute() !== 'chat') { clearInterval(timer); return; }
        const card = document.getElementById('rc-' + rid);
        const steps = card ? card.querySelectorAll('.research-step') : [];
        if (steps[step]) {
          steps[step].classList.add('on');
          if (step > 0 && steps[step - 1]) steps[step - 1].classList.add('done');
        }
        step++;
        if (step > S.DATA.RESEARCH_STEPS.length) {
          clearInterval(timer);
          const st = S.state();
          st.chat = st.chat.filter(m => m.id !== rid);
          S.save();
          pushAI(text);
          const lvl = S.addProgress(8, 'Research completed');
          if (lvl) S.handleLevelUp(lvl);
        }
      }, 750);
    } else {
      setTimeout(() => {
        pushAI(text);
        const lvl = S.addProgress(3, 'Mentor session');
        if (lvl) S.handleLevelUp(lvl);
      }, 380);
    }
  };

  S.chatAction = function (action) {
    const map = {
      'Open Learning': 'learning', 'Browse Jobs': 'jobs', 'Open Evolution': 'evolution',
      'Show me affordable hotels in Pokhara': 'marketplace', 'Create a travel plan': 'learning', 'Find travel guides': 'community'
    };
    S.chatPush({ role: 'user', text: action });
    const dest = map[action];
    if (dest) {
      setTimeout(() => { S.go(dest); S.toast('SAGE routed you to ' + dest); }, 250);
    }
    S.render();
  };

})(window.SAGE);
