/* SAGE ONE — Apps: Marketplace, Jobs, Learning, Community, Files, AI Studio */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const R = S.screens = S.screens || {};

  /* ===== MARKETPLACE ===== */
  let mktCat = 'all', mktQuery = '';
  let jobFilter = 'All', learnTab = 'For You', commTab = 'Groups';

  /* filter setters called by the action dispatcher */
  S.setMktCat = function (v) { mktCat = v; S.render(); };
  S.setJobFilter = function (v) { jobFilter = v; S.render(); };
  S.setLearnTab = function (v) { learnTab = v; S.render(); };
  S.setCommTab = function (v) { commTab = v; S.render(); };
  R.marketplace = {
    view: () => {
      const list = S.DATA.LISTINGS.filter(l =>
        (mktCat === 'all' || l.cat === mktCat) &&
        (!mktQuery || l.title.toLowerCase().includes(mktQuery.toLowerCase())));
      return `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Marketplace</h2><div class="tiny muted">Buy, sell, and explore trusted listings</div></div>
        <button class="btn xs primary" data-act="nav" data-arg="sell">${S.icon('i-plus')} Sell</button>
      </div>
      <div class="search-bar">${S.icon('i-search')}<input id="mkt-q" placeholder="Search anything…" value="${S.esc(mktQuery)}" data-act="mkt-search"></div>
      <div class="cat-row">
        ${S.DATA.CATS.map(c => `
        <div class="cat ${mktCat === c.id ? 'active' : ''}" data-act="mkt-cat" data-arg="${c.id}">
          <div class="ci">${S.icon(c.ic)}</div><span>${c.name}</span>
        </div>`).join('')}
      </div>
      ${list.length ? list.map(l => `
        <div class="listing" data-act="listing" data-arg="${l.id}">
          <div class="ph ${l.ph}"><span style="font-size:44px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))">${l.emoji}</span>
            <div class="grow"></div><div class="price">${S.npr(l.price)}</div></div>
          <div class="meta row between">
            <div><h4>${S.esc(l.title)}</h4><p>${S.esc(l.loc)} · ${S.esc(l.when)}</p></div>
            <span class="pill blue">${S.marketFeePct(l.price)}% fee</span>
          </div>
        </div>`).join('') : `
        <div style="text-align:center;padding:40px 0" class="muted">
          <div style="font-size:40px;margin-bottom:10px">🔍</div>No listings found
        </div>`}
      <div class="fee-box mt8">
        <div class="row between"><b class="small">Marketplace Fee (Buy/Sell)</b><span class="pill gold">8% → 1%</span></div>
        <div class="tiny muted mt8">Based on price band · <span class="link" style="color:var(--electric-2);cursor:pointer" data-act="nav" data-arg="fees">See full table</span></div>
      </div>`;
    },
    mount() {
      const q = S.$('#mkt-q');
      if (q) q.addEventListener('input', (e) => {
        mktQuery = e.target.value;
        S.render(true);
        const nq = S.$('#mkt-q'); if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); }
      });
    }
  };

  R['listing-detail'] = {
    back: 'marketplace',
    view: (id) => {
      const l = S.DATA.LISTINGS.find(x => x.id === id) || S.DATA.LISTINGS[0];
      const fee = Math.round(l.price * S.marketFeePct(l.price) / 100);
      return `
      ${S.topNav(l.title, l.loc + ' · ' + l.when)}
      <div class="detail-hero ${l.ph}"><span style="font-size:84px;filter:drop-shadow(0 10px 24px rgba(0,0,0,.55))">${l.emoji}</span>
        <div class="grow"></div><div class="price" style="align-self:flex-end">${S.npr(l.price)}</div></div>
      <div class="row mb12" style="gap:8px"><span class="pill blue">${S.esc(l.cat)}</span><span class="pill green">${S.icon('i-shield')} Verified seller</span></div>
      <p class="small muted" style="line-height:1.8">${S.esc(l.desc)}</p>
      <div class="fee-box mt16">
        <b class="small">Price Breakdown</b>
        <div class="row between mt8 small"><span class="muted">Item price</span><span>${S.npr(l.price)}</span></div>
        <div class="row between small"><span class="muted">Marketplace fee (${S.marketFeePct(l.price)}%)</span><span>− ${S.npr(fee)}</span></div>
        <div class="divider"></div>
        <div class="row between"><b>Seller receives</b><b style="color:var(--electric-2)">${S.npr(l.price - fee)}</b></div>
      </div>
      <div class="grid2 mt16">
        <button class="btn soft" data-act="toast" data-arg="Saved to wishlist ❤">${S.icon('i-heart')} Save</button>
        <button class="btn primary" data-act="buy-listing" data-arg="${l.id}">${S.icon('i-bag')} Buy Now</button>
      </div>`;
    }
  };

  R.sell = {
    back: 'marketplace',
    view: () => `
      ${S.topNav('Sell on SAGE', 'List an item in under a minute')}
      <div class="field"><label>Title</label><input class="input" id="sell-title" placeholder="e.g. Samsung Galaxy S23"></div>
      <div class="field"><label>Price (NPR)</label><input class="input" id="sell-price" inputmode="numeric" placeholder="e.g. 65000"></div>
      <div class="field"><label>Category</label>
        <select class="input" id="sell-cat">${S.DATA.CATS.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Location</label><input class="input" id="sell-loc" placeholder="e.g. Kathmandu" value="Kathmandu"></div>
      <div class="fee-box mt8"><div class="row between"><span class="small muted">Estimated fee</span><b id="sell-fee" style="color:var(--electric-2)">—</b></div>
        <div class="tiny muted mt8">Sellers keep 92–99% depending on price band.</div></div>
      <button class="btn primary mt16" data-act="sell-submit">${S.icon('i-plus')} Publish Listing</button>`,
    mount() {
      const p = S.$('#sell-price'), f = S.$('#sell-fee');
      if (p && f) p.addEventListener('input', () => {
        const v = parseInt(p.value.replace(/\D/g, ''), 10);
        f.textContent = v ? S.npr(Math.round(v * S.marketFeePct(v) / 100)) + ' (' + S.marketFeePct(v) + '%)' : '—';
      });
    }
  };

  /* ===== JOBS ===== */
  R.jobs = {
    view: () => {
      const filters = ['All', 'Remote', 'Full-time', 'Part-time'];
      const list = S.DATA.JOBS.filter(j => jobFilter === 'All' || j.type === jobFilter || j.loc === jobFilter);
      return `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Jobs</h2><div class="tiny muted">Find your next opportunity in Nepal</div></div>
        ${S.sparkTag()}
      </div>
      <div class="search-bar">${S.icon('i-search')}<input placeholder="Search jobs in Nepal…"></div>
      <div class="chiprow">${filters.map(f => `<button class="chip ${jobFilter === f ? 'active' : ''}" data-act="job-filter" data-arg="${f}">${f}</button>`).join('')}</div>
      ${list.map(j => {
        const applied = S.state().appliedJobs.includes(j.id);
        return `
        <div class="job-card">
          <div class="logo" style="background:${j.c}">${j.logo}</div>
          <div class="grow">
            <b class="small">${S.esc(j.title)}</b>
            <div class="tiny muted" style="margin-top:2px">${S.esc(j.company)} · ${S.esc(j.loc)} · ${S.esc(j.type)}</div>
            <div style="font-size:12.5px;font-weight:700;color:var(--electric-2);margin-top:5px">${S.esc(j.pay)}</div>
            <div class="row mt8" style="gap:6px;flex-wrap:wrap">${j.tags.map(t => `<span class="pill blue">${S.esc(t)}</span>`).join('')}</div>
          </div>
          <button class="btn xs ${applied ? 'soft' : 'primary'}" data-act="apply-job" data-arg="${j.id}" ${applied ? 'disabled' : ''}>${applied ? 'Applied ✓' : 'Apply'}</button>
        </div>`;
      }).join('')}
      <div class="card mt8 row" style="gap:10px"><div class="iconbox">${S.icon('i-bolt')}</div>
        <div class="tiny muted grow">Every application you send is <b>work evidence</b> — it feeds your Evolution, not your wallet.</div></div>`;
    }
  };

  /* ===== LEARNING ===== */
  R.learning = {
    view: () => {
      const tabs = ['For You', 'Courses', 'Skills', 'Certificates'];
      return `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Learning</h2><div class="tiny muted">Grow skills that drive Evolution</div></div>
        ${S.sparkTag()}
      </div>
      <div class="chiprow">${tabs.map(t => `<button class="chip ${learnTab === t ? 'active' : ''}" data-act="learn-tab" data-arg="${t}">${t}</button>`).join('')}</div>
      ${learnTab === 'Certificates' ? renderCerts() : S.DATA.COURSES.map(c => {
        const enrolled = S.state().enrolled.includes(c.id);
        const prog = enrolled ? Math.max(c.prog, 5) : c.prog;
        return `
        <div class="course-card" data-act="course" data-arg="${c.id}">
          <div class="thumb" style="background:${c.g}"><span style="font-size:44px;position:absolute;left:14px;bottom:10px">${c.emoji}</span>
            <div class="play">${S.icon('i-arrow-r')}</div></div>
          <div class="body">
            <b class="small">${S.esc(c.title)}</b>
            <div class="tiny muted" style="margin:3px 0 8px">${S.esc(c.meta)}</div>
            ${prog > 0 ? `<div class="bar"><i style="width:${prog}%"></i></div><div class="tiny muted" style="margin-top:5px">${prog}% complete</div>` :
              `<span class="pill blue">Not started</span>`}
          </div>
        </div>`;
      }).join('')}`;
    }
  };

  function renderCerts() {
    const st = S.state();
    const earned = st.evo.stage >= 1;
    return `
    <div class="card glow" style="text-align:center;padding:22px">
      <div style="font-size:44px">🎓</div>
      <b class="small">Skill Certificate</b>
      <div class="tiny muted mt8">Complete any course to mint a verifiable SAGE certificate.</div>
      <button class="btn primary sm mt12" style="width:100%" data-act="nav" data-arg="learning">Continue Learning</button>
    </div>
    <div class="sect-label">Earned</div>
    <div class="list-item"><div class="iconbox">${S.icon('i-award')}</div>
      <div class="grow"><b class="small">Stage 1 — Initiate</b><div class="tiny muted">Foundation badge · ${earned ? 'Earned' : 'In progress'}</div></div>
      <span class="pill ${earned ? 'green' : 'blue'}">${earned ? 'Earned' : 'Active'}</span></div>`;
  }

  R['course-detail'] = {
    back: 'learning',
    view: (id) => {
      const c = S.DATA.COURSES.find(x => x.id === id) || S.DATA.COURSES[0];
      const enrolled = S.state().enrolled.includes(c.id);
      const modules = ['Introduction & Setup', 'Core Concepts', 'Building UI', 'State Management', 'APIs & Data', 'Deployment'];
      return `
      ${S.topNav(c.title, c.meta)}
      <div class="detail-hero" style="background:${c.g};display:flex;align-items:center;justify-content:center"><span style="font-size:76px">${c.emoji}</span></div>
      <div class="grid3 mb12">
        <div class="stat-tile" style="text-align:center"><div class="v" style="font-size:14px">${c.meta.split('·')[0].trim()}</div><div class="k">MODULES</div></div>
        <div class="stat-tile" style="text-align:center"><div class="v" style="font-size:14px">${c.meta.split('·')[1].trim()}</div><div class="k">LEVEL</div></div>
        <div class="stat-tile" style="text-align:center"><div class="v" style="font-size:14px;color:var(--accent-glow)">+12</div><div class="k">EVOLUTION</div></div>
      </div>
      <div class="sect-label">Modules</div>
      ${modules.map((m, i) => `
        <div class="list-item" data-act="${enrolled ? 'course-complete' : 'toast'}" data-arg="${enrolled ? c.id + '|' + i : 'Enroll first to unlock modules'}">
          <div class="iconbox" style="width:34px;height:34px">${enrolled && i < 2 ? S.icon('i-check') : (i + 1)}</div>
          <div class="grow"><b class="small">${S.esc(m)}</b><div class="tiny muted">${8 + i * 2} min · video + practice</div></div>
          ${enrolled ? `<span class="pill blue">Open</span>` : `<span class="pill blue">${S.icon('i-lock')}</span>`}
        </div>`).join('')}
      <button class="btn ${enrolled ? 'soft' : 'primary'} mt12" data-act="enroll" data-arg="${c.id}" ${enrolled ? 'disabled' : ''}>
        ${enrolled ? 'Enrolled ✓' : 'Enroll — Free with Spark Pass'}</button>`;
    }
  };

  /* ===== COMMUNITY ===== */
  R.community = {
    view: () => {
      const tabs = ['Groups', 'Training', 'Events'];
      return `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Community</h2><div class="tiny muted">Connect, train &amp; share with Nepal</div></div>
        <div class="iconbox">${S.icon('i-users')}</div>
      </div>
      <div class="chiprow">${tabs.map(t => `<button class="chip ${commTab === t ? 'active' : ''}" data-act="comm-tab" data-arg="${t}">${t}</button>`).join('')}</div>
      ${commTab === 'Groups' ? S.DATA.GROUPS.map(g => `
        <div class="list-item" data-act="toast" data-arg="Joined ${S.esc(g.name)} — say namaste! 🙏">
          <div class="group-avatar" style="background:${g.c}">${g.emoji}</div>
          <div class="grow"><b class="small">${S.esc(g.name)}</b><div class="tiny muted">${S.esc(g.meta)}</div></div>
          <button class="btn xs ghost">Join</button>
        </div>`).join('')
        : commTab === 'Training' ? `
        <div class="card glow"><div class="row" style="gap:10px"><div class="iconbox">${S.icon('i-book')}</div>
          <div class="grow"><b class="small">Live Training: Freelancing 101</b><div class="tiny muted">Tomorrow 4 PM · 420 going</div></div></div>
          <button class="btn xs primary mt12" style="width:100%" data-act="toast" data-arg="Seat reserved for Freelancing 101 ✅">Reserve Seat</button></div>
        <div class="card mt12"><div class="row" style="gap:10px"><div class="iconbox">${S.icon('i-sparkles')}</div>
          <div class="grow"><b class="small">AI Prompt Workshop</b><div class="tiny muted">Friday 5 PM · 210 going</div></div></div></div>`
        : `
        <div class="card glow"><span class="pill gold">THIS WEEK</span>
          <b class="small" style="display:block;margin-top:8px">Kathmandu Dev Meetup</b>
          <div class="tiny muted">Sat · Thamel · 150 developers</div></div>
        <div class="card mt12"><span class="pill blue">NEXT WEEK</span>
          <b class="small" style="display:block;margin-top:8px">Pokhara Startup Mixer</b>
          <div class="tiny muted">Lakeside · Founders &amp; freelancers</div></div>`}`;
    }
  };

  /* ===== FILES ===== */
  R.files = {
    view: () => {
      const st = S.state();
      return `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">Files</h2><div class="tiny muted">Create images, videos, code &amp; more</div></div>
        <button class="btn xs primary" data-act="toast" data-arg="Upload dialog (demo)">${S.icon('i-plus')} Upload</button>
      </div>
      <div class="chiprow"><button class="chip active">Recent</button><button class="chip">Documents</button><button class="chip">Media</button></div>
      ${S.DATA.FILES.map(f => {
        const colors = { pdf: '#e0335c', doc: '#1b5cff', img: '#00a86b', vid: '#8b3fe4' };
        return `
        <div class="list-item" data-act="toast" data-arg="Opening ${S.esc(f.name)}…">
          <div class="file-ic" style="background:${colors[f.kind]}">${f.kind.toUpperCase()}</div>
          <div class="grow"><b class="small">${S.esc(f.name)}</b><div class="tiny muted">${S.esc(f.size)} · ${S.esc(f.when)}</div></div>
          ${S.icon('i-download')}
        </div>`;
      }).join('')}
      ${st.ownedFiles.length ? `<div class="sect-label">AI Generated</div>` + st.ownedFiles.map(f => `
        <div class="list-item" data-act="toast" data-arg="${S.esc(f.name)}">
          <div class="iconbox accent">${S.icon('i-sparkles')}</div>
          <div class="grow"><b class="small">${S.esc(f.name)}</b><div class="tiny muted">${S.esc(f.size)} · ${S.esc(f.when)}</div></div>
          ${S.icon('i-arrow-r')}</div>`).join('') : ''}
      <div class="card mt12 row" style="gap:10px"><div class="iconbox">${S.icon('i-lock')}</div>
        <div class="tiny muted grow">Files are private and tied to your SAGE account. Nothing is shared without your action.</div></div>`;
    }
  };

  /* ===== AI STUDIO ===== */
  R.aistudio = {
    view: () => `
      <div class="row between mb12" style="min-height:44px">
        <div><h2 class="screen-title">AI Studio</h2><div class="tiny muted">Create images, videos, code &amp; more</div></div>
        ${S.sparkTag()}
      </div>
      <div class="grid2">
        ${S.DATA.TOOLS.map(t => `
        <div class="tool-card" data-act="ai-tool" data-arg="${t.id}" ${t.live ? '' : 'style="opacity:.55"'}>
          <div class="ti" style="background:${t.g}">${S.icon(t.ic)}</div>
          <b class="small">${S.esc(t.name)}</b>
          <div class="tiny muted" style="margin-top:3px">${S.esc(t.sub)}</div>
        </div>`).join('')}
      </div>
      <div class="sect-label">Spark Usage</div>
      <div class="card">
        ${S.DATA.SPARK_USAGE.map((u, i) => `
        <div class="row between" style="padding:7px 0;${i ? 'border-top:1px solid var(--stroke)' : ''}">
          <span class="small muted">${S.esc(u.k)}</span><span class="small" style="color:var(--electric-2)">${S.esc(u.v)}</span></div>`).join('')}
      </div>
      <div class="banner mt12"><div class="row between">
        <div><h4>Video Generation · Dynamic Pricing</h4><p>Cost scales with length, density and complexity — quoted before each render.</p></div>
        <div style="color:var(--accent-glow)">${S.icon('i-video')}</div></div></div>`
  };

  R['ai-image'] = {
    back: 'aistudio',
    view: () => `
      ${S.topNav('Image Generation', '5 Spark per image')}
      <canvas class="gen-canvas" id="genCanvas" width="340" height="340"></canvas>
      <div class="field mt12"><label>Prompt</label><input class="input" id="gen-prompt" placeholder="Cosmic SAGE emblem over Himalayan peaks…"></div>
      <div class="row between mt8" style="gap:8px">
        <span class="pill blue">${S.icon('i-bolt')} 5 Spark</span>
        <span class="tiny muted">Balance: ${S.fmtSpark(S.state().spark)}</span>
      </div>
      <button class="btn primary mt12" data-act="gen-image">${S.icon('i-sparkles')} Generate Image</button>`,
    mount() { drawIdle(); }
  };

  function drawIdle() {
    const cv = S.$('#genCanvas'); if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#050b1c'; ctx.fillRect(0, 0, 340, 340);
    ctx.fillStyle = 'rgba(143,166,204,.6)'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Your creation appears here', 170, 176);
  }

  S.drawGenerated = function (prompt) {
    const cv = S.$('#genCanvas'); if (!cv) return;
    const ctx = cv.getContext('2d');
    const d = S.evoData();
    const g = ctx.createRadialGradient(170, 140, 10, 170, 170, 220);
    g.addColorStop(0, d.glow); g.addColorStop(0.5, d.accent); g.addColorStop(1, '#050b1c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 340, 340);
    for (let i = 0; i < 90; i++) {
      ctx.globalAlpha = 0.3 + Math.random() * 0.7;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : d.glow;
      const r = Math.random() * 1.8;
      ctx.beginPath(); ctx.arc(Math.random() * 340, Math.random() * 340, r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // peaks
    ctx.fillStyle = 'rgba(5,10,25,.85)';
    ctx.beginPath(); ctx.moveTo(0, 340); ctx.lineTo(70, 230); ctx.lineTo(140, 340); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(110, 340); ctx.lineTo(220, 200); ctx.lineTo(330, 340); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#dff0ff'; ctx.font = '600 13px Poppins'; ctx.textAlign = 'center';
    ctx.fillText('SAGE · ' + (prompt || 'Cosmic Himalaya').slice(0, 28), 170, 320);
  };

  R['ai-video'] = {
    back: 'aistudio',
    view: () => {
      const st = S.state();
      return `
      ${S.topNav('Video Generation', 'Dynamic pricing by clip')}
      <div class="card glow" style="text-align:center;padding:20px">
        <div style="font-size:40px">🎬</div>
        <b class="small">Render a SAGE motion clip</b>
        <div class="tiny muted mt8">Price = base 25 Spark + 2 Spark per extra second (max 20s).</div>
      </div>
      <div class="field mt16"><label>Length: <b id="vlen-label">8s</b></label>
        <input type="range" min="4" max="20" value="8" style="width:100%" id="vlen" data-act="vlen"></div>
      <div class="row between mt8"><span class="pill blue">${S.icon('i-bolt')} <b id="vcost">41</b> Spark</span>
        <span class="tiny muted">Balance: ${S.fmtSpark(st.spark)}</span></div>
      <button class="btn primary mt16" data-act="gen-video">${S.icon('i-video')} Render Video</button>`;
    },
    mount() {
      const s = S.$('#vlen');
      if (s) s.addEventListener('input', () => {
        const v = +s.value;
        S.$('#vlen-label').textContent = v + 's';
        S.$('#vcost').textContent = 25 + Math.max(0, v - 4) * 2;
      });
    }
  };

})(window.SAGE);
