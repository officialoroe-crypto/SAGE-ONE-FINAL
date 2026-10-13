/* SAGE ONE — Onboarding screens: splash, welcome, language, auth, KYC, profile, let's-go */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';
  const R = S.screens = S.screens || {};

  /* ===== 1. Splash & Onboarding ===== */
  R.splash = {
    nonav: true,
    view: () => `
      <div class="splash">
        <div class="big-logo">${S.logo(150)}</div>
        <h1>SAGE<span>ONE</span></h1>
        <div class="tag">Your Personal AI Mentor &amp; Execution Partner</div>
        <div class="quote" lang="ne">“सपना होइन, लक्ष्य बनाऔं।<br>लक्ष्य होइन, कार्य बनाऔं।<br>कार्य होइन, वास्तविकता बनाऔं।”</div>
        <div class="loadbar"><i></i></div>
      </div>`,
    mount() {
      setTimeout(() => {
        S.go(S.state().onboarded ? 'home' : 'welcome');
      }, 2350);
    }
  };

  /* ===== Welcome ===== */
  R.welcome = {
    nonav: true,
    view: () => `
      <div class="hero-art">
        <div class="h-stars"></div>
        <div class="h-moon"></div>
        <div class="h-peak"></div>
        <div class="h-logo">${S.logo(110)}</div>
      </div>
      <h2 class="screen-title" style="text-align:center">${S.t('onb.welcome')}</h2>
      <p class="screen-sub" style="text-align:center;margin:8px auto 22px;max-width:280px;line-height:1.7">${S.t('onb.mentor')}</p>
      <button class="btn primary" data-act="nav" data-arg="language">${S.t('onb.getstarted')}</button>
      <div class="linkline">${S.t('onb.haveacc')} <b data-act="nav" data-arg="auth">Sign In</b></div>
      <div class="notice">🇳🇵 NEPAL · SAGE · FOREVER</div>`
  };

  /* ===== Language ===== */
  R.language = {
    nonav: true,
    view: () => {
      const cur = S.state().lang;
      return `
      <div style="text-align:center;margin:14px 0 22px">${S.logo(76)}</div>
      <h2 class="screen-title" style="text-align:center">${S.t('onb.chooseLang')}</h2>
      <p class="screen-sub" style="text-align:center;margin-bottom:22px">आफ्नो भाषा छान्नुहोस् · Choose your language</p>
      <div class="lang-card ${cur === 'ne' ? 'active' : ''}" data-act="lang" data-arg="ne">
        <span class="flag">🇳🇵</span>
        <div class="grow"><b>नेपाली (Nepali)</b><div class="sub">नेपाली भाषा</div></div>
        ${cur === 'ne' ? S.icon('i-check', 'ci') : ''}
      </div>
      <div class="lang-card ${cur === 'en' ? 'active' : ''}" data-act="lang" data-arg="en">
        <span class="flag">🇬🇧</span>
        <div class="grow"><b>English</b><div class="sub">Global language</div></div>
        ${cur === 'en' ? S.icon('i-check', 'ci') : ''}
      </div>
      <button class="btn primary mt16" data-act="nav" data-arg="auth">${S.t('onb.continue')}</button>`;
    }
  };

  /* ===== Login / Sign Up ===== */
  R.auth = {
    nonav: true,
    view: () => `
      ${S.topNav('Create Your Account', 'Join the SAGE journey')}
      <div class="field"><label>Full Name</label><input class="input" id="au-name" placeholder="e.g. Ramesh Shrestha" value="${S.esc(S.state().user.name)}"></div>
      <div class="field"><label>Phone Number</label><input class="input" id="au-phone" placeholder="+977 98XXXXXXXX" inputmode="tel"></div>
      <div class="field"><label>Email (optional)</label><input class="input" id="au-email" placeholder="you@example.com" inputmode="email"></div>
      <button class="btn primary mt12" data-act="auth-continue">${S.t('onb.continue')}</button>
      <div class="or">or</div>
      <button class="google-btn" data-act="auth-google">
        <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z"/><path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24z"/><path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.7l3.8-3z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.1l3.8 3C6.5 6.7 9 4.8 12 4.8z"/></svg>
        Continue with Google
      </button>
      <div class="linkline">Already have an account? <b data-act="auth-google">Sign In</b></div>
      <div class="notice">${S.icon('i-lock', 'lic')} Your data is 100% secure · Encrypted end-to-end</div>`,
    mount() {}
  };

  /* ===== KYC Verification ===== */
  R.kyc = {
    nonav: true,
    view: () => {
      const k = S.state().kyc;
      return `
      ${S.topNav('Verify Your Identity', 'For a safer and better experience, please complete your KYC')}
      <div class="kyc-opt ${k.face ? 'done' : ''}" data-act="kyc" data-arg="face">
        <div class="iconbox">${S.icon('i-scan')}</div>
        <div class="grow"><b>Face Verification</b><div class="tiny muted">Quick selfie scan · 30 seconds</div></div>
        <span class="status">${k.face ? '✓ Verified' : 'Pending'}</span>
      </div>
      <div class="kyc-opt ${k.nid ? 'done' : ''}" data-act="kyc" data-arg="nid">
        <div class="iconbox">${S.icon('i-id')}</div>
        <div class="grow"><b>NID Verification</b><div class="tiny muted">National ID · Nepal</div></div>
        <span class="status">${k.nid ? '✓ Verified' : 'Pending'}</span>
      </div>
      <div class="card mt16" style="display:flex;gap:10px;align-items:flex-start">
        <div class="iconbox" style="width:34px;height:34px">${S.icon('i-shield')}</div>
        <div class="tiny muted" style="line-height:1.8">Your data is <b style="color:#4fe39b">100% secure</b>. KYC unlocks Spark purchases, withdrawals to NPR and higher-value marketplace trades.</div>
      </div>
      <button class="btn primary mt20" data-act="kyc-start" ${k.face && k.nid ? '' : ''}>${k.face && k.nid ? 'Continue' : 'Start Verification'}</button>
      <div class="notice">Verification is simulated in this preview build.</div>`;
    }
  };

  /* ===== Create Profile ===== */
  R['profile-create'] = {
    nonav: true,
    view: () => {
      const u = S.state().user;
      return `
      ${S.topNav('Complete Your Profile', 'Help us know you better')}
      <div class="avatar-pick ${u.avatar ? 'filled' : ''}" data-act="pick-avatar">
        ${u.avatar ? `<div style="width:100%;height:100%;border-radius:50%;background:var(--grad-btn);display:flex;align-items:center;justify-content:center;font-size:30px">${S.esc(u.avatar)}</div>` : S.icon('i-camera')}
        <div class="cam">${S.icon('i-plus')}</div>
      </div>
      <div class="field"><label>Name</label><input class="input" id="pc-name" placeholder="e.g. Ramesh Shrestha" value="${S.esc(u.name)}"></div>
      <div class="field"><label>Location</label><input class="input" id="pc-loc" placeholder="e.g. Kathmandu, Nepal" value="${S.esc(u.location)}"></div>
      <div class="field"><label>Phone Number</label><input class="input" id="pc-phone" placeholder="e.g. +977 98XXXXXXXX" value="${S.esc(u.phone)}"></div>
      <button class="btn primary mt12" data-act="profile-save">${S.t('onb.continue')}</button>`;
    }
  };

  /* ===== Welcome to SAGE ONE (Let's Go) ===== */
  R['welcome-go'] = {
    nonav: true,
    view: () => `
      <div class="hero-art" style="height:260px">
        <div class="h-stars"></div><div class="h-moon"></div><div class="h-peak"></div>
        <div class="h-logo">${S.logo(100)}</div>
      </div>
      <div style="text-align:center;margin-top:6px">
        <div class="pill blue" style="margin-bottom:10px">JOURNEY STARTED</div>
        <h2 class="screen-title">Welcome to SAGE ONE</h2>
        <p class="screen-sub" style="margin:8px auto 0;max-width:270px;line-height:1.7">Your journey begins now. Learn, earn, and evolve through 13 cosmic stages.</p>
      </div>
      <div class="grid3 mt20">
        <div class="stat-tile" style="text-align:center"><div class="v" style="color:var(--electric-2)">13</div><div class="k">EVOLUTIONS</div></div>
        <div class="stat-tile" style="text-align:center"><div class="v" style="color:var(--cyan)">${S.fmtSpark(S.state().spark)}</div><div class="k">SPARK</div></div>
        <div class="stat-tile" style="text-align:center"><div class="v" style="color:var(--gold)">1</div><div class="k">STAGE</div></div>
      </div>
      <button class="btn primary mt20" data-act="finish-onboard">Let's Go ${S.icon('i-arrow-r')}</button>`
  };

})(window.SAGE);
