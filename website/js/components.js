/* SAGE ONE — Components: logo, icons, emblems, FX, helpers */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  /* ===== SAGE Logo — swirling cosmic S in a ring ===== */
  /* Legacy inline-SVG mark — kept as the automatic fallback if img/sage-mark.png fails to load */
  S.logoSVG = function (size, opts) {
    opts = opts || {};
    const id = 'lg' + Math.random().toString(36).slice(2, 8);
    return `
<svg class="sage-logo" width="${size}" height="${size}" viewBox="0 0 100 100" style="filter:drop-shadow(0 0 12px rgba(79,168,255,.55))">
  <defs>
    <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8fd4ff"/><stop offset="45%" stop-color="#2e86ff"/><stop offset="100%" stop-color="#0b2f8a"/>
    </linearGradient>
    <linearGradient id="${id}b" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d6f0ff"/><stop offset="55%" stop-color="#4fa8ff"/><stop offset="100%" stop-color="#12327d"/>
    </linearGradient>
    <linearGradient id="${id}o" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9fd8ff"/><stop offset="50%" stop-color="#4fa8ff"/><stop offset="100%" stop-color="#2e86ff"/>
    </linearGradient>
    <radialGradient id="${id}c" cx="46%" cy="38%" r="64%">
      <stop offset="0%" stop-color="#2a62c4" stop-opacity=".52"/>
      <stop offset="28%" stop-color="#103670" stop-opacity=".46"/>
      <stop offset="62%" stop-color="#06152f" stop-opacity=".52"/>
      <stop offset="86%" stop-color="#02070f" stop-opacity=".72"/>
      <stop offset="100%" stop-color="#01030a" stop-opacity=".85"/>
    </radialGradient>
    <radialGradient id="${id}h" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#eaf6ff" stop-opacity=".75"/>
      <stop offset="100%" stop-color="#eaf6ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}r" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9fd8ff" stop-opacity="0"/>
      <stop offset="88%" stop-color="#9fd8ff" stop-opacity="0"/>
      <stop offset="97%" stop-color="#bfe6ff" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#9fd8ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}g" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="50" cy="50" r="47" fill="url(#${id}c)"/>
  <ellipse cx="36" cy="27" rx="22" ry="13" fill="url(#${id}h)" opacity=".2" transform="rotate(-24 36 27)"/>
  <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(120,190,255,.45)" stroke-width="1.3"/>
  <g class="${opts.spin === false ? '' : 'ring'}">
    <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(120,190,255,.28)" stroke-width=".9" stroke-dasharray="3 6"/>
    <circle cx="50" cy="9.5" r="2.1" fill="#9fd8ff" opacity=".9"/>
    <circle cx="88" cy="62" r="1.5" fill="#4fa8ff" opacity=".8"/>
  </g>
  <g filter="url(#${id}g)">
    <path d="M63 30c-6-6-17-7-23-1-7 7-4 16 3 20 5 3 12 4 15 8 4 5 0 12-7 13-6 1-12-2-14-7"
          fill="none" stroke="rgba(2,6,16,.9)" stroke-width="12" stroke-linecap="round"/>
    <path d="M63 30c-6-6-17-7-23-1-7 7-4 16 3 20 5 3 12 4 15 8 4 5 0 12-7 13-6 1-12-2-14-7"
          fill="none" stroke="url(#${id}o)" stroke-width="9.6" stroke-linecap="round"/>
    <path d="M63 30c-6-6-17-7-23-1-7 7-4 16 3 20 5 3 12 4 15 8 4 5 0 12-7 13-6 1-12-2-14-7"
          fill="none" stroke="url(#${id}a)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M60 26c-5-4-13-5-19-1-6 4-6 12 0 16 7 5 18 5 21 12 3 8-5 16-14 15"
          fill="none" stroke="url(#${id}b)" stroke-width="3.2" stroke-linecap="round" opacity=".95"/>
  </g>
  <circle cx="50" cy="50" r="47" fill="url(#${id}r)" stroke="rgba(190,230,255,.8)" stroke-width="1.8"/>
</svg>`;
  };

  /* onerror handler: Element.replaceWith(string) inserts a *text* node per DOM spec,
     so parse the SVG markup first and swap in the real element */
  S.logoFallback = function (img, size, spin) {
    const box = document.createElement('div');
    box.innerHTML = S.logoSVG(size, { spin: spin !== false });
    if (box.firstElementChild) img.replaceWith(box.firstElementChild);
  };

  /* ===== Primary logo: combined glass-sphere + SAGE ONE emblem mark ===== */
  S.logo = function (size, opts) {
    opts = opts || {};
    const spin = opts.spin !== false;
    return `<span class="sage-logo${spin ? ' sage-spin' : ''}" style="width:${size}px;height:${size}px">` +
      `<img class="sage-mark" src="img/sage-mark.png?v=1" width="${size}" height="${size}" alt="SAGE ONE"` +
      ` onerror="this.onerror=null;SAGE.logoFallback(this,${size},${spin ? 'true' : 'false'})">` +
      `</span>`;
  };

  /* ===== Icon set (stroke style like board UI kit) ===== */
  const P = {
    'i-home': '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    'i-grid': '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    'i-activity': '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    'i-user': '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    'i-chat': '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/>',
    'i-bag': '<path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    'i-case': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
    'i-book': '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M19 19H6a2 2 0 0 0-2 2"/>',
    'i-users': '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5"/><circle cx="17.5" cy="9" r="2.6"/><path d="M17.5 14c2.6 0 4 1.7 4 4"/>',
    'i-folder': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    'i-sparkles': '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>',
    'i-wallet': '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    'i-search': '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    'i-mic': '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
    'i-send': '<path d="M4 12 20 4l-6 16-3-7-7-1z"/>',
    'i-arrow-r': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    'i-arrow-l': '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    'i-check': '<path d="m5 13 4.5 4.5L19 7"/>',
    'i-plus': '<path d="M12 5v14M5 12h14"/>',
    'i-shield': '<path d="M12 3l8 3v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6l8-3z"/><path d="m9 12 2 2 4-4"/>',
    'i-scan': '<path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.2"/>',
    'i-id': '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2.2"/><path d="M6 16c.5-1.6 1.7-2.4 3-2.4s2.5.8 3 2.4"/><path d="M14.5 10h4M14.5 13.5h4"/>',
    'i-camera': '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.4"/>',
    'i-pin': '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    'i-phone': '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    'i-car': '<path d="M5 16h14"/><path d="M6.5 16V12l2-5h7l2 5v4"/><circle cx="8" cy="17.5" r="1.6"/><circle cx="16" cy="17.5" r="1.6"/>',
    'i-home2': '<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',
    'i-brief': '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M9 8V6h6v2"/>',
    'i-image': '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m5 17 4.5-4.5 3.5 3 3-2.5L20 17"/>',
    'i-video': '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10 5-3v10l-5-3"/>',
    'i-code': '<path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>',
    'i-download': '<path d="M12 4v10"/><path d="m8 11 4 4 4-4"/><path d="M5 19h14"/>',
    'i-bell': '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    'i-gear': '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
    'i-globe': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.5 2.4 3.8 5.4 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.4-3.8-8.5s1.3-6.1 3.8-8.5z"/>',
    'i-moon': '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    'i-sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/>',
    'i-drop': '<path d="M12 3s6 6.5 6 10.5a6 6 0 1 1-12 0C6 9.5 12 3 12 3z"/>',
    'i-flame': '<path d="M12 3c1 4-4 5.5-4 10a4.8 4.8 0 0 0 9.6 0c0-2-1-3.6-2.6-5.4C13.8 9.5 13 8 12 3z"/>',
    'i-star': '<path d="m12 3 2.6 6 6.4.6-4.9 4.3 1.5 6.3L12 16.8 6.4 20.2l1.5-6.3L3 9.6 9.4 9 12 3z"/>',
    'i-crown': '<path d="M4 17h16"/><path d="m4 17-1.5-9L9 12l3-7 3 7 6.5-4L20 17"/>',
    'i-layers': '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
    'i-award': '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
    'i-bolt': '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
    'i-eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'i-link': '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l2.8-2.8a4.5 4.5 0 1 0-6.4-6.4L11.5 6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-2.8 2.8a4.5 4.5 0 1 0 6.4 6.4L12.5 18"/>',
    'i-bookmark': '<path d="M6 4h12v17l-6-4-6 4V4z"/>',
    'i-target': '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>',
    'i-flag': '<path d="M5 21V4"/><path d="M5 5h12l-2.5 4L17 13H5"/>',
    'i-diamond': '<path d="m12 3 8 6-8 12L4 9l8-6z"/>',
    'i-hex': '<path d="m12 3 7.5 4.5v9L12 21l-7.5-4.5v-9L12 3z"/>',
    'i-orbit': '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-24 12 12)"/>',
    'i-compass': '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"/>',
    'i-mountain': '<path d="m3 19 6-11 4 7 2.5-4L21 19H3z"/>',
    'i-refresh': '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>',
    'i-logout': '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h9"/>',
    'i-trash': '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/>',
    'i-clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'i-trend': '<path d="M4 16l5-5 3.5 3.5L20 7"/><path d="M15 7h5v5"/>',
    'i-bank': '<path d="M4 10 12 4l8 6"/><path d="M5 10v8M10 10v8M14 10v8M19 10v8"/><path d="M3 20h18"/>',
    'i-lock': '<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    'i-info': '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".8" fill="currentColor"/>',
    'i-x': '<path d="m6 6 12 12M18 6 6 18"/>',
    'i-heart': '<path d="M12 20s-7.5-4.8-7.5-10A4.4 4.4 0 0 1 12 7.4 4.4 4.4 0 0 1 19.5 10c0 5.2-7.5 10-7.5 10z"/>',
    'i-share': '<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="m8.3 10.8 6.4-3.6M8.3 13.2l6.4 3.6"/>',
    'i-wifi': '<path d="M2.5 8.5a14 14 0 0 1 19 0"/><path d="M6 12a9 9 0 0 1 12 0"/><path d="M9.5 15.5a4.5 4.5 0 0 1 5 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'
  };
  S.icon = function (name, cls) {
    const body = P[name] || P['i-star'];
    return `<svg class="${cls || ''}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  };

  /* ===== Evolution emblem — cosmic medallion with accent material ===== */
  S.emblem = function (stageN, level, size) {
    const d = S.DATA.EVOLUTIONS[(stageN || 1) - 1];
    level = level || 'low';
    const id = 'em' + stageN + level + Math.random().toString(36).slice(2, 6);
    const lv = { low: 1, mid: 1.5, high: 2.1 }[level];
    const particles = [];
    const count = { low: 6, mid: 12, high: 22 }[level];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (lv * 0.3);
      const r = 33 + (i % 3) * 5 + lv * 2;
      const x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
      particles.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + (i % 3) * 0.5).toFixed(1)}" fill="${d.glow}" opacity="${(0.35 + lv * 0.22).toFixed(2)}"/>`);
    }
    return `
<svg class="emblem ${level}" width="${size || 120}" height="${size || 120}" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="${id}m" cx="50%" cy="42%">
      <stop offset="0%" stop-color="${d.glow}"/><stop offset="52%" stop-color="${d.accent}"/><stop offset="100%" stop-color="#050b1c"/>
    </radialGradient>
    <radialGradient id="${id}h" cx="50%" cy="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>
  ${particles.join('')}
  <g class="orb-spin">
    <circle cx="50" cy="50" r="38" fill="none" stroke="${d.accent}" stroke-width=".7" stroke-dasharray="2 5" opacity=".8"/>
    <circle cx="50" cy="12" r="1.6" fill="${d.glow}"/>
  </g>
  <circle cx="50" cy="50" r="29" fill="url(#${id}m)" opacity=".28" filter="url(#${id}b)"/>
  <circle cx="50" cy="50" r="24" fill="url(#${id}m)" stroke="${d.glow}" stroke-width="1.2"/>
  <ellipse cx="43" cy="41" rx="10" ry="7" fill="url(#${id}h)" opacity=".5"/>
  <path d="M56 41c-3.4-3.4-9.6-4-13-.6-3.8 3.8-2 8.8 1.9 11 2.9 1.6 6.8 2.2 8.5 4.5 2.3 2.9-.2 6.8-4.1 7.2-3.4.4-6.8-1.4-8-4"
        fill="none" stroke="${d.glow}" stroke-width="3.4" stroke-linecap="round" opacity=".95"/>
  <text x="50" y="92" text-anchor="middle" font-size="8" font-weight="700" fill="${d.glow}" font-family="Poppins,sans-serif" letter-spacing="1">${d.n}</text>
</svg>`;
  };

  /* ===== Starfield ===== */
  S.initStars = function () {
    const cv = S.$('#stars'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let stars = [], w, h;
    function resize() {
      w = cv.width = window.innerWidth; h = cv.height = window.innerHeight;
      stars = Array.from({ length: Math.floor((w * h) / 9000) }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.2,
        s: Math.random() * 0.015 + 0.004, p: Math.random() * Math.PI * 2
      }));
    }
    resize(); window.addEventListener('resize', resize);
    (function loop(t) {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(t * st.s + st.p));
        ctx.globalAlpha = a; ctx.fillStyle = '#cfe4ff';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill();
      }
      requestAnimationFrame(loop);
    })(0);
  };

  /* ===== Particle burst (accent material) ===== */
  S.burst = function (n, cx, cy, color) {
    const root = S.$('#fxRoot'); root.classList.add('on');
    for (let i = 0; i < (n || 26); i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 2 + Math.random() * 5;
      const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 260;
      p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 8px ${color};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist}px;animation-duration:${(0.9 + Math.random() * 1.1)}s`;
      root.appendChild(p);
      setTimeout(() => p.remove(), 2200);
    }
  };

  /* ===== 9-step Evolution transition ===== */
  S.playTransition = function (fromStage, fromLevel, toStage, toLevel, done) {
    const root = S.$('#fxRoot');
    const d = S.DATA.EVOLUTIONS[toStage - 1];
    S._fxGen = (S._fxGen || 0) + 1;
    const gen = S._fxGen;
    root.classList.add('on');
    root.innerHTML = `
      <div class="fx-overlay">
        <div class="fx-sub">Evolution Transition</div>
        <div class="fx-emblem">${S.emblem(toStage, toLevel, 190)}</div>
        <div class="fx-title" style="color:${d.glow}">Stage ${toStage} · ${d.name}</div>
        <div class="fx-sub" style="color:var(--muted)">${d.title} — ${d.desc}</div>
        <div class="fx-steps" id="fxSteps">${S.DATA.TRANSITION.map((s, i) =>
          `<div class="fx-step" data-i="${i}"><span class="n">${i + 1}</span>${s}</div>`).join('')}</div>
        <button class="btn ghost sm" data-act="skip-fx" style="margin-top:6px">Skip</button>
      </div>`;
    const device = S.$('#device');
    if (device) device.classList.add('evolving');
    const steps = S.$$('.fx-step', root);
    let i = 0;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2 - 60;
    const timer = setInterval(() => {
      if (gen !== S._fxGen) { clearInterval(timer); return; }
      if (i < steps.length) {
        steps[i].classList.add('on');
        if (i === 3) { const f = document.querySelector('.fx-flash'); root.insertAdjacentHTML('afterbegin', '<div class="fx-flash go"></div>'); S.burst(40, cx, cy, d.glow); }
        if (i === 5 || i === 7) S.burst(22, cx, cy, d.glow);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          root.classList.remove('on'); root.innerHTML = '';
          if (device) device.classList.remove('evolving');
          S.setLevelVars();
          if (done) done();
        }, 900);
      }
    }, 520);
    S._fxSkip = function () { clearInterval(timer); root.classList.remove('on'); root.innerHTML = ''; if (device) device.classList.remove('evolving'); S.setLevelVars(); if (done) done(); S._fxSkip = null; };
  };

  /* ===== State Orb — 9 logo states & animations (board 2) ===== */
  S.stateOrb = function (id, size, tag) {
    const st = (S.DATA.LOGO_STATES.find(x => x.id === id)) || S.DATA.LOGO_STATES[0];
    size = size || 110;
    const pts = [0, 1, 2, 3, 4, 5, 6].map(i => `<i style="--i:${i}"></i>`).join('');
    const bars = [0, 1, 2, 3, 4, 5, 6].map(i => `<i style="--i:${i}"></i>`).join('');
    return `<span class="orb-fx st-${st.id}" style="--oc:${st.c};--oc2:${st.c2};--os:${size}px">
      <span class="orb-glow"></span>
      <span class="orb-orbit o1"><i></i><i></i></span>
      <span class="orb-orbit o2"><i></i></span>
      <span class="orb-ring"></span>
      <span class="orb-pts">${pts}</span>
      <span class="orb-wave" aria-hidden="true">${bars}</span>
      <span class="orb-core">${S.logo(size, { spin: false })}</span>
      ${st.id === 'premium' ? '<span class="orb-crown">👑</span>' : ''}
      ${st.id === 'failure' ? '<span class="orb-crack"></span>' : ''}
      ${st.id === 'verifying' ? '<span class="orb-scan"></span>' : ''}
      ${tag ? `<span class="orb-tag">${S.esc(tag)}</span>` : ''}
    </span>`;
  };

  /* ===== 7-stage Earning animation (board 3) — exact 0→17s timeline ===== */
  S.playEarning = function (amount, opts) {
    opts = opts || {};
    amount = Math.round(amount) || 5000;
    const tier = S.tierFor(amount);
    const full = tier.id !== 'small';
    const seq = S.DATA.EARN_STAGES;
    const root = S.$('#fxRoot');
    const stageOrb = (i) => ['searching', 'analyzing', 'earning', 'earning', 'earning', 'earning', 'idle'][i] || 'earning';
    S._fxGen = (S._fxGen || 0) + 1;
    const gen = S._fxGen;
    let timer = null, countRaf = null, done = false;
    const alive = () => gen === S._fxGen;

    function head(i) {
      return `<span class="earn-n">${seq[i].n}</span><b>${seq[i].name}</b><em>${seq[i].t}</em>`;
    }
    function finish(skip) {
      if (done || !alive()) return; done = true;
      clearTimeout(timer); cancelAnimationFrame(countRaf);
      root.classList.remove('on'); root.innerHTML = '';
      S._fxSkip = null;
      if (opts.preview) {
        S.toast('Animation preview complete. No payment, balance, or progress changed.');
      } else {
        if (!opts.noCredit) S.creditEarning(amount, opts.source || 'Client Payment');
        S.save();
        if (S.currentRoute() === 'earn' || S.currentRoute() === 'wallet' || S.currentRoute() === 'home') S.render();
        S.toast('Payment received ✓ ' + S.npr(amount) + ' · ' + tier.name.toLowerCase());
        const lvl = S.addProgress(full ? 6 : 3, 'Payment received');
        if (lvl) S.handleLevelUp(lvl);
      }
      if (opts.onDone) opts.onDone();
    }
    S._fxSkip = () => finish(true);

    function countUp(ms) {
      const el = S.$('#earnAmt'); if (!el) return;
      const span = el.querySelector('span');
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min(1, (t - t0) / ms);
        const eased = 1 - Math.pow(1 - p, 3);
        span.textContent = '+' + S.npr(Math.round(amount * eased));
        if (p < 1) countRaf = requestAnimationFrame(tick);
      })(t0);
    }

    root.classList.add('on');
    if (!full) {
      /* Small earning — quick pulse + light particles, no full transformation */
      root.innerHTML = `<div class="fx-overlay earn-fx quick" id="earnFx" data-s="5">
        <div class="earn-top"><div class="earn-stage"><span class="earn-n">✦</span><b>SMALL EARNING</b><em>${tier.range}</em></div></div>
        <div class="earn-orb" id="earnOrb">${S.stateOrb('earning', 200)}</div>
        <div class="earn-amount show" id="earnAmt"><span>+${S.npr(0)}</span><em>${opts.preview ? 'PREVIEW ONLY' : 'EARNED'}</em></div>
        <div class="earn-desc">${S.esc(tier.d)}</div>
        <div class="earn-chip">${opts.preview ? 'ANIMATION PREVIEW · NO PAYMENT' : 'Payment received!'}</div>
        <button class="btn ghost sm" data-act="skip-fx">Tap to skip animation</button>
      </div>`;
      countUp(900);
      timer = setTimeout(() => finish(), 2200);
      return;
    }

    root.innerHTML = `<div class="fx-overlay earn-fx" id="earnFx" data-s="1">
      <div class="earn-top">
        <div class="earn-stage" id="earnStage">${head(0)}</div>
        <div class="earn-rail" id="earnRail">${seq.map(s => `<i class="${s.n === 1 ? 'on' : ''}"></i>`).join('')}</div>
      </div>
      <div class="earn-orb" id="earnOrb">${S.stateOrb(stageOrb(0), 210)}</div>
      <div class="earn-amount" id="earnAmt"><span>+${S.npr(0)}</span><em>EARNED</em></div>
      <div class="earn-desc" id="earnDesc">${S.esc(seq[0].d)}</div>
      <div class="earn-chip" id="earnChip">${S.esc(seq[0].chip)}</div>
      <button class="btn ghost sm" data-act="skip-fx">Tap to skip animation</button>
    </div>`;

    let i = 0;
    function runStage() {
      if (done || !alive()) return;
      const s = seq[i];
      const fx = S.$('#earnFx');
      if (!fx) return;
      fx.setAttribute('data-s', s.n);
      const hd = S.$('#earnStage'); if (hd) hd.innerHTML = head(i);
      const d = S.$('#earnDesc'); if (d) d.textContent = s.d;
      const c = S.$('#earnChip'); if (c) c.textContent = s.chip;
      S.$$('#earnRail i').forEach((el, k) => el.classList.toggle('on', k <= i));
      const orbWrap = S.$('#earnOrb');
      if (orbWrap && (i === 0 || i === 1 || i === 2 || i === 6)) orbWrap.innerHTML = S.stateOrb(stageOrb(i), 210);
      if (s.n === 3 || s.n === 6) S.burst(s.n === 3 ? 34 : 22, window.innerWidth / 2, window.innerHeight / 2, '#ffd97a');
      if (s.n === 5) {
        const amt = S.$('#earnAmt'); if (amt) amt.classList.add('show');
        countUp(Math.min(1600, s.ms - 400));
      }
      if (s.n === 7) { const amt = S.$('#earnAmt'); if (amt) amt.classList.remove('show'); }
      i++;
      if (i < seq.length) timer = setTimeout(runStage, seq[i - 1].ms);
      else timer = setTimeout(() => finish(), seq[seq.length - 1].ms);
    }
    timer = setTimeout(runStage, 500);
  };

  /* ===== Failure Sequence + Recovery (board 4) ===== */
  S.playFailure = function (opts) {
    opts = opts || {};
    const seq = S.DATA.FAIL_SEQ;
    const root = S.$('#fxRoot');
    const STAGE_MS = [1700, 1700, 1700, 2000, 2000, 2200]; /* design 0–30s, played accelerated; labels keep exact ranges */
    S._fxGen = (S._fxGen || 0) + 1;
    const gen = S._fxGen;
    const alive = () => gen === S._fxGen;
    let timer = null, done = false, i = 0;

    function finish(skip) {
      if (done || !alive()) return; done = true;
      clearTimeout(timer);
      root.classList.remove('on'); root.innerHTML = '';
      S._fxSkip = null;
      if (!skip) S.toast(opts.preview ? 'Recovery animation preview complete. No research was run.' : 'Back online! · Research recovered');
      if (opts.onDone) opts.onDone(!skip);
    }
    S._fxSkip = () => finish(true);

    root.classList.add('on');
    function paint() {
      if (!alive()) return;
      const s = seq[i];
      const fx = S.$('#failFx'); if (!fx) return;
      fx.setAttribute('data-fs', s.n);
      const hd = S.$('#failHead');
      if (hd) hd.innerHTML = `<span class="fail-n" style="background:${s.c}">${s.n}</span><div class="grow"><b>${s.name.toUpperCase()}</b><em>(${s.t})</em></div>`;
      const d = S.$('#failDesc'); if (d) d.textContent = s.d;
      const o = S.$('#failOrb'); if (o) o.innerHTML = S.stateOrb(s.st, 200, s.name);
      S.$$('#failRail i').forEach((el, k) => el.classList.toggle('on', k <= i));
      if (s.n === 4) S.burst(26, window.innerWidth / 2, window.innerHeight / 2, '#a855f7');
      if (s.n === 6) S.burst(26, window.innerWidth / 2, window.innerHeight / 2, '#34d399');
      i++;
      if (i < seq.length) timer = setTimeout(paint, STAGE_MS[i - 1]);
      else timer = setTimeout(() => {
        const card = S.$('#failCard');
        if (card) card.classList.add('show');
        timer = setTimeout(() => finish(false), 2400);
      }, STAGE_MS[STAGE_MS.length - 1]);
    }
    root.innerHTML = `<div class="fx-overlay fail-fx" id="failFx" data-fs="1">
      <div class="fail-head" id="failHead"></div>
      <div class="fail-orb" id="failOrb"></div>
      <div class="fail-desc" id="failDesc"></div>
      <div class="earn-rail" id="failRail">${seq.map((s, k) => `<i class="${k === 0 ? 'on' : ''}" style="--rc:${s.c}"></i>`).join('')}</div>
      <div class="fail-card" id="failCard">
        <div class="fail-warn">⚠</div>
        <div class="grow"><b>${opts.preview ? 'Recovery animation preview' : 'Couldn\'t complete the research.'}</b><div class="tiny muted">${opts.preview ? 'This is a visual test only. No research request was sent.' : 'Network or source access interrupted.'}</div></div>
        <div class="fail-btns"><button class="btn xs primary" data-act="rs-fail">Replay preview</button><button class="btn xs soft" data-act="skip-fx">Close preview</button></div>
      </div>
      <button class="btn ghost sm" data-act="skip-fx">Tap to skip animation</button>
    </div>`;
    paint();
  };

  /* ===== shared partials ===== */
  S.topNav = function (title, sub) {
    return `<div class="top-nav">
      <button class="backbtn" style="position:static" data-act="back">${S.icon('i-arrow-l')}</button>
      <div><h2>${S.esc(title)}</h2>${sub ? `<div class="tiny muted">${S.esc(sub)}</div>` : ''}</div>
    </div>`;
  };
  S.sparkTag = function () {
    return `<span class="spark-pill" data-act="nav" data-arg="spark">
      <svg class="spark-ic" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z"/></svg>
      ${S.fmtSpark(S.state().spark)}</span>`;
  };

})(window.SAGE);
