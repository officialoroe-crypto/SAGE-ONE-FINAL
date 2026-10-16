/* SAGE ONE — Lab screens: Logo States, Research, Wallet, Premium, Memory (boards 2–4) */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const R = S.screens = S.screens || {};

  /* ============================================================
     SAGE LOGO STATES & ANIMATIONS (9 states)
     ============================================================ */
  S.previewState = function (id) {
    const st = S.DATA.LOGO_STATES.find(x => x.id === id) || S.DATA.LOGO_STATES[0];
    const root = S.$('#fxRoot');
    root.classList.add('on');
    root.innerHTML = `<div class="fx-overlay state-fx" style="--oc:${st.c}">
      <div class="state-orb">${S.stateOrb(st.id, 240)}</div>
      <div class="state-name" style="color:${st.c}">${st.name}</div>
      <div class="state-sub">${S.esc(st.sub)}</div>
      <div class="tiny muted" style="letter-spacing:2px;margin-top:4px">SAGE LOGO STATE</div>
      <button class="btn ghost sm" data-act="skip-fx" style="margin-top:18px">Close</button>
    </div>`;
    S._fxSkip = function () { root.classList.remove('on'); root.innerHTML = ''; S._fxSkip = null; };
  };

  R.logostates = {
    view: () => `
      ${S.topNav('Logo States & Animations', 'Ten moods of your execution partner')}
      <div class="ls-grid">
        ${S.DATA.LOGO_STATES.map(s => `
        <div class="ls-tile" data-act="logo-preview" data-arg="${s.id}">
          <div class="ls-orb">${S.stateOrb(s.id, 92)}</div>
          <div class="ls-name" style="color:${s.c}">${s.name}</div>
          <div class="ls-sub">${s.sub}</div>
        </div>`).join('')}
      </div>
      <div class="notice">Tap any state for a fullscreen preview.<br>The SAGE blue + black identity never disappears — only the energy layer changes.</div>`
  };

  /* ============================================================
     RESEARCH LAB (state machine + sources + failure + recovery)
     ============================================================ */
  let rsIdx = 0;          /* 0..4 → S.DATA.RS */
  let rsTimer = null;
  let rsPlaying = false;
  let rsDetailTab = 'Sources';

  S.rsSet = function (i, keep) {
    rsIdx = Math.max(0, Math.min(S.DATA.RS.length - 1, i));
    S.render(keep !== false);
  };
  S.rsJump = function (i) { rsIdx = Math.max(0, Math.min(S.DATA.RS.length - 1, i)); };
  S.rsTab = function (t) { rsDetailTab = t; S.render(true); };
  S.rsStop = function () {
    rsPlaying = false;
    if (rsTimer) { clearTimeout(rsTimer); rsTimer = null; }
  };
  S.rsPlay = function () {
    if (rsPlaying) { S.rsStop(); S.render(true); return; }
    S.rsStop();
    rsPlaying = true;
    rsIdx = 0;
    S.render(true);
    const advance = () => {
      if (!rsPlaying) return;
      if (rsIdx >= S.DATA.RS.length - 1) {
        S.rsStop();
        S.toast('Animation preview complete. No research ran, no sources were fetched, and no progress was awarded.');
        if (S.currentRoute() === 'research') S.render(true);
        return;
      }
      rsIdx++;
      if (S.currentRoute() === 'research') S.render(true);
      rsTimer = setTimeout(advance, 1900);
    };
    rsTimer = setTimeout(advance, 1900);
  };

  function orbForState(id) {
    return { idle: 'idle', researching: 'searching', analyzing: 'analyzing', verifying: 'verifying', success: 'success' }[id] || 'idle';
  }

  function sourceDetailHTML(name) {
    const src = S.DATA.LIVE_SOURCES.find(x => x.n === name) || S.DATA.LIVE_SOURCES[0];
    const tabs = ['Sources', 'Preview', 'Details'];
    let body = '';
    if (rsDetailTab === 'Sources') {
      body = `<div class="src-pages">${S.DATA.SOURCE_PAGES.map((p, i) => `
        <div class="src-page">
          <span class="sp-n">${i + 1}.</span>
          <span class="sp-ic" style="background:${p.c};color:${p.dark ? '#111' : '#fff'}">${p.g}</span>
          <div class="grow"><b>${S.esc(p.n)}</b><div class="tiny muted ellipsis">${S.esc(p.s)}</div></div>
          <span class="sp-ok" style="color:${p.ok ? '#34d399' : '#8fa6cc'}">${p.ok ? '✓' : '✕'}</span>
        </div>`).join('')}
        <button class="btn soft sm" style="width:100%" data-act="src-all">View All Sources</button></div>`;
    } else if (rsDetailTab === 'Preview') {
      body = `<div class="src-preview">
        <p><b>Key finding.</b> Personal AI assistants are shifting from answer engines to <b>execution partners</b> — tools that not only research but complete tasks end-to-end.</p>
        <p>Example summary only. No pages were fetched, used, or rejected.</p>
        <div class="tiny muted">Example text only. No source pages were fetched or verified.</div></div>`;
    } else {
      body = `<div class="src-detail-rows">
        ${[['Domain', src.n], ['Type', src.t], ['Pages fetched', 'Not run'], ['Used in answer', 'Not run'], ['Rejected', 'Not run'], ['Status', 'Example only — not fetched']]
          .map(r => `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--stroke)"><span class="small muted">${r[0]}</span><b class="small">${r[1]}</b></div>`).join('')}
      </div>`;
    }
    return `
      <div class="src-head">
        <span class="src-badge lg" style="background:${src.c};color:${src.dark ? '#111' : '#fff'}">${src.g}</span>
        <div class="grow"><b>${S.esc(src.n)}</b><div class="tiny muted">${S.esc(src.t)}</div></div>
        <span class="pill green">Example</span>
      </div>
      <div class="src-stats">
        <div><b>—</b><span>pages fetched</span></div>
        <div><b>—</b><span>used in answer</span></div>
        <div><b>—</b><span>rejected</span></div>
      </div>
      <div class="src-tabs">${tabs.map(t => `<button class="${rsDetailTab === t ? 'on' : ''}" data-act="src-tab" data-arg="${t}">${t}</button>`).join('')}</div>
      ${body}`;
  }

  let rsDetailSrc = 'Google';
  S.srcDetail = function (name) {
    rsDetailSrc = name || rsDetailSrc;
    S.sheet(`<h3>Source Detail View</h3><div class="sub">Example only · no source was fetched or verified.</div>${sourceDetailHTML(rsDetailSrc)}`);
  };
  S.srcTab = function (t) { rsDetailTab = t; S.srcDetail(); };

  R.research = {
    view: () => {
      const st = S.DATA.RS[rsIdx];
      const playing = rsPlaying;
      return `
      <div class="row between mb8" style="min-height:44px">
        <div><h2 class="screen-title">Research Lab</h2><div class="tiny muted">Animation preview · no live research request</div></div>
        <span class="pill blue" style="color:${st.c};border-color:${st.c}55">${st.label.toUpperCase()}</span>
      </div>

      <!-- state selector -->
      <div class="rs-chips">
        ${S.DATA.RS.map((s, i) => `<button class="rs-chip ${i === rsIdx ? 'on' : ''}" style="--rc:${s.c}" data-act="rs-set" data-arg="${i}">${s.label}</button>`).join('')}
      </div>

      <!-- state viewport -->
      <div class="rs-stage" style="--rc:${st.c}">
        <div class="rs-caption">${S.esc(st.cap)}</div>
        <div class="rs-orb">${S.stateOrb(orbForState(st.id), 150)}</div>
        ${st.title ? `<div class="rs-title">${st.id === 'success' ? 'Preview complete' : S.esc(st.title)}</div>` : `<div class="rs-title brand">SAGE</div>`}
        <div class="rs-sub">${S.esc(st.sub).replace(/\n/g, '<br>')}</div>

        ${st.pct > 0 && st.pct < 100 ? `
        <div class="rs-prog"><i data-w="${st.pct}" style="background:linear-gradient(90deg,${st.c}aa,${st.c})"></i></div>
        <div class="rs-pct" style="color:${st.c}">${st.pct}%</div>` : ''}

        ${st.stats.length ? `<div class="rs-stats">
          ${st.stats.map(x => `<div class="rs-stat"><span class="tick" style="background:${st.c}"></span><span class="grow">${x[0]}</span><b>${x[1]}</b></div>`).join('')}
        </div>` : ''}

        ${st.id === 'idle' ? `
        <div class="rs-ask">${S.icon('i-mic')}<input class="grow" placeholder="Ask me anything..." data-act="noop"><span class="rs-mic">${S.icon('i-mic')}</span></div>` : ''}

        ${st.id === 'success' ? `
        <div class="rs-top-src">
          <span class="src-badge" style="background:#34d399;color:#04321f">${S.icon('i-search')}</span>
          <div class="grow"><b class="small">Top Sources</b><div class="tiny muted">Preview only · no sources fetched</div></div>
          ${S.icon('i-arrow-r')}
        </div>
        <div class="rs-checks">
          ${['Animation stages previewed', 'No live research request sent', 'No sources claimed as verified'].map(c => `<div><span class="ck">✓</span>${c}</div>`).join('')}
        </div>
        <button class="btn primary sm" style="width:100%" data-act="src-detail" data-arg="Google">View Full Report</button>` : ''}

        <div class="rs-srcrow">
          ${S.DATA.RS_CHIPS.map((c, i) => `<span class="rs-src ${c === '+ More' ? 'more' : ''}">${c === '+ More' ? '+' : srcGlyph(i)}</span>`).join('')}
        </div>
        <div class="rs-tabbar">
          ${S.DATA.RS_NAV.map((n, i) => `<span class="${n === 'Research' ? 'on' : ''}">${n}</span>`).join('')}
        </div>
      </div>

      <!-- controls -->
      <div class="row mt12" style="gap:9px">
        <button class="btn primary sm" style="flex:1" data-act="rs-play">${playing ? '■ Stop' : '▶ Preview Research Animation'}</button>
        <button class="btn soft sm" style="flex:1" data-act="rs-fail">⚡ Preview Recovery Animation</button>
      </div>

      <!-- Source panel -->
      <div class="sect-label">Source Panel <span class="tiny">sample cards only · not live research data</span> ${S.demoTag('sources are examples')}</div>
      <div class="card src-panel">
        <div class="sp-head"><span style="color:var(--electric-2)">‹</span><b class="small">Example Sources</b><span class="tiny muted">Preview only · no sources fetched</span></div>
        ${S.DATA.LIVE_SOURCES.map(s => `
        <div class="sp-row" data-act="src-detail" data-arg="${s.n}">
          <span class="src-badge" style="background:${s.c};color:${s.dark ? '#111' : '#fff'}">${s.g}</span>
          <div class="grow"><b class="small">${S.esc(s.n)}</b><div class="tiny muted">${S.esc(s.t)} · sample metadata only</div></div>
          <span class="pill">Example</span>
        </div>`).join('')}
        <div class="sp-row more" data-act="src-all"><span class="src-badge ghost">+</span><div class="grow"><b class="small">More Sources</b></div>${S.icon('i-arrow-r')}</div>
      </div>

      <!-- Source detail (inline) -->
      <div class="sect-label">Source Detail View <span class="tiny">sample content · not verified</span></div>
      <div class="card src-detail">${sourceDetailHTML('Google')}</div>

      <!-- Failure sequence -->
      <div class="sect-label">Failure Animation Preview <span class="tiny">10–30 seconds · visual test only, no live request</span></div>
      <div class="fail-grid">
        ${S.DATA.FAIL_SEQ.map(f => `
        <div class="fl-tile" style="--rc:${f.c}">
          <span class="fl-num">${f.n}</span>
          <div class="fl-orb">${S.stateOrb(f.st, 64)}</div>
          <b class="fl-name">${f.name} <em>(${f.t})</em></b>
          <span class="fl-desc">${S.esc(f.d)}</span>
        </div>`).join('')}
      </div>
      <div class="fl-error">
        <span class="fl-warn">⚠</span>
        <div class="grow"><b class="small">Example research-failure state</b><div class="tiny muted">Visual preview only. No live research request was sent.</div></div>
        <div class="fl-btns">
          <button class="btn xs primary" data-act="rs-fail">Preview recovery again</button>
          <button class="btn xs soft" data-act="rs-fail">Close preview</button>
        </div>
        <div class="tiny muted" style="width:100%;text-align:right">Tap to skip animation</div>
      </div>

      <!-- Recovery sequence -->
      <div class="sect-label">Recovery Sequence <span class="tiny">purple → light sky blue → green</span></div>
      <div class="rec-strip">
        ${S.DATA.REC_SEQ.map((r, i) => `
          <div class="rec-step" style="--rc:${r.c}">
            <div class="rec-orb">${S.stateOrb(r.name === 'Failure' ? 'failure' : r.name === 'Success' ? 'success' : 'recovery', 58)}</div>
            <b>${r.name}</b><span>${r.sub}</span>
          </div>
          ${i < S.DATA.REC_SEQ.length - 1 ? '<span class="rec-arrow">›</span>' : ''}`).join('')}
      </div>

      <!-- UI elements -->
      <div class="sect-label">UI Elements &amp; Details <span class="tiny">clean · simple · premium</span></div>
      <div class="card">
        <div class="row" style="gap:14px;justify-content:center;margin-bottom:12px">
          ${['idle', 'searching', 'success'].map(id => `<span style="width:56px;height:56px;display:block">${S.stateOrb(id, 56)}</span>`).join('')}
        </div>
        <div class="grid4">
          ${[['Voice', 'i-mic'], ['Camera', 'i-camera'], ['Files', 'i-folder'], ['Tools', 'i-grid']].map(t => `
          <div class="ue-tile">${S.icon(t[1])}<span>${t[0]}</span></div>`).join('')}
        </div>
        <div class="rs-ask mt12">${S.icon('i-search')}<input class="grow" placeholder="Ask SAGE anything…" data-act="noop"><span class="rs-mic">${S.icon('i-mic')}</span></div>
        <div class="row mt12" style="gap:7px;flex-wrap:wrap">
          ${S.DATA.RS_ACTIONS.map(a => `<span class="pill blue">${a}</span>`).join('')}
        </div>
      </div>

      <!-- palette -->
      <div class="sect-label">Color Palette <span class="tiny">meaningful · consistent</span></div>
      <div class="card pal-list">
        ${S.DATA.PALETTE.map(p => `
        <div class="pal-row">
          <span class="pal-dot" style="${p.c2 ? `background:linear-gradient(90deg,${p.c},${p.c2})` : `background:${p.c}`}"></span>
          <span class="grow small">${S.esc(p.n)}</span>
          <code>${p.c.toUpperCase()}${p.c2 ? ' → ' + p.c2.toUpperCase() : ''}</code>
        </div>`).join('')}
      </div>
      <div class="notice">Tap a state chip or Start Research to run the live flow.<br>Failure never blocks you — SAGE always recovers.</div>`;
    },
    mount() {
      /* animate progress bars from 0 → design % */
      S.$$('.rs-prog i').forEach(el => {
        const w = el.getAttribute('data-w');
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = w + '%'; }));
      });
    }
  };

  function srcGlyph(i) {
    const g = ['G', '▶', 'W', '●', 'GH', 'X', '+'][i] || '•';
    return g;
  }

  /* ============================================================
     SAGE WALLET (board 2 · mobile)
     ============================================================ */
  R.wallet = {
    view: () => {
      const st = S.state();
      const tx = (st.tx || []).concat(S.DATA.WALLET_TX);
      const series = [30, 42, 36, 55, 48, 62, 58, 74, 66, 82, 78, 95];
      const max = Math.max(...series);
      return `
      <div class="row between mb12" style="min-height:44px">
        <div class="row" style="gap:9px">
          <span style="width:30px;height:30px;display:block">${S.logo(30, { spin: false })}</span>
          <div><h2 class="screen-title" style="font-size:17px;letter-spacing:3px">SAGE WALLET</h2></div>
        </div>
        <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">
          ${S.demoTag('sample balance & history')}
          <span class="pill gold">${st.premium ? 'PREMIUM' : 'BASIC'}</span>
        </div>
      </div>

      <div class="balance-card">
        <div class="row between">
          <div>
            <div class="cur">Total Balance</div>
            <div class="row" style="gap:8px;margin-top:4px">
              <span class="scoin">S</span>
              <span class="amount">${S.fmtSpark(st.spark)}</span>
            </div>
            <div class="tiny muted" style="margin-top:2px">≈ ${S.npr(st.spark)} · 1 Spark = NPR 1</div>
          </div>
          <svg class="spark-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z"/></svg>
        </div>
        <div class="chart">${series.map((v, i) => `<div class="cbar ${i < series.length - 4 ? 'dim' : ''}" style="height:${(v / max) * 100}%"></div>`).join('')}</div>
      </div>

      <div class="grid3 mt12">
        <div class="wallet-act" data-act="buy-spark"><span>＋</span>Add</div>
        <div class="wallet-act" data-act="send-spark"><span>↑</span>Send</div>
        <div class="wallet-act" data-act="nav" data-arg="earn"><span>🕘</span>History</div>
      </div>

      <button class="btn primary mt12" data-act="sim-earn">${S.icon('i-bolt')} Simulate Payment Received</button>
      <div class="notice">Plays the signature 7-stage earning animation (0–17s) and credits your wallet.</div>

      <div class="sect-label">Recent Transactions</div>
      ${tx.slice(0, 7).map(t => `
        <div class="list-item" style="cursor:default">
          <div class="iconbox ${t.v > 0 ? '' : 'accent'}">${S.icon(t.ic || 'i-wallet')}</div>
          <div class="grow"><b class="small">${S.esc(t.n)}</b><div class="tiny muted">${S.esc(t.when)}</div></div>
          <b class="small" style="color:${t.v > 0 ? '#34d399' : '#ff8f8f'}">${t.v > 0 ? '+' : '−'}${S.npr(Math.abs(t.v))}</b>
        </div>`).join('')}
      <div class="notice">Balance = Spark · Evolution is lifetime achievement and never moves with money.</div>`;
    }
  };

  /* ============================================================
     SAGE PREMIUM (board 2 · mobile)
     ============================================================ */
  R.premium = {
    view: () => {
      const st = S.state();
      return `
      <div class="prem-hero">
        <div class="prem-crown">${S.icon('i-crown')}</div>
        <h2>SAGE PREMIUM</h2>
        <p>Unlock more. Do more.</p>
        <div class="prem-orb">${S.stateOrb(st.premium ? 'premium' : 'idle', 120)}</div>
      </div>

      <div class="prem-list">
        ${S.DATA.PREMIUM_FEATURES.map(f => `
        <div class="prem-item ${st.premium ? 'on' : ''}"><span class="pk">✓</span><span class="grow">${f}</span></div>`).join('')}
      </div>

      ${st.premium ? `
        <div class="card glow mt12" style="text-align:center;border-color:rgba(157,123,255,.5)">
          <span class="pill" style="background:rgba(157,123,255,.15);color:#c9b3ff;border:1px solid rgba(157,123,255,.4)">PREMIUM ACTIVE ✓</span>
          <p class="tiny muted mt8">Your execution partner is running at full power.</p>
        </div>
        <button class="btn soft mt12" data-act="premium-cancel">Manage Subscription</button>
      ` : `
        <button class="btn primary mt16" data-act="premium-upgrade" style="background:linear-gradient(135deg,#6d4dff,#9d7bff)">Upgrade Now</button>
      `}

      <div class="prem-foot">
        <div><b>More power.</b><br><span>More possibilities.</span></div>
        <span style="width:64px;height:64px;display:block">${S.stateOrb('premium', 64)}</span>
      </div>
      <div class="notice">Billed monthly · cancel anytime · fees stay volume-based (see Transaction &amp; Fees).</div>`;
    }
  };

  /* ============================================================
     MEMORY (sidebar · image 2 / image 4 nav)
     ============================================================ */
  R.memory = {
    view: () => `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Memory</h2><div class="tiny muted">What your execution partner remembers</div></div>
        <span class="pill blue">${S.DATA.MEMORY.length} saved</span>
      </div>
      <div class="card glow mb12 row" style="gap:11px">
        <span style="width:40px;height:40px;display:block">${S.logo(40)}</span>
        <div class="tiny muted grow">SAGE remembers context across chats, research and tasks — so you never repeat yourself.</div>
      </div>
      ${S.DATA.MEMORY.map(m => `
        <div class="list-item" style="cursor:default">
          <div class="iconbox">${S.icon(m.ic)}</div>
          <div class="grow"><div class="tiny muted">${S.esc(m.k)}</div><b class="small">${S.esc(m.v)}</b></div>
        </div>`).join('')}
      <button class="btn soft mt8" data-act="toast" data-arg="Memory is local to this device — private by design.">${S.icon('i-lock')} Privacy controls</button>
      <div class="notice">Memory improves suggestions only. It never changes your Evolution.</div>`
  };

})(window.SAGE);
