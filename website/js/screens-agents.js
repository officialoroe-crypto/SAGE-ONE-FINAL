/* SAGE ONE — Agent platform (boards 5-8):
   Mission Control · Agent Marketplace · Workflow Builder · Integrations */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const R = S.screens = S.screens || {};

  /* ---------- shared bits ---------- */
  const AG_TABS = [
    { id: 'agents',       name: 'Control',    ic: 'i-hex' },
    { id: 'agent-market', name: 'Marketplace', ic: 'i-grid' },
    { id: 'workflow',     name: 'Workflow',   ic: 'i-layers' },
    { id: 'integrations', name: 'Integrations', ic: 'i-link' }
  ];
  function agTabs(cur) {
    return `<div class="ag-tabs">${AG_TABS.map(t => `
      <button class="ag-tab ${cur === t.id ? 'on' : ''}" data-act="nav" data-arg="${t.id}">${S.icon(t.ic)} ${t.name}</button>`).join('')}</div>`;
  }
  const hired = () => S.state().hired || [];
  const approvals = () => S.DATA.APPROVALS.filter(a => !(S.state().apprDecided || []).includes(a.id));
  function decided(id) {
    const st = S.state();
    st.apprDecided = (st.apprDecided || []).concat([id]);
    S.save();
  }

  /* ===================================================================
     MISSION CONTROL
  =================================================================== */
  let mcTimer = null;
  const liveRuns = () => S.DATA.AGENT_RUNS.filter(r => r.status === 'running');

  R.agents = {
    nonav: true,
    view: () => {
      const st = S.state();
      const nm = (st.user.name || 'Alex').split(' ')[0];
      const runs = S.DATA.AGENT_RUNS;
      const apprs = approvals();
      const running = liveRuns().length;
      return `
      ${agTabs('agents')}
      <div class="mc-hero">
        <div class="mc-orb" id="mcOrb">${S.stateOrb(running ? 'searching' : 'idle', 54)}</div>
        <div class="grow">
          <h2 class="screen-title">Good morning, ${S.esc(nm)}</h2>
          <div class="tiny muted">${running} agent${running === 1 ? '' : 's'} working · ${apprs.length} approval${apprs.length === 1 ? '' : 's'} waiting on you</div>
          <div class="mt8">${S.demoTag('simulated dashboard stats')}</div>
        </div>
        <button class="btn xs primary" data-act="nav" data-arg="agent-market">${S.icon('i-plus')} Hire</button>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="sc-label">Active agents</div><div class="sc-num" id="mcActive">12</div><div class="sc-sub up">▲ 3 vs yesterday</div>
          <svg class="sc-spark" width="52" height="20" viewBox="0 0 52 20" fill="none"><path d="M1 16 9 12 17 14 25 8 33 10 41 4 50 6" stroke="#4fe39b" stroke-width="1.5"/></svg></div>
        <div class="stat-card"><div class="sc-label">Success rate</div><div class="sc-num">98.4%</div><div class="sc-sub up">▲ 0.6% this week</div></div>
        <div class="stat-card"><div class="sc-label">Spend today</div><div class="sc-num">$0.42</div><div class="sc-sub">$0.02 avg / run</div></div>
        <div class="stat-card"><div class="sc-label">Approvals</div><div class="sc-num" id="mcAppr">${apprs.length}</div><div class="sc-sub warn">${apprs.filter(a => a.risk === 'high').length} high risk</div></div>
      </div>

      <div class="sect-label">Production lifecycle</div>
      <div class="card">
        <div class="life-graph">
          ${[['Trigger', 'i-bolt'], ['Research', 'i-search'], ['Draft', 'i-book'], ['Review', 'i-eye'], ['Output', 'i-send']]
            .map((n, i) => `
            <div class="lg-node ${i <= (running ? 3 : 4) ? 'on' : ''}"><span class="lg-ic">${S.icon(n[1])}</span><span class="lg-nm">${n[0]}</span></div>
            ${i < 4 ? '<span class="lg-link"></span>' : ''}`).join('')}
        </div>
      </div>

      <div class="sect-label">Approvals queue <span class="link">${apprs.length} pending</span></div>
      ${apprs.length ? apprs.map(a => `
        <div class="appr-row" id="ap-${a.id}">
          <span class="rr-ava" style="width:36px;height:36px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:17px;background:rgba(47,134,255,.09);border:1px solid var(--stroke)">${a.emoji}</span>
          <div class="grow"><div class="ap-act">${S.esc(a.act)}</div><div class="ap-meta">${S.esc(a.agent)} · ${S.esc(a.meta)}</div></div>
          <span class="risk ${a.risk}">${a.risk}</span>
          <button class="btn xs soft" data-act="appr-no" data-arg="${a.id}">${S.icon('i-x')}</button>
          <button class="btn xs primary" data-act="appr-yes" data-arg="${a.id}">${S.icon('i-check')}</button>
        </div>`).join('') : `
        <div class="card" style="text-align:center;padding:22px"><div style="font-size:26px;margin-bottom:6px">✅</div>
          <b class="small">All clear</b><div class="tiny muted mt8">No approvals waiting. Agents act alone within their guardrails.</div></div>`}

      <div class="sect-label">Agent team · live runs ${S.demoTag('simulated runs')}</div>
      ${runs.map(r => `
        <div class="run-row" data-act="run-detail" data-arg="${r.id}" id="rr-${r.id}">
          <span class="rr-ava">${r.emoji}</span>
          <div class="grow"><div class="rr-task">${S.esc(r.task)}</div>
            <div class="rr-meta">${S.esc(r.agent)} · ${r.status === 'running' ? 'started ' + r.started : r.started}
              ${r.status === 'running' ? `<span class="bar" style="width:70px;height:4px;display:inline-block;vertical-align:middle"><i style="width:${r.progress}%"></i></span><span class="rr-pct">${r.progress}%</span>` : ''}</div></div>
          <div class="rr-right"><span class="pill ${r.status === 'running' ? 'run' : r.status === 'queued' ? 'queued' : 'green'}">${r.status === 'done' ? '✓ done' : r.status}</span>
            <div class="tiny muted mt8">$${r.cost.toFixed(2)}</div></div>
        </div>`).join('')}

      <div class="sect-label">Fleet health</div>
      ${S.DATA.FLEET.map(f => `
        <div class="fleet-row">
          <div class="fl-avas">${f.agents.map(a => `<span>${a}</span>`).join('')}</div>
          <div class="grow"><b class="small">${S.esc(f.n)}</b><div class="tiny muted">${f.load}% load</div></div>
          <span class="bar" style="width:90px"><i style="width:${f.health}%;background:${f.health > 94 ? 'linear-gradient(90deg,#2fbf7a,#4fe39b)' : 'linear-gradient(90deg,#c98f18,#ffd97a)'}"></i></span>
          <span class="pill ${f.health > 94 ? 'green' : 'gold'}">${f.health}%</span>
        </div>`).join('')}
      <div class="notice">SAGE Agents run inside your workspace. Every money or publish action lands in <b>Approvals</b> first.</div>`;
    },
    mount() {
      /* live progress ticker for running runs (time-based, safe under throttling) */
      if (mcTimer) clearInterval(mcTimer);
      const gen = (S._mcGen = (S._mcGen || 0) + 1);
      mcTimer = setInterval(() => {
        if (gen !== S._mcGen || S.currentRoute() !== 'agents') { clearInterval(mcTimer); mcTimer = null; return; }
        let any = false;
        for (const r of liveRuns()) {
          any = true;
          r.progress = Math.min(100, r.progress + 3);
          r.cost += 0.004;
          const row = document.getElementById('rr-' + r.id);
          if (row) {
            const bar = row.querySelector('.bar > i'), pct = row.querySelector('.rr-pct');
            if (bar) bar.style.width = r.progress + '%';
            if (pct) pct.textContent = r.progress + '%';
          }
          if (r.progress >= 100) {
            r.status = 'done';
            S.toast('✓ ' + r.agent + ' finished: ' + r.task);
          }
        }
        if (!any) {
          const orb = S.$('#mcOrb');
          if (orb) orb.innerHTML = S.stateOrb('idle', 54);
        }
      }, 900);
    }
  };

  /* ===================================================================
     AGENT MARKETPLACE
  =================================================================== */
  let mktCat = 'All', mktQuery = '';
  const hireCost = (a) => Math.max(25, Math.round(a.price * 2400));

  R['agent-market'] = {
    view: () => {
      const list = S.DATA.AGENTS.filter(a =>
        (mktCat === 'All' || a.cat === mktCat) &&
        (!mktQuery || (a.name + ' ' + a.desc + ' ' + a.cat).toLowerCase().includes(mktQuery.toLowerCase())));
      return `
      ${S.topNav('Agent Marketplace', S.DATA.AGENTS.length + ' prebuilt agents · hire in seconds')}
      ${agTabs('agent-market')}
      <div class="search-bar">${S.icon('i-search')}<input id="agQ" placeholder="Search agents…" value="${S.esc(mktQuery)}"></div>
      <div class="cat-row" style="scrollbar-width:none">
        ${S.DATA.AGENT_CATS.map(c => `<div class="cat ${mktCat === c ? 'active' : ''}" data-act="mkt-cat" data-arg="${S.esc(c)}"><div class="ci">${S.icon('i-hex')}</div><span>${S.esc(c)}</span></div>`).join('')}
      </div>
      ${list.length ? `<div class="agent-grid">${list.map(a => `
        <div class="agent-card ${hired().includes(a.id) ? 'hired' : ''}" data-act="agent-detail" data-arg="${a.id}">
          ${a.tag ? `<span class="ac-tag">${a.tag}</span>` : ''}
          <span class="ac-ava" style="border-color:${a.c}55;background:${a.c}14">${a.emoji}</span>
          <div class="ac-name">${S.esc(a.name)}</div>
          <div class="ac-cat">${a.cat} · ${a.runs} runs</div>
          <div class="ac-desc">${S.esc(a.desc)}</div>
          <div class="ac-foot">
            <span class="ac-price">$${a.price.toFixed(3)}<i>/run</i></span>
            <span class="ac-rate">★ ${a.rating}</span>
          </div>
          <div class="mt8">${hired().includes(a.id)
            ? '<span class="pill green" style="width:100%;justify-content:center">✓ On your team</span>'
            : `<button class="btn xs primary" style="width:100%" data-act="agent-hire" data-arg="${a.id}">Hire · ${hireCost(a)} Spark</button>`}</div>
        </div>`).join('')}</div>` : `
        <div style="text-align:center;padding:40px 0" class="muted"><div style="font-size:40px;margin-bottom:10px">🤖</div>No agents match</div>`}
      <div class="notice">Hiring spends Spark once; each run then bills the agent's per-run price from your SAGE Credits.</div>`;
    },
    mount() {
      const q = S.$('#agQ');
      if (q) q.addEventListener('input', (e) => {
        mktQuery = e.target.value;
        S.render(true);
        const nq = S.$('#agQ'); if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); }
      });
    }
  };

  /* ===================================================================
     WORKFLOW BUILDER
  =================================================================== */
  const PALETTE = [
    { g: 'Inputs', items: [['Chat Input', '💬'], ['Text Input', '🔤']] },
    { g: 'Tools', items: [['MCP Search', '🔍']] },
    { g: 'Models', items: [['Ollama', '🤖'], ['Agent', '⚡']] },
    { g: 'Prompts', items: [['Prompt', '📝']] },
    { g: 'Data', items: [['Vector Store', '🗄️']] },
    { g: 'Outputs', items: [['Structured Output', '📐'], ['Chat Output', '💬']] }
  ];
  const NODE_W = 138, NODE_H = 62;
  let wfNodes = null, wfEdges = null, wfSel = null, wfTab = 'info', wfRunGen = 0;
  function wfInit() {
    if (wfNodes) return;
    wfNodes = [
      { id: 'n1', type: 'Chat Input', ic: '💬', x: 22, y: 150, body: '<b>Text</b> · receiving input' },
      { id: 'n2', type: 'MCP Search', ic: '🔍', x: 22, y: 268, body: 'server · <b>mcp-search</b>' },
      { id: 'n3', type: 'Ollama', ic: '🤖', x: 218, y: 56, body: 'model · <b>llama3.1</b>' },
      { id: 'n4', type: 'Agent', ic: '⚡', x: 218, y: 190, body: 'role · <b>BI analyst</b>' },
      { id: 'n5', type: 'Structured Output', ic: '📐', x: 424, y: 122, body: 'schema · <b>output_schema</b>' }
    ];
    wfEdges = [['n1', 'n4'], ['n2', 'n4'], ['n3', 'n4'], ['n4', 'n5']];
    wfSel = 'n4';
  }
  const wfNode = (id) => wfNodes.find(n => n.id === id);

  /* Inspector panels, split out of the view template to keep nesting shallow. */
  const WF_TAB_LABEL = { props: 'Properties', actions: 'Actions', info: 'Info' };

  function wfPropsPanel(sel) {
    let fields = '';
    if (sel.type === 'Agent') {
      fields = `
        <div class="field"><label>Agent instructions</label>
          <textarea class="input" id="wfProp" rows="4" style="resize:none;font-size:11px">You are an expert business intelligence analyst. Research the market, then return structured findings.</textarea></div>
        <div class="field"><label>Tools</label>
          <div class="row" style="gap:6px;flex-wrap:wrap"><span class="pill blue">MCP Search</span><span class="pill blue">Vector Store</span><span class="pill gold">+ add</span></div></div>`;
    } else if (sel.type === 'Ollama') {
      fields = `
        <div class="field"><label>Model</label>
          <div class="seg" id="wfProp"><button class="on">llama3.1</button><button>mixtral</button><button>gemma2</button></div></div>`;
    } else if (sel.type === 'Structured Output') {
      fields = `
        <div class="field"><label>Schema name</label><input class="input" id="wfProp" value="output_schema"></div>
        <div class="tiny muted">Agents must match this schema or the run fails validation.</div>`;
    } else {
      fields = `
        <div class="field"><label>Node label</label><input class="input" id="wfProp" value="${S.esc(sel.type)}"></div>`;
    }
    return `<div class="sect-label" style="margin-top:0">${S.esc(sel.type)}</div>${fields}`;
  }

  function wfActionsPanel(sel) {
    return `
      <button class="btn soft sm" style="width:100%;margin-bottom:8px" data-act="wf-run">${S.icon('i-bolt')} Run from here</button>
      <button class="btn soft sm" style="width:100%;margin-bottom:8px" data-act="wf-toast" data-arg="Node disabled — it will be skipped">${S.icon('i-x')} Disable node</button>
      <button class="btn soft sm" style="width:100%;margin-bottom:12px;color:#ff8585" data-act="wf-del" data-arg="${sel.id}">${S.icon('i-trash')} Delete node</button>`;
  }

  function wfInfoPanel(sel) {
    const ins = wfEdges.filter(e => e[1] === sel.id).length;
    const outs = wfEdges.filter(e => e[0] === sel.id).map(e => wfNode(e[1]).type).join(', ');
    return `
      <div class="sect-label" style="margin-top:0">Component info</div>
      <div class="wi-row"><span>ID</span><b>${sel.id}-${sel.type.slice(0, 4).toUpperCase()}</b></div>
      <div class="wi-row"><span>Type</span><b>${sel.type.toLowerCase().replace(/ /g, '')}</b></div>
      <div class="wi-row"><span>Position</span><b>x ${Math.round(sel.x)}, y ${Math.round(sel.y)}</b></div>
      <div class="sect-label">Runtime info</div>
      <div class="wi-row"><span>Last run</span><b>${sel.id === 'n4' ? 'Today, 14:02' : 'Never'}</b></div>
      <div class="wi-row"><span>Duration</span><b>${sel.id === 'n4' ? '3.2s' : 'N/A'}</b></div>
      <div class="sect-label">Connections</div>
      <div class="wi-row"><span>Input</span><b>${ins || 'No input'}</b></div>
      <div class="wi-row"><span>Output</span><b>${outs || '—'}</b></div>`;
  }

  function wfInspector(sel) {
    if (!sel) return '<div class="tiny muted">Select a node to inspect it.</div>';
    const tabs = Object.keys(WF_TAB_LABEL).map(t =>
      `<button class="wi-tab ${wfTab === t ? 'on' : ''}" data-act="wf-tab" data-arg="${t}">${WF_TAB_LABEL[t]}</button>`).join('');
    let panel = '';
    if (wfTab === 'props') panel = wfPropsPanel(sel);
    else if (wfTab === 'actions') panel = wfActionsPanel(sel);
    else panel = wfInfoPanel(sel);
    return `<div class="wi-tabs">${tabs}</div>${panel}`;
  }

  function wfDrawEdges(live) {
    const svg = S.$('#wfEdges');
    if (!svg) return;
    svg.innerHTML = wfEdges.map(([a, b]) => {
      const na = wfNode(a), nb = wfNode(b);
      if (!na || !nb) return '';
      const x1 = na.x + NODE_W, y1 = na.y + 31, x2 = nb.x, y2 = nb.y + 31;
      const mx = (x1 + x2) / 2;
      return `<path class="${live && live.includes(b) ? 'live' : ''}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`;
    }).join('');
  }

  R.workflow = {
    view: () => {
      wfInit();
      const sel = wfNode(wfSel);
      return `
      ${S.topNav('Workflow Builder', 'Drag nodes · connect · run')}
      ${agTabs('workflow')}
      <div class="wf-wrap">
        <aside class="wf-pal">
          ${PALETTE.map(p => `<div class="wf-pal-label">${p.g}</div>` + p.items.map(([n, ic]) => `
            <div class="wf-pal-item" data-act="wf-add" data-arg="${S.esc(n)}"><span class="wfp-ic">${ic}</span>${n}</div>`).join('')).join('')}
        </aside>
        <div class="wf-stage">
          <div class="wf-toolbar">
            <span class="wf-title">${S.icon('i-layers')} Market Strategist</span>
            <button class="btn xs soft" data-act="wf-reset">↺</button>
            <button class="btn xs primary" data-act="wf-run">${S.icon('i-bolt')} Run</button>
          </div>
          <div class="wf-canvas" id="wfCanvas">
            <svg class="wf-edges" id="wfEdges"></svg>
            ${wfNodes.map(n => `
              <div class="wf-node ${wfSel === n.id ? 'selected' : ''}" id="wn-${n.id}" data-node="${n.id}"
                   style="left:${n.x}px;top:${n.y}px;touch-action:none">
                <span class="n-port in"></span><span class="n-port out"></span>
                <div class="n-head"><span class="n-ic">${n.ic}</span>${S.esc(n.type)}</div>
                <div class="n-body">${n.body}</div>
              </div>`).join('')}
            <div class="wf-log" id="wfLog" style="display:none"></div>
          </div>
        </div>
        <aside class="wf-insp">
          ${wfInspector(sel)}
        </aside>
      </div>
      <div class="notice">Workflows run on your SAGE Credits. Publishing makes the flow callable from Chat and from other agents.</div>`;
    },
    mount() {
      wfInit();
      wfDrawEdges();
      /* drag nodes */
      let drag = null;
      const canvas = S.$('#wfCanvas');
      if (!canvas) return;
      canvas.addEventListener('pointerdown', (e) => {
        const el = e.target.closest('.wf-node');
        if (!el) return;
        const n = wfNode(el.dataset.node);
        if (!n) return;
        wfSel = n.id;
        S.$$ && S.$$('.wf-node').forEach(x => x.classList.toggle('selected', x === el));
        drag = { n, el, ox: e.clientX - n.x, oy: e.clientY - n.y };
        el.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const r = canvas.getBoundingClientRect();
        drag.n.x = Math.max(4, Math.min(r.width - NODE_W - 4, e.clientX - drag.ox));
        drag.n.y = Math.max(4, Math.min(r.height - NODE_H - 4, e.clientY - drag.oy));
        drag.el.style.left = drag.n.x + 'px';
        drag.el.style.top = drag.n.y + 'px';
        wfDrawEdges();
      });
      const stop = () => { drag = null; };
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
      canvas.addEventListener('click', (e) => {
        const el = e.target.closest('.wf-node');
        if (el && wfSel !== el.dataset.node) { wfSel = el.dataset.node; S.render(true); }
      });
      /* inspector edits update node live */
      const p = S.$('#wfProp');
      if (p) p.addEventListener('input', (e) => {
        const n = wfNode(wfSel);
        if (!n) return;
        const v = S.esc(e.target.value || '').slice(0, 60);
        n.body = n.type === 'Agent' ? 'role · <b>BI analyst</b>' : n.type === 'Ollama' ? 'model · <b>' + v + '</b>' : 'schema · <b>' + v + '</b>';
        const el = S.$('#wn-' + n.id + ' .n-body');
        if (el) el.innerHTML = n.body;
      });
    }
  };

  S.wfRun = function () {
    wfInit();
    wfRunGen++;
    const gen = wfRunGen;
    const log = S.$('#wfLog');
    const order = ['n1', 'n3', 'n2', 'n4', 'n5'];
    const names = { n1: 'Chat Input', n3: 'Ollama · llama3.1', n2: 'MCP Search', n4: 'Agent · BI analyst', n5: 'Structured Output' };
    if (log) { log.style.display = 'block'; log.innerHTML = '<span class="run">▶</span> run started · workflow v3'; }
    order.forEach((id, i) => {
      setTimeout(() => {
        if (gen !== wfRunGen || S.currentRoute() !== 'workflow') return;
        const el = S.$('#wn-' + id);
        S.$$('.wf-node').forEach(x => x.classList.remove('running'));
        if (el) { el.classList.add('running'); el.classList.remove('done'); }
        wfDrawEdges(order.slice(Math.max(0, i - 1), i + 1));
        if (log) { log.innerHTML += '<br><span class="run">●</span> ' + names[id] + '…'; log.scrollTop = log.scrollHeight; }
        setTimeout(() => {
          if (gen !== wfRunGen || S.currentRoute() !== 'workflow') return;
          if (el) { el.classList.remove('running'); el.classList.add('done'); }
          if (log) { log.innerHTML += '<br><span class="ok">✓</span> ' + names[id] + ' ok (' + (0.4 + i * 0.3).toFixed(1) + 's)'; log.scrollTop = log.scrollHeight; }
          if (i === order.length - 1) {
            wfDrawEdges();
            if (log) log.innerHTML += '<br><span class="ok">✓ workflow completed in 3.2s · $0.06</span>';
            S.toast('✓ Workflow completed');
          }
        }, 620);
      }, i * 950);
    });
  };

  /* ===================================================================
     INTEGRATIONS (real API connections)
  =================================================================== */
  const cfg = () => { const st = S.state(); st.integ = st.integ || {}; return st.integ; };

  const TESTS = {
    openai: (v) => fetchJSON('https://api.openai.com/v1/models',
      { headers: { Authorization: 'Bearer ' + v.OPENAI_API_KEY } }, (code, d) =>
      code === 200 ? { ok: true, msg: 'Connected · ' + (d.data ? d.data.length + ' models available' : 'ok') }
      : code === 401 ? { ok: false, msg: 'Invalid API key (401). Check platform.openai.com' }
      : code === 429 ? { ok: true, msg: 'Key valid, but rate-limited right now (429)' }
      : { ok: false, msg: 'API returned ' + code }),
    telegram: (v) => fetchJSON('https://api.telegram.org/bot' + v.TELEGRAM_BOT_TOKEN + '/getMe', {},
      (code, d) => d && d.ok ? { ok: true, msg: 'Connected · bot @' + d.result.username }
        : { ok: false, msg: 'Token rejected — create one via @BotFather' }),
    discord: (v) => fetchJSON('https://discord.com/api/v10/users/@me',
      { headers: { Authorization: v.DISCORD_BOT_TOKEN } }, (code, d) =>
      code === 200 ? { ok: true, msg: 'Connected · bot "' + (d.username || 'ok') + '"' }
        : { ok: false, msg: 'Token rejected (Discord returned ' + code + ')' }),
    github: (v) => fetchJSON('https://api.github.com/user',
      { headers: { Authorization: 'Bearer ' + v.GITHUB_TOKEN } }, (code, d) =>
      code === 200 ? { ok: true, msg: 'Connected · @' + (d.login || 'ok') }
        : { ok: false, msg: 'Token rejected (GitHub returned ' + code + ')' }),
    supabase: (v) => {
      const base = (v.SUPABASE_URL || '').replace(/\/$/, '');
      if (!/^https:\/\//.test(base)) return Promise.resolve({ ok: false, msg: 'SUPABASE_URL must start with https://' });
      return fetchJSON(base + '/rest/v1/',
        { headers: { apikey: v.SUPABASE_ANON_KEY || '', Authorization: 'Bearer ' + (v.SUPABASE_ANON_KEY || '') } },
        (code) => code === 200 ? { ok: true, msg: 'Connected · REST API answering' }
          : code === 401 ? { ok: false, msg: 'URL reachable but anon key rejected (401)' }
          : { ok: false, msg: 'Unexpected response (' + code + ') — check the URL' });
    },
    http: (v) => {
      const url = v.WEBHOOK_URL || '';
      if (!/^https?:\/\//.test(url)) return Promise.resolve({ ok: false, msg: 'URL must start with http(s)://' });
      return fetchJSON(url, {}, (code) => ({ ok: code < 400, msg: 'Endpoint answered HTTP ' + code }));
    }
  };
  /* real network probe with timeout; errors reported honestly (incl. CORS) */
  function fetchJSON(url, opts, map) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 9000);
    return fetch(url, Object.assign({ signal: ac.signal }, opts))
      .then(r => r.json().catch(() => ({})).then(d => { clearTimeout(t); return map(r.status, d); }))
      .catch(e => {
        clearTimeout(t);
        return { ok: false, msg: e.name === 'AbortError' ? 'Timed out after 9s — check the URL or your network'
          : 'Unreachable from the browser (network or CORS). The value is saved for agents to use server-side.' };
      });
  }

  function integCard(it) {
    const c = cfg()[it.id] || {};
    const configured = it.fields.some(f => c[f.k]);
    return `
    <div class="integ-card" style="--igc:${it.c}" id="ig-${it.id}">
      <div class="ig-head">
        <span class="ig-ic">${S.icon(it.ic)}</span>
        <div class="grow"><div class="ig-name">${S.esc(it.name)}</div>
          <div class="ig-status ${configured ? 'ok' : 'no'}">${configured ? '● Configured' : '○ Not configured'}</div></div>
      </div>
      <div class="ig-hint">${S.esc(it.hint)}${it.portal ? ` · <a href="https://${it.portal}" target="_blank" rel="noopener">${it.portal} ↗</a>` : ''}</div>
      <div class="ig-fields">
        ${it.fields.map(f => `
        <div class="ig-f"><input id="igf-${it.id}-${f.k}" data-igkey="${f.k}" placeholder="${f.k}"
          type="${f.secret ? 'password' : 'text'}" value="${S.esc(c[f.k] || '')}" autocomplete="off" spellcheck="false"></div>`).join('')}
      </div>
      <div class="ig-actions">
        ${configured ? `<button class="btn xs soft" data-act="ig-remove" data-arg="${it.id}">Remove</button>` : ''}
        <button class="btn xs soft grow" data-act="ig-save" data-arg="${it.id}">${S.icon('i-check')} Save</button>
        <button class="btn xs primary grow" data-act="ig-test" data-arg="${it.id}">${S.icon('i-bolt')} Test</button>
      </div>
      <div class="ig-result" id="igr-${it.id}"></div>
    </div>`;
  }

  R.integrations = {
    nonav: true,
    view: () => {
      const customs = (cfg().custom || []);
      return `
      ${S.topNav('Integrations', 'Keys stay in this browser · injected as env vars for your agents')}
      ${agTabs('integrations')}
      <div class="sect-label" style="margin-top:0">Service integrations
        <span class="link" data-act="ig-custom" style="cursor:pointer">+ Add custom</span></div>
      <div class="integ-grid">
        ${S.DATA.INTEGRATIONS.map(integCard).join('')}
        ${customs.map((it, i) => integCard({ id: 'custom' + i, name: it.name, ic: 'i-link', c: '#8fa8d0', hint: 'Custom HTTPS endpoint', portal: '', test: 'http',
          fields: [{ k: 'WEBHOOK_URL', ph: 'https://…' }, { k: 'WEBHOOK_SECRET', secret: true, ph: 'optional' }] })).join('')}
      </div>
      <div class="notice">Credentials are injected as environment variables when an agent starts. They are stored only in this browser — never shared, never in the repo.</div>`;
    }
  };

  /* ===================================================================
     ACTION ENTRYPOINT (wired from app.js)
     The buttons in the agent workspace emit a bare data-act (e.g. "ig-test",
     "agent-hire", "wf-run"). app.js's S.act doesn't own these, so it forwards
     any name in AG_ACT_KNOWN to S.AG_ACT as "name:arg". Keep this list in sync
     with the case labels below (mkt-cat/apply-job are intentionally omitted —
     S.act handles those directly for the phone Apps screen).
  =================================================================== */
  S.AG_ACT_KNOWN = ['agent-detail', 'agent-hire', 'hire-go', 'appr-yes', 'appr-no',
    'run-detail', 'wf-run', 'wf-tab', 'wf-toast', 'wf-reset', 'wf-del', 'wf-add',
    'ig-save', 'ig-test', 'ig-remove', 'ig-custom', 'ig-custom-go'];

  S.AG_ACT = function (arg, el) {
    const [sub, id] = String(arg || '').split(':');
    switch (sub) {
      case 'mkt-cat': mktCat = id; S.render(); break;

      case 'agent-detail': {
        const a = S.DATA.AGENTS.find(x => x.id === id);
        if (!a) break;
        const has = hired().includes(a.id);
        S.sheet(`
          <div style="text-align:center;padding:6px 0 2px"><div style="font-size:44px">${a.emoji}</div>
            <h3 style="margin:6px 0 2px">${S.esc(a.name)}</h3>
            <div class="tiny muted">${a.cat} · ★ ${a.rating} · ${a.runs} runs</div></div>
          <p class="small muted" style="text-align:center;margin:12px 16px;line-height:1.7">${S.esc(a.desc)}</p>
          <div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap">${a.tags.map(t => `<span class="pill blue">${S.esc(t)}</span>`).join('')}</div>
          <div class="card mt12"><div class="row between"><b class="small">Price per run</b><span class="pill blue">$${a.price.toFixed(3)}</span></div>
            <div class="row between mt8"><b class="small">Hiring fee (one-time)</b><span class="pill gold">${hireCost(a)} Spark</span></div></div>
          ${has ? '<div class="btn soft mt12">✓ Already on your team</div>'
            : `<button class="btn primary mt12" data-act="hire-go" data-arg="${a.id}">Hire ${S.esc(a.name)} · ${hireCost(a)} Spark</button>`}
          <button class="btn soft mt8" data-act="close-sheet">Close</button>`);
        break;
      }
      case 'agent-hire': {
        const a = S.DATA.AGENTS.find(x => x.id === id);
        if (a) S.AG_ACT('agent-detail:' + id);
        break;
      }
      case 'hire-go': {
        const a = S.DATA.AGENTS.find(x => x.id === id);
        if (!a) break;
        const cost = hireCost(a);
        const st = S.state();
        if (st.spark < cost) { S.toast('Not enough Spark — need ' + cost); break; }
        st.hired = (st.hired || []).concat([a.id]);
        S.addSpark(-cost, 'Hired ' + a.name);
        S.closeSheet();
        S.render();
        break;
      }

      case 'appr-yes': decided(id); S.toast('✓ Approved — agent proceeds'); S.render(true); break;
      case 'appr-no': decided(id); S.toast('✕ Rejected — action cancelled'); S.render(true); break;

      case 'run-detail': {
        const r = S.DATA.AGENT_RUNS.find(x => x.id === id);
        if (!r) break;
        S.sheet(`
          <div class="row" style="gap:11px;align-items:center;padding:4px 0 10px">
            <span class="rr-ava" style="width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(47,134,255,.09);border:1px solid var(--stroke)">${r.emoji}</span>
            <div class="grow"><b>${S.esc(r.task)}</b><div class="tiny muted">${S.esc(r.agent)} · ${r.id}</div></div>
            <span class="pill ${r.status === 'running' ? 'run' : r.status === 'queued' ? 'queued' : 'green'}">${r.status}</span></div>
          <div class="sect-label">Execution steps</div>
          ${r.steps.map((s, i) => `<div class="research-step ${(r.progress > i * (100 / r.steps.length)) ? 'on' : ''}"><span class="rs-dot">${i + 1}</span>${S.esc(s)}</div>`).join('')}
          <div class="row between mt12"><b class="small">Cost so far</b><span class="pill blue">$${r.cost.toFixed(2)}</span></div>
          <button class="btn soft mt12" data-act="close-sheet">Close</button>`);
        break;
      }

      /* --- workflow --- */
      case 'wf-run': S.wfRun(); break;
      case 'wf-tab': wfTab = id; S.render(true); break;
      case 'wf-toast': S.toast(id || 'Done'); break;
      case 'wf-reset': wfNodes = null; wfInit(); S.render(); S.toast('Workflow reset to template'); break;
      case 'wf-del': {
        if (!id || !wfNodes) break;
        wfNodes = wfNodes.filter(n => n.id !== id);
        wfEdges = wfEdges.filter(e => e[0] !== id && e[1] !== id);
        wfSel = wfNodes.length ? wfNodes[0].id : null;
        S.render();
        S.toast('Node removed');
        break;
      }
      case 'wf-add': {
        wfInit();
        const map = { 'Chat Input': '💬', 'Text Input': '🔤', 'MCP Search': '🔍', 'Ollama': '🤖', 'Agent': '⚡', 'Prompt': '📝', 'Vector Store': '🗄️', 'Structured Output': '📐', 'Chat Output': '💬' };
        const nid = 'x' + (wfNodes.length + 1) + Date.now().toString(36).slice(-3);
        wfNodes.push({ id: nid, type: id, ic: map[id] || '⬡', x: 40 + (wfNodes.length % 4) * 150, y: 340, body: 'new node · <b>configure me</b>' });
        wfSel = nid;
        S.render();
        S.toast(id + ' added — drag it into place');
        break;
      }

      /* --- integrations --- */
      case 'ig-save': {
        const card = document.getElementById('ig-' + id);
        if (!card) break;
        const c = cfg();
        c[id] = c[id] || {};
        let n = 0;
        card.querySelectorAll('input[data-igkey]').forEach(inp => {
          const v = inp.value.trim();
          c[id][inp.getAttribute('data-igkey')] = v;
          if (v) n++;
        });
        S.save();
        S.toast(n ? '✓ Saved ' + id + ' credentials' : 'Cleared ' + id + ' credentials');
        S.render(true);
        break;
      }
      case 'ig-test': {
        const card = document.getElementById('ig-' + id);
        const out = document.getElementById('igr-' + id);
        if (!card || !out) break;
        const c = {};
        card.querySelectorAll('input[data-igkey]').forEach(inp => { c[inp.getAttribute('data-igkey')] = inp.value.trim(); });
        const it = S.DATA.INTEGRATIONS.find(x => x.id === id) || { test: 'http' };
        const missing = Object.keys(c).filter(k => !c[k] && k !== 'WEBHOOK_SECRET');
        if (missing.length) { out.className = 'ig-result show err'; out.textContent = 'Fill ' + missing.join(' + ') + ' first'; break; }
        out.className = 'ig-result show busy';
        out.textContent = 'Connecting…';
        const fn = TESTS[it.test] || TESTS.http;
        fn(c).then(res => {
          out.className = 'ig-result show ' + (res.ok ? 'ok' : 'err');
          out.textContent = (res.ok ? '✓ ' : '✕ ') + res.msg;
          if (res.ok) { const c2 = cfg(); c2[id] = c; S.save(); }
        });
        break;
      }
      case 'ig-remove': {
        const c = cfg();
        delete c[id];
        S.save();
        S.render(true);
        S.toast('Removed ' + id + ' credentials');
        break;
      }
      case 'ig-custom': {
        S.sheet(`
          <h3 style="margin:4px 0 12px">Add custom integration</h3>
          <div class="field"><label>Name</label><input class="input" id="cuName" placeholder="My n8n webhook"></div>
          <div class="field"><label>Endpoint URL</label><input class="input" id="cuUrl" placeholder="https://hooks.example.com/sage"></div>
          <div class="field"><label>Signing secret (optional)</label><input class="input" id="cuSec" type="password" placeholder="••••••••"></div>
          <button class="btn primary mt8" data-act="ig-custom-go">Add integration</button>
          <button class="btn soft mt8" data-act="close-sheet">Cancel</button>`);
        break;
      }
      case 'ig-custom-go': {
        const nm = (S.$('#cuName') || {}).value || '';
        const url = (S.$('#cuUrl') || {}).value || '';
        const sec = (S.$('#cuSec') || {}).value || '';
        if (!nm.trim() || !/^https?:\/\//.test(url.trim())) { S.toast('Name + valid https URL required'); break; }
        const c = cfg();
        c.custom = (c.custom || []).concat([{ name: nm.trim(), url: url.trim(), secret: sec }]);
        S.save();
        S.closeSheet();
        S.render();
        S.toast('✓ ' + nm.trim() + ' added');
        break;
      }
    }
  };

})(window.SAGE);