/* SAGE ONE — System: Earnings/Wallet, Spark, Fees, Evolution, Profile, Settings */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const R = S.screens = S.screens || {};

  /* ===== EARNING SYSTEM ===== */
  let range = '7D';
  S.setEarnRange = function (v) { range = v; S.render(); };
  R.earn = {
    view: () => {
      const st = S.state(), e = st.earnings;
      const series = { Today: [4,6,3,8,5,9,7,12,8,10,14,11], '7D': [30,45,38,60,52,70,64,80,72,88,76,95], '30D': [40,55,48,65,60,75,68,85,78,92,84,100], All: [10,20,32,30,45,55,50,68,74,82,90,100] }[range];
      const sources = [
        { k: 'Marketplace Sales', v: e.marketplace, ic: 'i-bag' },
        { k: 'Job Bonus', v: e.jobs, ic: 'i-case' },
        { k: 'Referral Rewards', v: e.referral, ic: 'i-users' },
        { k: 'Content Creation', v: e.content, ic: 'i-sparkles' }
      ];
      const max = Math.max(...series);
      return `
      <div class="top-nav"><button class="backbtn" style="position:static" data-act="back">${S.icon('i-arrow-l')}</button>
        <div><h2>Your Earnings</h2><div class="tiny muted">Lifetime journey income</div></div></div>
      <div class="balance-card mb12">
        <div class="row between">
          <div><div class="cur">Total Earnings</div>
            <div class="amount">${S.npr(st.lifetimeEarned)}</div>
            <span class="pill green mt8">${S.icon('i-trend')} +12% this month</span></div>
          <svg class="spark-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z"/></svg>
        </div>
        <div class="chart">${series.map((v, i) => `<div class="cbar ${i < series.length - 4 ? 'dim' : ''}" style="height:${(v / max) * 100}%"></div>`).join('')}</div>
        <div class="range-row">${['Today', '7D', '30D', 'All'].map(r => `<button class="${range === r ? 'active' : ''}" data-act="earn-range" data-arg="${r}">${r}</button>`).join('')}</div>
      </div>

      <!-- Signature 7-stage earning animation (board 3) -->
      <button class="btn primary" data-act="sim-earn" style="background:linear-gradient(135deg,#b8860b,#f5c86b);color:#1c1204">${S.icon('i-bolt')} Payment Received — Play the 7-Stage Animation</button>
      <div class="notice">Exact 0–17s timeline · tier decides how epic it gets.</div>

      <div class="sect-label">Earning Animation <span class="tiny">7 stages · 0–17s</span></div>
      <div class="es-timeline">
        ${S.DATA.EARN_STAGES.map(s => `
        <div class="es-stage">
          <span class="es-n">${s.n}</span>
          <div class="es-body">
            <div class="es-head"><b>${s.name}</b><em>${s.t}</em></div>
            <div class="tiny muted" style="margin-top:2px">${S.esc(s.d)}</div>
            <span class="es-chip">${S.esc(s.chip)}</span>
          </div>
        </div>`).join('')}
      </div>

      <div class="sect-label">Other Earning Tiers <span class="tiny">size decides intensity</span></div>
      <div class="tier-grid">
        ${S.DATA.EARN_TIERS.map(t => `
        <div class="tier-card" style="--tc:${t.c};--tc2:${t.c2}" data-act="earn-tier" data-arg="${t.amount}">
          <div class="tier-name">${t.name}</div>
          <div class="tier-range">(${t.range})</div>
          <div class="tier-orb">${S.stateOrb(t.id === 'small' ? 'verifying' : t.id === 'medium' ? 'analyzing' : 'earning', 92)}</div>
          <div class="tier-amt">+ ${S.npr(t.amount)}<em>EARNED</em></div>
          <div class="tier-d">${S.esc(t.d)}</div>
          <div class="tier-use">${S.esc(t.use)}</div>
        </div>`).join('')}
      </div>

      <div class="sect-label">Notification &amp; Summary <span class="tiny">money earned</span></div>
      <div class="card notif-card">
        <div class="row" style="gap:11px">
          <span class="notif-ic">${S.icon('i-bolt')}</span>
          <div class="grow"><b class="small">${S.DATA.EARN_SUMMARY.title}</b>
            <div style="font-size:17px;font-weight:800">${S.npr(S.DATA.EARN_SUMMARY.amount)}</div></div>
          <span class="tiny muted">${S.DATA.EARN_SUMMARY.when}</span>
        </div>
        <div class="divider"></div>
        <div class="row" style="gap:9px"><span class="tiny muted" style="width:56px">From</span><div class="grow"><b class="small">${S.esc(S.DATA.EARN_SUMMARY.from)}</b><div class="tiny muted">Payment ID: ${S.DATA.EARN_SUMMARY.pid}</div></div></div>
        <div class="divider"></div>
        <div class="tiny muted mb8">Summary</div>
        ${S.DATA.EARN_SUMMARY.points.map(p => `<div class="notif-pt"><span class="ck">✓</span>${S.esc(p)}</div>`).join('')}
        <button class="btn soft sm mt12" style="width:100%" data-act="nav" data-arg="wallet">View Details</button>
      </div>
      <div class="sect-label">Income Sources</div>
      ${sources.map(s => `
        <div class="list-item" style="cursor:default">
          <div class="iconbox">${S.icon(s.ic)}</div>
          <div class="grow"><b class="small">${s.k}</b></div>
          <b class="small">${S.npr(s.v)}</b>
        </div>`).join('')}
      <button class="btn primary mt12" data-act="withdraw">${S.icon('i-bank')} Withdraw to Bank</button>
      <div class="notice">Only through approved &amp; regulated partners.<br>Withdrawals never reduce your Evolution (Key Rule #1).</div>
      <div class="sect-label">Fees applied on withdrawal</div>
      <div class="fee-box" data-act="nav" data-arg="fees" style="cursor:pointer">
        <div class="row between"><span class="small">Transaction / Withdrawal Fee</span><span class="pill gold">1% → 0.3%</span></div>
      </div>`;
    }
  };

  /* ===== SPARK CURRENCY SYSTEM ===== */
  R.spark = {
    view: () => {
      const st = S.state();
      return `
      <div class="top-nav"><button class="backbtn" style="position:static" data-act="back">${S.icon('i-arrow-l')}</button>
        <div><h2>Spark</h2><div class="tiny muted">Your Digital Fuel · Your Value. Your Freedom.</div></div></div>
      <div class="balance-card" style="text-align:center">
        <svg class="spark-star" style="margin:0 auto" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z"/></svg>
        <div class="amount" style="margin-top:6px">${S.fmtSpark(st.spark)}</div>
        <div class="cur">Sparks · ≈ ${S.npr(st.spark)}</div>
        <div class="row mt12" style="gap:10px">
          <button class="btn primary sm" style="flex:1" data-act="buy-spark">${S.icon('i-plus')} Buy Spark</button>
          <button class="btn soft sm" style="flex:1" data-act="send-spark">${S.icon('i-share')} Send Spark</button>
        </div>
      </div>
      <div class="card mt12" style="text-align:center">
        <b class="small">1 Spark = NPR 1</b>
        <div class="tiny muted mt8">Buy with real money (NPR) · KYC verified &amp; secure</div>
      </div>
      <div class="sect-label">Payment Methods <span class="tiny">(Nepal Phase 1)</span></div>
      ${S.DATA.PAYMENTS.map(p => `
        <div class="pay-method ${st.payMethod === p.id ? 'active' : ''}" data-act="pay-method" data-arg="${p.id}">
          <div class="pay-logo" style="background:${p.c}">${p.short}</div>
          <div class="grow"><b class="small">${p.name}</b><div class="tiny muted">${p.sub}</div></div>
          ${p.id === 'fonepay' ? '<span class="pill green">Recommended</span>' : (st.payMethod === p.id ? S.icon('i-check') : '')}
        </div>`).join('')}
      <div class="sect-label">How It Works</div>
      <div class="card">
        ${['Choose FonePay / eSewa', 'Secure payment (KYC verified)', 'Instant Spark credited', 'Use Spark for the transaction'].map((s, i) => `
        <div class="tl-step ${i === 0 ? 'on' : ''}"><div class="tl-dot">${i + 1}</div>
          <div><b class="small">${s}</b></div></div>`).join('')}
      </div>
      <div class="sect-label">Spark Usage</div>
      <div class="card">
        ${S.DATA.SPARK_USAGE.map((u, i) => `
        <div class="row between" style="padding:7px 0;${i ? 'border-top:1px solid var(--stroke)' : ''}">
          <span class="small muted">${S.esc(u.k)}</span><span class="small" style="color:var(--electric-2)">${S.esc(u.v)}</span></div>`).join('')}
      </div>
      <div class="card mt12 row" style="gap:10px"><div class="iconbox">${S.icon('i-info')}</div>
        <div class="tiny muted grow">Spark is <b>separate from Evolution</b> — it powers the platform economy, never your rank.</div></div>`;
    }
  };

  /* ===== TRANSACTION & FEES ===== */
  R.fees = {
    view: () => `
      ${S.topNav('Transaction & Fees', 'Transparent, volume-based pricing')}
      <div class="sect-label">Marketplace Fee (Buy / Sell)</div>
      <div class="card">
        <table class="fee-table">${S.DATA.FEES.market.map(f => `
          <tr><td>${f.label}</td><td>${f.pct}%</td></tr>`).join('')}</table>
      </div>
      <div class="sect-label">Transaction / Withdrawal Fee</div>
      <div class="card">
        <table class="fee-table">${S.DATA.FEES.tx.map(f => `
          <tr><td>${f.label}</td><td>${f.pct}%</td></tr>`).join('')}</table>
      </div>
      <div class="notice">Fee may change with Evolution rank — higher ranks unlock lower rates.<br>Payment methods: eSewa · Khalti · FonePay · Bank Transfer.<br>More payment options coming soon…</div>`
  };

  /* ===== EVOLUTION (core system screen) ===== */
  let evoPreviewStage = null, evoPreviewLevel = null;
  S.isEvoPreview = function () { return !!evoPreviewStage; };
  S.setEvoPreviewLevel = function (l) { evoPreviewLevel = l; S.render(); };
  S.clearEvoPreview = function () { evoPreviewStage = null; evoPreviewLevel = null; };
  R.evolution = {
    view: () => {
      const st = S.state(), e = st.evo;
      const cur = S.DATA.EVOLUTIONS[e.stage - 1];
      const ps = evoPreviewStage || e.stage, pl = evoPreviewLevel || e.level;
      const pd = S.DATA.EVOLUTIONS[ps - 1];
      const isPreview = ps !== e.stage || pl !== e.level;
      return `
      <div class="row between mb8" style="min-height:44px">
        <div><h2 class="screen-title">Evolution</h2><div class="tiny muted">Lifetime achievement · never decreases</div></div>
        <span class="pill accent">${S.icon('i-diamond')} STAGE ${cur.n}</span>
      </div>

      <!-- Emblem + levels -->
      <div class="emblem-wrap">
        ${S.emblem(ps, pl, 150)}
        <div style="text-align:center;margin-top:8px">
          <div class="tiny" style="letter-spacing:2.6px;color:var(--accent-glow);font-weight:700">STAGE ${ps} · ${S.esc(pd.name)}</div>
          <div style="font-size:19px;font-weight:800;margin-top:2px">${S.esc(pd.title)}</div>
          <div class="tiny muted">${S.esc(pd.desc)} · ${S.esc(pd.material)}</div>
        </div>
        <div class="level-row">
          ${['low', 'mid', 'high'].map(l => `
            <button class="level-btn ${pl === l ? 'active' : ''}" data-act="evo-level" data-arg="${l}"
              style="${pl === l ? `background:linear-gradient(135deg,${pd.accent},${pd.glow});box-shadow:0 0 18px var(--accent-soft)` : ''}">${l.toUpperCase()}</button>`).join('')}
        </div>
        ${isPreview ? `<div class="tiny muted mt8">Previewing · <span style="color:var(--electric-2);cursor:pointer" data-act="evo-view-current">back to current</span></div>` : ''}
      </div>

      <!-- Progress to next -->
      <div class="card mt8">
        <div class="row between mb8"><b class="small">${e.level === 'high' ? 'Next Evolution' : 'Level progress'}</b>
          <span class="tiny" style="color:var(--accent-glow)">${e.progress}%</span></div>
        <div class="bar accent"><i style="width:${Math.min(100, e.progress)}%"></i></div>
        <div class="row between mt8"><span class="tiny muted">${e.level.toUpperCase()}</span>
          <span class="tiny muted">${e.level === 'high' ? 'STAGE ' + Math.min(13, e.stage + 1) + ' LOW' : e.level === 'low' ? 'MID' : 'HIGH'}</span></div>
        <button class="btn xs ghost mt12" style="width:100%" data-act="train-evolution">${S.icon('i-bolt')} Train Evolution (+8 skill progress)</button>
      </div>

      <!-- The 13 Evolutions track -->
      <div class="sect-label">The 13 Evolutions <span class="tiny">tap to preview</span></div>
      <div class="evo-track">
        ${S.DATA.EVOLUTIONS.map(d => `
          <div class="evo-node ${d.n <= e.stage ? 'reached' : ''} ${d.n === ps ? 'current' : ''}" data-act="evo-preview" data-arg="${d.n}">
            <div class="en-circle" style="background:radial-gradient(circle at 38% 32%,${d.glow}55,${d.accent}22 60%,transparent 75%);box-shadow:0 0 12px ${d.soft}">
              <span style="font-size:22px">${evoEmoji(d.n)}</span>
            </div>
            <div><div class="en-name">${S.esc(d.name.length > 11 ? d.name.split(' ')[0] : d.name)}</div><div class="en-num">#${d.n}</div></div>
          </div>`).join('')}
      </div>

      <!-- 3-Level system -->
      <div class="sect-label">The 3-Level System <span class="tiny">intensity, not separate evolutions</span></div>
      <div class="level-diagram">
        ${['low', 'mid', 'high'].map(l => `
        <div class="level-card ${pl === l ? 'on' : ''}" data-act="evo-level" data-arg="${l}">
          <h5>${l.toUpperCase()}</h5>
          ${S.emblem(ps, l, 62)}
          <div class="tiny muted" style="margin-top:7px;line-height:1.6">${
            l === 'low' ? 'Subtle particles<br>Lower glow<br>Gentle accents'
            : l === 'mid' ? 'More particles<br>Stronger glow<br>Clearer identity'
            : 'Maximum intensity<br>Rich particles<br>Evolution-ready'}</div>
        </div>`).join('')}
      </div>
      <div class="row mt12" style="gap:6px;justify-content:center;flex-wrap:wrap">
        <span class="pill blue">Current (${e.level})</span><span style="color:var(--muted-2)">→</span>
        <span class="pill accent">Evolution Transition</span><span style="color:var(--muted-2)">→</span>
        <span class="pill blue">Next Evolution (Low)</span>
      </div>

      <!-- Play the signature transition -->
      <button class="btn primary mt16" data-act="play-transition">${S.icon('i-sparkles')} Play 9-Step Transition</button>

      <!-- The Flow -->
      <div class="sect-label">The Flow</div>
      <div class="flow-strip">
        ${S.DATA.FLOW.map((f, i) => `
          <div class="flow-step ${f.k === 'Evolution' ? 'final' : ''}">
            <div class="fs-ic">${S.icon(f.ic)}</div><span>${S.esc(f.k).replace('\n', '<br>')}</span></div>
          ${i < S.DATA.FLOW.length - 1 ? '<div class="flow-arrow">→</div>' : ''}`).join('')}
      </div>

      <!-- Core Concept -->
      <div class="sect-label">The Core Concept <span class="tiny">two paths, one journey</span></div>
      <div class="compare">
        <div class="cbox skill"><h5>${S.icon('i-book')} SKILL UPGRADE</h5>
          <div class="tiny muted mb8">Improves Evolution Visual Identity</div>
          <ul>${S.DATA.CORE.skill.map(x => `<li>${x}</li>`).join('')}</ul></div>
        <div class="cbox money"><h5>${S.icon('i-wallet')} MONEY UPGRADE</h5>
          <div class="tiny muted mb8">Improves System Progression / Capability</div>
          <ul>${S.DATA.CORE.money.map(x => `<li>${x}</li>`).join('')}</ul></div>
      </div>

      <!-- Key Rules -->
      <div class="sect-label">Key Rules</div>
      <div class="card rules"><ol style="margin-left:16px">${S.DATA.RULES.map(r => `<li>${r}</li>`).join('')}</ol></div>

      <!-- Why not full color takeover -->
      <div class="sect-label">Why Not Full Color Takeover?</div>
      <div class="not-this">
        <div class="nt-card bad"><span class="pill" style="background:rgba(224,70,70,.15);color:#ff7b7b;border:1px solid rgba(224,70,70,.35)">✗ NOT THIS</span>
          <div class="nt-swatch mt8" style="background:linear-gradient(135deg,#6b4423,#3a2412)"><div class="accentbar" style="background:#c98a4b"></div></div>
          <div class="tiny muted">Entire UI brown — kills SAGE identity</div></div>
        <div class="nt-card good"><span class="pill green">✓ THIS</span>
          <div class="nt-swatch mt8" style="background:linear-gradient(135deg,#081229,#03060f)"><div class="accentbar" style="background:linear-gradient(90deg,#c98a4b,#e0a56b)"></div></div>
          <div class="tiny muted">Accent only — keeps SAGE identity</div></div>
      </div>

      <!-- SAGE identity + accent layer -->
      <div class="sect-label">The SAGE Identity <span class="tiny">permanent</span></div>
      <div class="accents-row">${S.DATA.IDENTITY.map(c => `
        <div class="accent-dot" style="background:${c.c}" title="${c.n}"></div>`).join('')}
        <span class="tiny muted" style="align-self:center">Black · Deep Blue · Electric Blue · White · Subtle Gold</span>
      </div>
      <div class="sect-label">Evolution Material <span class="tiny">accent layer · changes per evolution</span></div>
      <div class="accents-row">${S.DATA.EVOLUTIONS.map(d => `
        <div class="accent-dot ${d.n === ps ? 'on' : ''}" style="background:linear-gradient(135deg,${d.glow},${d.accent})" title="${d.name}" data-act="evo-preview" data-arg="${d.n}"></div>`).join('')}
      </div>

      <!-- Design principles -->
      <div class="sect-label">Design Principles</div>
      <div class="card rules"><ol style="margin-left:16px">${S.DATA.PRINCIPLES.map(p => `<li>${p}</li>`).join('')}</ol></div>`;
    }
  };

  function evoEmoji(n) {
    return ['🥉', '🥈', '🥇', '💠', '🟢', '🔴', '🔵', '🟩', '💎', '🪨', '🟠', '🌌', '⚛️'][n - 1];
  }

  S.evoPreview = function (n) {
    evoPreviewStage = n;
    evoPreviewLevel = n === S.evo().stage ? S.evo().level : 'low';
    S.render();
  };

  /* ===== PROFILE ===== */
  R.profile = {
    view: () => {
      const st = S.state(), u = st.user, e = st.evo, d = S.DATA.EVOLUTIONS[e.stage - 1];
      const kycDone = st.kyc.face && st.kyc.nid;
      return `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Profile</h2><div class="tiny muted">Your SAGE identity</div></div>
        <div class="iconbox" data-act="nav" data-arg="settings">${S.icon('i-gear')}</div>
      </div>
      <div class="card glow" style="text-align:center;padding:20px">
        <div style="width:76px;height:76px;border-radius:50%;margin:0 auto 12px;background:var(--grad-btn);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;box-shadow:var(--glow)">
          ${u.avatar || (u.name ? S.esc(u.name[0].toUpperCase()) : 'S')}</div>
        <div style="font-size:17px;font-weight:700">${S.esc(u.name || 'SAGE User')}</div>
        <div class="tiny muted" style="margin-top:2px">${S.esc(u.location || 'Kathmandu, Nepal')}</div>
        <div class="row mt8" style="gap:6px;justify-content:center">
          <span class="pill accent">${S.icon('i-diamond')} ${S.esc(d.name)}</span>
          <span class="pill blue">EXPLORER</span>
          <span class="pill ${kycDone ? 'green' : 'gold'}">${kycDone ? 'KYC ✓' : 'KYC Pending'}</span>
        </div>
        <div class="row mt12" style="gap:10px">
          <button class="btn sm soft" style="flex:1" data-act="nav" data-arg="spark">${S.fmtSpark(st.spark)} Spark</button>
          <button class="btn sm soft" style="flex:1" data-act="nav" data-arg="earn">${S.npr(st.lifetimeEarned)}</button>
        </div>
      </div>
      <div class="sect-label">Account</div>
      <div class="set-group">
        <div class="set-item" data-act="nav" data-arg="kyc"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-shield')}</div>
          <div class="grow"><b class="small">KYC Verification</b><div class="sv">${kycDone ? 'Face ✓ · NID ✓' : 'Complete to unlock withdrawals'}</div></div>${S.icon('i-arrow-r')}</div>
        <div class="set-item" data-act="nav" data-arg="settings"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-globe')}</div>
          <div class="grow"><b class="small">Language</b><div class="sv">${st.lang === 'ne' ? 'नेपाली' : 'English'}</div></div>${S.icon('i-arrow-r')}</div>
        <div class="set-item" data-act="nav" data-arg="settings"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-moon')}</div>
          <div class="grow"><b class="small">Theme</b><div class="sv">${st.theme === 'blue' ? 'Blue Theme' : st.theme === 'light' ? 'Light' : 'Dark (Default)'}</div></div>${S.icon('i-arrow-r')}</div>
      </div>
      <div class="sect-label">Journey</div>
      <div class="set-group">
        <div class="set-item" data-act="nav" data-arg="evolution"><div class="iconbox accent" style="width:34px;height:34px">${S.icon('i-diamond')}</div>
          <div class="grow"><b class="small">Evolution Track</b><div class="sv">Stage ${e.stage} / 13 · ${e.level.toUpperCase()}</div></div>${S.icon('i-arrow-r')}</div>
        <div class="set-item" data-act="nav" data-arg="fees"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-bank')}</div>
          <div class="grow"><b class="small">Transaction &amp; Fees</b><div class="sv">Marketplace &amp; withdrawal rates</div></div>${S.icon('i-arrow-r')}</div>
        <div class="set-item" data-act="nav" data-arg="files"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-folder')}</div>
          <div class="grow"><b class="small">My Files</b><div class="sv">${S.DATA.FILES.length + st.ownedFiles.length} items</div></div>${S.icon('i-arrow-r')}</div>
      </div>
      <div class="card mt12" style="text-align:center">
        <div class="tiny muted">🇳🇵 NEPAL · SAGE · FOREVER</div>
        <div style="font-size:12px;margin-top:6px;font-weight:600">More Than An App — It's Your Future Partner</div>
      </div>
      <button class="btn soft mt12" data-act="reset-app">${S.icon('i-refresh')} Reset App Data</button>`;
    }
  };

  /* ===== SETTINGS & THEMES ===== */
  R.settings = {
    view: () => {
      const st = S.state();
      const themes = [
        { id: 'dark', name: 'Dark (Default)', prev: 'linear-gradient(160deg,#0b1734,#050b1c)', dot: '#4fa8ff' },
        { id: 'light', name: 'Light', prev: 'linear-gradient(160deg,#f4f8ff,#dbe7fb)', dot: '#1b5cff' },
        { id: 'blue', name: 'Blue Theme', prev: 'linear-gradient(160deg,#0a2a66,#04102e)', dot: '#6fb6ff' }
      ];
      return `
      ${S.topNav('Settings & Themes', 'Personalize your SAGE')}
      <div class="sect-label">Dark Mode &amp; Themes</div>
      <div class="theme-cards">
        ${themes.map(t => `
        <div class="theme-card ${st.theme === t.id ? 'on' : ''}" data-act="theme" data-arg="${t.id}">
          <div class="tprev" style="background:${t.prev}">
            <div style="position:absolute;top:8px;left:8px;width:18px;height:18px;border-radius:5px;background:${t.dot};box-shadow:0 0 10px ${t.dot}"></div>
            <div style="position:absolute;bottom:8px;left:8px;right:8px;height:5px;border-radius:3px;background:${t.id === 'light' ? 'rgba(27,92,255,.25)' : 'rgba(120,190,255,.3)'}"></div>
            <div style="position:absolute;bottom:17px;left:8px;width:34px;height:5px;border-radius:3px;background:${t.id === 'light' ? 'rgba(27,92,255,.4)' : 'rgba(120,190,255,.5)'}"></div>
          </div><span>${t.name}</span>
        </div>`).join('')}
      </div>
      <div class="tiny muted mt8">Theme changes the surface only — the SAGE blue + black identity and your evolution accent always survive.</div>

      <div class="sect-label">Language · भाषा</div>
      <div class="set-group">
        <div class="set-item" data-act="lang" data-arg="ne"><div class="iconbox" style="width:34px;height:34px">🇳🇵</div>
          <div class="grow"><b class="small">नेपाली</b><div class="sv">Nepali</div></div>${st.lang === 'ne' ? S.icon('i-check') : ''}</div>
        <div class="set-item" data-act="lang" data-arg="en"><div class="iconbox" style="width:34px;height:34px">🇬🇧</div>
          <div class="grow"><b class="small">English</b><div class="sv">Global</div></div>${st.lang === 'en' ? S.icon('i-check') : ''}</div>
      </div>

      <div class="sect-label">Account</div>
      <div class="set-group">
        <div class="set-item" data-act="nav" data-arg="kyc"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-shield')}</div>
          <div class="grow"><b class="small">Security &amp; KYC</b><div class="sv">Face + NID verification</div></div>${S.icon('i-arrow-r')}</div>
        <div class="set-item" data-act="nav" data-arg="fees"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-bank')}</div>
          <div class="grow"><b class="small">Payments &amp; Fees</b><div class="sv">eSewa · Khalti · FonePay · Bank</div></div>${S.icon('i-arrow-r')}</div>
      </div>

      <div class="set-group">
        <div class="set-item" data-act="nav" data-arg="aisettings"><div class="iconbox" style="width:34px;height:34px">${S.icon('i-sparkles')}</div>
          <div class="grow"><b class="small">AI Engine</b><div class="sv">${S.AI.isLive() ? 'Live model · key connected' : 'Built-in answer engine'}</div></div>${S.icon('i-arrow-r')}</div>
        <div class="set-item" data-act="reset-app"><div class="iconbox" style="width:34px;height:34px;color:#ff7b7b">${S.icon('i-trash')}</div>
          <div class="grow"><b class="small">Reset App Data</b><div class="sv">Clear local state &amp; restart onboarding</div></div></div>
      </div>
      <div class="notice">SAGE ONE v1.0 · Built in Nepal 🇳🇵<br>More Than An App — It's Your Future Partner</div>`;
    }
  };

  /* ===== AI ENGINE (built-in default + user supplied key) ===== */
  R.aisettings = {
    view: () => {
      const c = S.AI.cfg();
      const lib = [
        'Classifies intent across 16 topic areas',
        'Builds structured answers — sections, steps, notes and fact tables',
        'Surfaces sources plus suggested follow-up questions',
        'Handles math, date/time, and honest “no live feed” answers',
        'Streams the reply word by word like a real assistant'
      ];
      return `
      ${S.topNav('AI Engine', 'How SAGE writes its answers')}
      <div class="sect-label">Answer engine</div>
      <div class="mode-cards">
        <div class="mode-card ${c.mode === 'builtin' ? 'on' : ''}" data-act="ai-mode" data-arg="builtin">
          <b>Built-in engine</b>
          <p>On-device answer system: intent detection, knowledge base, sources and step-by-step plans. Works offline, no key, no cost.</p>
          <span class="tag">Default</span>
        </div>
        <div class="mode-card ${c.mode === 'live' ? 'on' : ''}" data-act="ai-mode" data-arg="live">
          <b>Live model</b>
          <p>Sends the question to a real LLM you connect yourself. Needs your own API key; each message is billed by that provider.</p>
          <span class="tag">Your key</span>
        </div>
      </div>

      ${c.mode === 'live' ? `
      <div class="sect-label">Connection</div>
      <div class="card">
        <div class="field"><label>Provider</label>
          <div class="seg">
            <button class="${c.provider === 'openai' ? 'on' : ''}" data-act="ai-provider" data-arg="openai">OpenAI-compatible</button>
            <button class="${c.provider === 'gemini' ? 'on' : ''}" data-act="ai-provider" data-arg="gemini">Google Gemini</button>
          </div>
        </div>
        ${c.provider === 'openai' ? `<div class="field"><label>Base URL</label><input class="input" id="aiBase" value="${S.esc(c.base)}" placeholder="https://api.openai.com/v1"></div>` : ''}
        <div class="field"><label>Model</label><input class="input" id="aiModel" value="${S.esc(c.model)}" placeholder="${c.provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'}"></div>
        <div class="field"><label>API key</label><input class="input" id="aiKey" type="password" value="${S.esc(c.key)}" placeholder="${c.provider === 'gemini' ? 'AIza…' : 'sk-…'}" autocomplete="off"></div>
        <div class="row" style="gap:8px">
          <button class="btn primary grow" data-act="ai-save">${S.icon('i-check')} Save connection</button>
          <button class="btn soft" data-act="ai-test">Test</button>
        </div>
        <div class="notice">Your key is stored only in this browser and sent only to the provider you choose. It is never uploaded to SAGE.</div>
      </div>` : `
      <div class="sect-label">What the built-in engine does</div>
      <div class="card">
        ${lib.map(x => `<div class="row small" style="padding:5px 0"><span style="color:#4fe39b">✓</span> ${x}</div>`).join('')}
      </div>
      <div class="notice">Switch to <b>Live model</b> any time to point chat at a real LLM with your own key.</div>`}
      <div class="sect-label">Try it</div>
      <div class="card">
        <div class="tiny muted mb8">Ask anything — the answer streams in with sources and follow-ups.</div>
        <div class="quick-prompts">
          ${S.DATA.CHAT_QS.map(q => `<button class="qp" data-act="chat-quick" data-arg="${S.esc(q)}">${S.esc(q)}</button>`).join('')}
        </div>
      </div>`;
    }
  };

})(window.SAGE);
