/* SAGE ONE — App controller: router, tabbar, action dispatcher */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  const TAB_ROUTES = { home: 'home', research: 'research', wallet: 'wallet', profile: 'profile', earn: 'wallet', spark: 'wallet' };
  let current = { name: 'splash', param: null };
  let history = [];

  /* ===== desktop / phone mode (board 2) ===== */
  let modeOverride = null;
  S.deskPreferred = function () {
    try { if (!S.state().onboarded) return false; } catch (e) { return false; }
    if (modeOverride !== null) return modeOverride;
    return window.matchMedia('(min-width: 1180px)').matches;
  };
  S.isDesktop = function () { return document.body.classList.contains('on-desk'); };
  S.toggleMode = function () {
    modeOverride = !S.deskPreferred();
    S.render();
    S.toast(modeOverride ? '🖥 Desktop dashboard' : '📱 Phone experience');
  };
  function applyMode() {
    const desk = S.deskPreferred();
    document.body.classList.toggle('on-desk', desk);
    const t = S.$('#viewToggle');
    if (t) t.textContent = desk ? '📱 Phone view' : '🖥 Desktop view';
    const d = S.$('#desk');
    if (d) d.setAttribute('aria-hidden', desk ? 'false' : 'true');
    return desk;
  }
  function deskIconChrome() {
    const s1 = S.$('.dt-sic'), b1 = S.$('#dtBell1'), b2 = S.$('#dtBell2');
    if (s1) s1.innerHTML = S.icon('i-search');
    if (b1) b1.innerHTML = S.icon('i-bell');
    if (b2) b2.innerHTML = S.icon('i-bell');
    const orb = S.$('#dtOrb');
    if (orb) orb.innerHTML = S.logo(30, { spin: false });
    const dl = S.$('#dsLogo');
    if (dl) dl.innerHTML = S.logo(34);
  }
  function renderSidebar() {
    const st = S.state();
    const nav = S.$('#dsNav');
    if (nav) nav.innerHTML = S.DATA.DESK_NAV.map(n => `
      <button class="ds-item ${current.name === n.id ? 'on' : ''}" data-act="nav" data-arg="${n.id}">
        ${S.icon(n.ic)}<span>${n.name}</span></button>`).join('');
    const cr = S.$('#dsCredits'), crn = S.$('#dsCreditsNpr'), ts = S.$('#dtSpark');
    if (cr) cr.textContent = S.fmtSpark(st.spark);
    if (crn) crn.textContent = S.fmtSpark(st.spark);
    if (ts) ts.textContent = S.fmtSpark(st.spark);
    const nm = S.$('#dsName'), av = S.$('#dsAva');
    if (nm) nm.textContent = st.user.name || 'SAGE User';
    if (av) av.textContent = st.user.avatar || (st.user.name ? st.user.name[0].toUpperCase() : 'S');
    deskIconChrome();
  }
  function renderRail() {
    const rail = S.$('#deskRight');
    if (!rail) return;
    if (current.name !== 'home') { rail.innerHTML = ''; return; }
    rail.innerHTML = `
      <div class="rail-card">
        <div class="rail-head">Live Activity <span class="rail-live">● live</span></div>
        ${S.DATA.LIVE_ACTIVITY.map(a => `
        <div class="la-row" data-act="rs-start">
          <span class="src-badge" style="background:${a.c};color:${a.dark ? '#111' : '#fff'}">${a.g}</span>
          <div class="grow"><b class="small">${a.n}</b><div class="tiny muted">Found ${a.s} sources</div></div>
          <span class="tiny muted">${a.when}</span>${S.icon('i-arrow-r')}
        </div>`).join('')}
      </div>
      <div class="rail-card">
        <div class="rail-head">Recent</div>
        ${S.DATA.RECENT.map(r => `
        <div class="la-row" data-act="chat">
          <span class="iconbox" style="width:32px;height:32px">${S.icon(r.ic)}</span>
          <div class="grow"><b class="small ellipsis">${r.n}</b><div class="tiny muted">${r.when}</div></div>
          ${S.icon('i-arrow-r')}
        </div>`).join('')}
      </div>
      <div class="rail-foot">More than an AI.<br><b>It's your edge.</b></div>`;
  }

  /* ===== navigation ===== */
  S.go = function (name, param, opts) {
    if (!S.screens[name]) name = 'home';
    if (current.name !== name || current.param !== param) {
      if (!(opts && opts.replace)) history.push(current);
      if (history.length > 40) history.shift();
    }
    current = { name, param };
    S.render();
  };
  S.back = function () {
    const prev = history.pop();
    current = prev && S.screens[prev.name] ? prev : { name: 'home', param: null };
    S.render();
  };
  S.currentRoute = function () { return current.name; };

  /* ===== render ===== */
  S.render = function (keepScroll) {
    const def = S.screens[current.name] || S.screens.home;
    const desk = applyMode();
    const target = desk ? S.$('#deskContent') : S.$('#screen');
    const other = desk ? S.$('#screen') : S.$('#deskContent');
    if (other) other.innerHTML = '';
    const oldView = target ? S.$('.view', target) : null;
    const scroll = keepScroll && oldView ? oldView.scrollTop : 0;

    document.body.classList.toggle('desk-home', desk && current.name === 'home');
    const html = `<div class="view ${def.nonav ? 'nonav' : ''} ${def.flush ? 'flush' : ''} ${def.chat ? 'chatview' : ''} ${def.back ? 'has-back' : ''}">${def.view(current.param)}</div>`;
    if (target) target.innerHTML = html;
    if (desk) { renderSidebar(); renderRail(); }
    else renderTabbar(def);
    S.applyTheme();
    if (keepScroll) { const v = target && S.$('.view', target); if (v) v.scrollTop = scroll; }
    if (def.mount) def.mount(current.param);
  };

  function renderTabbar(def) {
    const bar = S.$('#tabbar');
    if (def.nonav) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    bar.classList.remove('hidden');
    const act = TAB_ROUTES[current.name] || '';
    const ic = (n) => S.icon(n);
    bar.innerHTML = `
      <button class="tab ${act === 'home' ? 'active' : ''}" data-act="tab" data-arg="home">${ic('i-home')}<span>${S.t('nav.home')}</span></button>
      <button class="tab ${act === 'research' ? 'active' : ''}" data-act="tab" data-arg="research">${ic('i-search')}<span>Research</span></button>
      <button class="tab center ${current.name === 'chat' ? 'active' : ''}" data-act="chat"><div class="orb">${ic('i-chat')}</div></button>
      <button class="tab ${act === 'wallet' ? 'active' : ''}" data-act="tab" data-arg="wallet">${ic('i-wallet')}<span>Wallet</span></button>
      <button class="tab ${act === 'profile' ? 'active' : ''}" data-act="tab" data-arg="profile">${ic('i-user')}<span>Profile</span></button>`;
  }

  /* ===== level-up: plays the signature 9-step transition ===== */
  S.handleLevelUp = function (leveled) {
    if (!leveled) return;
    const order = ['low', 'mid', 'high'];
    const from = leveled.newRank
      ? { stage: leveled.stage - 1, level: 'high' }
      : { stage: leveled.stage, level: order[Math.max(0, order.indexOf(leveled.level) - 1)] };
    setTimeout(() => {
      S.playTransition(from.stage, from.level, leveled.stage, leveled.level, () => {
        S.toast(leveled.newRank
          ? '🏆 New rank: ' + S.DATA.EVOLUTIONS[leveled.stage - 1].name + '!'
          : 'Level up: ' + leveled.level.toUpperCase() + ' intensity unlocked');
        if (S.clearEvoPreview) S.clearEvoPreview();
        S.render();
      });
    }, 550);
  };

  /* ===== action dispatcher ===== */
  S.act = function (name, arg) {
    const st = S.state();
    switch (name) {

      /* --- nav --- */
      case 'nav': S.go(arg); break;
      case 'back': S.back(); break;
      case 'tab': history = []; S.go(arg, null, { replace: true }); break;
      case 'chat': S.go('chat'); break;
      case 'noop': break;
      case 'toast': S.toast(arg); break;
      case 'close-sheet': S.closeSheet(); break;
      case 'skip-fx': if (S._fxSkip) S._fxSkip(); break;
      case 'toggle-mode': S.toggleMode(); break;

      /* --- agent workspace (board 5-8: control, marketplace, workflow, integrations) --- */
      case 'ag': S.AG_ACT(arg); break;

      /* --- home ask bar --- */
      case 'home-ask': {
        const inp = S.$('#homeAsk');
        const v = inp && inp.value.trim();
        S.go('chat');
        if (v) setTimeout(() => S.sendChat(v), 150);
        break;
      }

      /* --- research lab (board 4) --- */
      case 'rs-start': S.rsStop(); S.rsJump(0); S.go('research'); setTimeout(() => S.rsPlay(), 80); break;
      case 'rs-analyze': S.rsStop(); S.rsJump(2); S.go('research'); break;
      case 'rs-set': S.rsStop(); S.rsSet(+arg); break;
      case 'rs-play': S.rsPlay(); break;
      case 'rs-fail': {
        S.closeSheet();
        if (S.currentRoute() !== 'research') S.go('research');
        S.playFailure({ preview: true });
        break;
      }
      case 'fail-retry': {
        S.toast('Live research is not connected yet. No retry request was sent.');
        break;
      }
      case 'logo-preview': S.previewState(arg); break;
      case 'src-detail': S.srcDetail(arg); break;
      case 'src-tab': S.srcTab(arg); break;
      case 'src-all': S.toast('12 sources · 7 verified · 2 rejected'); break;

      /* --- earning animation (board 3) --- */
      case 'sim-earn': S.closeSheet(); S.playEarning(5000, { source: 'Animation Preview', preview: true, noCredit: true }); break;
      case 'earn-tier': S.closeSheet(); S.playEarning(+arg, { source: 'Project Payment' }); break;

      /* --- premium (board 2) --- */
      case 'premium-upgrade': {
        const pm = S.DATA.PAYMENTS.find(p => p.id === st.payMethod);
        S.sheet(`
          <h3>Upgrade to SAGE Premium</h3>
          <div class="sub">Unlock more. Do more. · NPR 999/month</div>
          <div class="card mb12">
            ${S.DATA.PREMIUM_FEATURES.map(f => `<div class="row small" style="padding:5px 0"><span style="color:#34d399">✓</span> ${f}</div>`).join('')}
          </div>
          <div class="tiny muted mb12">Pay with ${pm.name} · cancel anytime</div>
          <button class="btn primary" data-act="premium-confirm" style="background:linear-gradient(135deg,#6d4dff,#9d7bff)">${S.icon('i-crown')} Upgrade Now</button>`);
        break;
      }
      case 'premium-confirm':
        st.premium = true; S.save(); S.closeSheet(); S.render();
        S.toast('SAGE Premium active ✓ Full power unlocked');
        if (S.previewState) S.previewState('premium');
        break;
      case 'premium-cancel':
        st.premium = false; S.save(); S.render(); S.toast('Premium plan ended · basics stay free'); break;

      /* --- onboarding --- */
      case 'lang': S.setLang(arg); S.render(); break;
      case 'auth-continue': {
        const n = ((S.$('#au-name') || {}).value || '').trim();
        const p = ((S.$('#au-phone') || {}).value || '').trim();
        const e = ((S.$('#au-email') || {}).value || '').trim();
        st.user.name = n || 'Ramesh Shrestha';
        st.user.phone = p || '+977 9800000000';
        st.user.email = e;
        S.save(); S.toast('Account created · OTP verified ✓');
        S.go('kyc'); break;
      }
      case 'auth-google':
        st.user.name = st.user.name || 'Ramesh Shrestha'; S.save();
        S.toast('Signed in with Google ✓'); S.go('kyc'); break;
      case 'kyc-start': {
        if (st.kyc.face && st.kyc.nid) { S.go('profile-create'); break; }
        S.sheet(`
          <h3>Verification in progress</h3>
          <div class="sub">Face scan + NID check — simulated in this preview</div>
          <div class="tl-step on"><div class="tl-dot">1</div><div><b class="small">Capturing face geometry</b><div class="tiny muted">3D liveness check…</div></div></div>
          <div class="tl-step on"><div class="tl-dot">2</div><div><b class="small">Reading NID chip</b><div class="tiny muted">Verifying with Nepal DoT…</div></div></div>
          <div class="tl-step on"><div class="tl-dot">3</div><div><b class="small">Matching identity</b><div class="tiny muted">Confidence 99.2%…</div></div></div>
          <button class="btn primary mt12" data-act="kyc-done">Complete Verification</button>`);
        break;
      }
      case 'kyc-done':
        st.kyc.face = true; st.kyc.nid = true; S.save(); S.closeSheet();
        S.toast('KYC verified ✓ Full access unlocked'); S.go('profile-create'); break;
      case 'pick-avatar': {
        const avatars = ['🧘', '🦅', '🏔️', '🦁', '🐺', '🪔'];
        st.user.avatar = avatars[Math.floor(Math.random() * avatars.length)];
        S.save(); S.render(); S.toast('Profile photo added'); break;
      }
      case 'profile-save': {
        const n = ((S.$('#pc-name') || {}).value || '').trim();
        const l = ((S.$('#pc-loc') || {}).value || '').trim();
        const p = ((S.$('#pc-phone') || {}).value || '').trim();
        if (n) st.user.name = n;
        if (l) st.user.location = l;
        if (p) st.user.phone = p;
        if (!st.user.avatar) st.user.avatar = (st.user.name || 'S')[0].toUpperCase();
        S.save(); S.go('welcome-go'); break;
      }
      case 'finish-onboard':
        st.onboarded = true; S.save(); S.go('home'); S.toast('Welcome to SAGE ONE 🙏'); break;

      /* --- chat --- */
      case 'chat-send': {
        const inp = S.$('#chatInput');
        if (inp && inp.value.trim()) { const v = inp.value; inp.value = ''; S.sendChat(v); }
        break;
      }
      case 'chat-quick': S.sendChat(arg); break;
      case 'chat-action': S.chatAction(arg); break;

      /* --- marketplace --- */
      case 'mkt-cat': S.setMktCat(arg); break;
      case 'listing': S.go('listing-detail', arg); break;
      case 'buy-listing': {
        const l = S.DATA.LISTINGS.find(x => x.id === arg);
        if (!l) break;
        const fee = Math.round(l.price * S.marketFeePct(l.price) / 100);
        S.sheet(`
          <h3>Confirm Purchase</h3>
          <div class="sub">${S.esc(l.title)} · ${S.esc(l.loc)}</div>
          <div class="card" style="margin-bottom:12px">
            <div class="row between small"><span class="muted">Item</span><span>${S.npr(l.price)}</span></div>
            <div class="row between small mt8"><span class="muted">Marketplace fee (${S.marketFeePct(l.price)}%)</span><span>${S.npr(fee)}</span></div>
            <div class="divider"></div>
            <div class="row between"><b>Total</b><b style="color:var(--electric-2)">${S.npr(l.price + fee)}</b></div>
          </div>
          <div class="tiny muted mb12">Pay with ${S.DATA.PAYMENTS.find(p => p.id === st.payMethod).name} · KYC verified</div>
          <button class="btn primary" data-act="buy-confirm" data-arg="${l.id}">${S.icon('i-lock')} Pay ${S.npr(l.price + fee)}</button>`);
        break;
      }
      case 'buy-confirm': {
        const l = S.DATA.LISTINGS.find(x => x.id === arg);
        S.closeSheet();
        S.toast('Purchase complete ✓ ' + (l ? l.title : ''));
        const lvl = S.addProgress(5, 'Marketplace trade');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }
      case 'sell-submit': {
        const t = ((S.$('#sell-title') || {}).value || '').trim();
        const p = parseInt(((S.$('#sell-price') || {}).value || '').replace(/\D/g, ''), 10);
        if (!t || !p) { S.toast('Add a title and price first'); break; }
        const reward = Math.round(p * 0.02);
        st.earnings.marketplace += reward;
        st.lifetimeEarned += reward;
        S.save();
        S.toast('Listing published! Fee ' + S.npr(Math.round(p * S.marketFeePct(p) / 100)));
        const lvl = S.addProgress(6, 'Item listed for sale');
        if (lvl) S.handleLevelUp(lvl);
        S.go('marketplace');
        break;
      }

      /* --- jobs --- */
      case 'job-filter': S.setJobFilter(arg); break;
      case 'apply-job': {
        if (!st.appliedJobs.includes(arg)) st.appliedJobs.push(arg);
        S.save(); S.render();
        S.toast('Application sent ✓ Evidence added to Evolution');
        const lvl = S.addProgress(7, 'Job application sent');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }

      /* --- learning --- */
      case 'learn-tab': S.setLearnTab(arg); break;
      case 'course': S.go('course-detail', arg); break;
      case 'enroll': {
        if (!st.enrolled.includes(arg)) st.enrolled.push(arg);
        S.save(); S.render(); S.toast('Enrolled ✓ Your learning path is ready');
        const lvl = S.addProgress(4, 'Course enrolled');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }
      case 'course-complete': {
        const parts = arg.split('|');
        const c = S.DATA.COURSES.find(x => x.id === parts[0]);
        S.toast('Module ' + (+parts[1] + 1) + ' complete ✓ · ' + (c ? c.title : ''));
        const lvl = S.addProgress(9, 'Module completed');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }

      /* --- community --- */
      case 'comm-tab': S.setCommTab(arg); break;

      /* --- AI studio --- */
      case 'ai-tool': {
        if (arg === 'image') S.go('ai-image');
        else if (arg === 'video') S.go('ai-video');
        else S.toast('Code Generation — coming soon ⏳');
        break;
      }
      /* P0 honesty (F2): no image provider is connected. The canvas below is a local
         demo drawing — never charge Spark, never record an AI-generated file, never
         claim an image was "generated" by a model. */
      case 'gen-image': {
        const prompt = ((S.$('#gen-prompt') || {}).value || '').trim();
        S.drawGenerated(prompt);
        S.toast('Demo artwork drawn locally · no image provider is configured, so nothing was charged and no file was saved.');
        break;
      }
      /* P0 honesty (F1): no video provider is connected — no artifact exists, so no
         file entry, no NPR content reward and no Spark charge may be recorded. */
      case 'gen-video': {
        S.toast('Video generation needs a configured provider. No video was rendered, no file was created, and no Spark was charged.');
        break;
      }

      /* --- spark & money --- */
      case 'pay-method':
        st.payMethod = arg; S.save(); S.render();
        S.toast(S.DATA.PAYMENTS.find(p => p.id === arg).name + ' selected'); break;
      case 'buy-spark': {
        const pm = S.DATA.PAYMENTS.find(p => p.id === st.payMethod);
        S.sheet(`
          <h3>Buy Spark</h3>
          <div class="sub">1 Spark = NPR 1 · KYC verified &amp; secure</div>
          <div class="grid2" style="margin-bottom:12px">
            ${[100, 500, 1250, 5000].map(v => `
            <button class="btn soft" data-act="buy-spark-amount" data-arg="${v}" style="flex-direction:column;gap:2px;padding:12px">
              <b>${S.fmtSpark(v)}</b><span class="tiny muted">Spark · ${S.npr(v)}</span></button>`).join('')}
          </div>
          <div class="field"><label>Custom amount</label><input class="input" id="spark-custom" inputmode="numeric" placeholder="e.g. 2500"></div>
          <button class="btn primary mt8" data-act="buy-spark-custom">${S.icon('i-bolt')} Purchase with ${pm.name}</button>
          <div class="notice">Payment flow: Choose ${pm.name} → Secure payment (KYC verified) → Instant Spark credited</div>`);
        break;
      }
      case 'buy-spark-amount': S.addSpark(+arg, 'Purchased'); S.closeSheet(); S.render(); break;
      case 'buy-spark-custom': {
        const v = parseInt(((S.$('#spark-custom') || {}).value || '').replace(/\D/g, ''), 10);
        if (!v) { S.toast('Enter an amount'); break; }
        S.addSpark(v, 'Purchased'); S.closeSheet(); S.render(); break;
      }
      case 'send-spark': {
        S.sheet(`
          <h3>Send Spark</h3>
          <div class="sub">Instant transfer to any SAGE user · balance ${S.fmtSpark(st.spark)}</div>
          <div class="field"><label>Recipient (phone or SAGE ID)</label><input class="input" placeholder="+977 98XXXXXXXX"></div>
          <div class="field"><label>Amount</label><input class="input" id="send-amt" inputmode="numeric" placeholder="e.g. 250"></div>
          <button class="btn primary mt8" data-act="send-spark-go">${S.icon('i-share')} Send Spark</button>`);
        break;
      }
      case 'send-spark-go': {
        const v = parseInt(((S.$('#send-amt') || {}).value || '').replace(/\D/g, ''), 10);
        if (!v || v > st.spark) { S.toast('Check the amount (balance ' + S.fmtSpark(st.spark) + ')'); break; }
        S.addSpark(-v, 'Sent'); S.closeSheet(); S.render();
        const lvl = S.addProgress(2, 'Sent Spark to a peer');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }

      /* --- earn & withdraw --- */
      case 'earn-range': S.setEarnRange(arg); break;
      case 'withdraw': {
        S.sheet(`
          <h3>Withdraw to Bank</h3>
          <div class="sub">Only through approved &amp; regulated partners</div>
          <div class="field"><label>Amount (NPR)</label><input class="input" id="wd-amt" inputmode="numeric" placeholder="e.g. 5000"></div>
          <div class="fee-box" style="margin-bottom:12px">
            <div class="row between small"><span class="muted">Withdrawal fee</span><b id="wd-fee">—</b></div>
            <div class="tiny muted mt8">Evolution is lifetime achievement — withdrawal never reduces it.</div>
          </div>
          <button class="btn primary" data-act="withdraw-go">${S.icon('i-bank')} Confirm Withdrawal</button>`);
        const inp = S.$('#wd-amt');
        if (inp) inp.addEventListener('input', () => {
          const v = parseInt(inp.value.replace(/\D/g, ''), 10) || 0;
          S.$('#wd-fee').textContent = v ? S.npr(Math.round(v * S.txFeePct(v) / 100)) + ' (' + S.txFeePct(v) + '%)' : '—';
        });
        break;
      }
      case 'withdraw-go': {
        const v = parseInt(((S.$('#wd-amt') || {}).value || '').replace(/\D/g, ''), 10);
        if (!v) { S.toast('Enter an amount'); break; }
        S.closeSheet();
        S.toast('Withdrawal of ' + S.npr(v) + ' initiated ✓ (fee ' + S.txFeePct(v) + '%)');
        const lvl = S.addProgress(3, 'Funds withdrawn');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }

      /* --- evolution --- */
      case 'evo-preview': S.evoPreview(+arg); break;
      case 'evo-view-current': S.clearEvoPreview(); S.render(); break;
      case 'evo-level': {
        if (S.isEvoPreview()) { S.setEvoPreviewLevel(arg); break; }
        const order = ['low', 'mid', 'high'];
        const e = st.evo;
        if (order.indexOf(arg) <= order.indexOf(e.level)) { e.level = arg; S.save(); S.render(); }
        else S.toast('Reach ' + arg.toUpperCase() + ' by training your Evolution');
        break;
      }
      case 'train-evolution': {
        const lvl = S.addProgress(8, 'Skill training session');
        if (lvl) S.handleLevelUp(lvl); else S.render();
        break;
      }
      case 'play-transition': {
        const e = st.evo;
        const nextStage = e.level === 'high' ? Math.min(13, e.stage + 1) : e.stage;
        const nextLevel = e.level === 'low' ? 'mid' : e.level === 'mid' ? 'high' : 'low';
        S.playTransition(e.stage, e.level, nextStage, nextLevel, () => {
          if (S.clearEvoPreview) S.clearEvoPreview();
          S.render();
        });
        break;
      }

      /* --- AI engine --- */
      case 'ai-mode': {
        S.AI.setCfg({ mode: arg });
        S.render();
        S.toast('AI providers are managed by SAGE Core. Browser API-key mode is disabled.');
        break;
      }
      case 'ai-provider': {
        const isGem = arg === 'gemini';
        S.AI.setCfg({
          provider: arg,
          model: isGem ? 'gemini-1.5-flash' : 'gpt-4o-mini',
          base: isGem ? '' : 'https://api.openai.com/v1'
        });
        S.render();
        break;
      }
      case 'ai-save': {
        const k = ((S.$('#aiKey') || {}).value || '').trim();
        const mdl = ((S.$('#aiModel') || {}).value || '').trim();
        const b = ((S.$('#aiBase') || {}).value || '').trim();
        S.AI.setCfg({ key: k, model: mdl || undefined, base: b || undefined });
        S.render();
        S.toast('Browser API keys are disabled. Configure providers on the SAGE Core server instead.');
        break;
      }
      case 'ai-test': {
        if (!S.backend || !S.backend.checkConfig) { S.toast('SAGE Core connection is not ready.'); break; }
        S.toast('Testing connection…');
        S.backend.checkConfig()
          .then(c => S.toast(c.googleConfigured ? 'Core identity configuration loaded. AI provider health is not yet exposed.' : 'Core responded, but Google sign-in is not configured.'))
          .catch(e => S.toast('Core configuration check failed: ' + (e && e.message ? e.message : 'connection failed')));
        break;
      }

      /* --- settings --- */
      case 'theme': {
        S.setTheme(arg); S.render();
        S.toast((arg === 'dark' ? 'Dark (Default)' : arg === 'light' ? 'Light' : 'Blue Theme') + ' applied · SAGE identity preserved');
        break;
      }
      case 'reset-app': {
        S.sheet(`
          <h3>Reset App Data?</h3>
          <div class="sub">This clears your local SAGE state and restarts onboarding.</div>
          <button class="btn primary" data-act="reset-confirm">Yes, reset everything</button>
          <button class="btn soft mt8" data-act="close-sheet">Cancel</button>`);
        break;
      }
      case 'reset-confirm':
        S.reset(); S.closeSheet(); S.applyTheme(); history = []; S.go('splash', null, { replace: true }); break;

      default:
        /* agent-workspace actions are handled by S.AG_ACT (mission control,
           marketplace, workflow builder, integrations). The buttons emit a bare
           data-act (e.g. "ig-test", "agent-hire", "wf-run") that this switch
           doesn't own, so forward anything AG_ACT recognizes instead of dropping it. */
        if (S.AG_ACT && S.AG_ACT_KNOWN && S.AG_ACT_KNOWN.indexOf(name) !== -1) { S.AG_ACT(name + (arg != null && arg !== '' ? ':' + arg : '')); break; }
        break;
    }
  };

  /* ===== delegated events ===== */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    e.preventDefault();
    S.act(el.getAttribute('data-act'), el.getAttribute('data-arg'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'chatInput') S.act('chat-send');
  });

  /* ===== boot ===== */
  window.addEventListener('DOMContentLoaded', () => {
    S.load();
    S.applyTheme();
    const bl = S.$('#brandLogo');
    if (bl) bl.innerHTML = S.logo(56);
    S.initStars();
    S.go(S.state().onboarded ? 'home' : 'splash', null, { replace: true });
    /* auto-switch desktop ↔ phone when the viewport crosses the breakpoint */
    let lastDesk = S.isDesktop();
    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const desk = S.deskPreferred();
        if (desk !== lastDesk) { lastDesk = desk; S.render(); }
      }, 150);
    });
  });

})(window.SAGE);
