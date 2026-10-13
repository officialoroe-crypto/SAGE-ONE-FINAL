# SAGE ONE — Complete Source Document

> **Your Personal AI Mentor & Execution Partner** — a single-page, dependency-free
> web app built as a phone experience with a desktop dashboard shell. This document
> is the **entire website and app**: every HTML, CSS and JavaScript file, verbatim,
> plus a structural reference. It is self-contained — you can reconstruct the running
> app from this file alone.

---

## 1. What this is

SAGE ONE is a self-contained SPA (no framework, no build step, no network dependency
required to run). It ships as a phone-shaped "device" experience with an optional
desktop dashboard that activates above a 1180px viewport. Everything persists to
`localStorage`; there is no backend.

**Product pillars**

| Pillar | What it does |
|---|---|
| **AI Mentor** | A streaming chat with a built-in answer engine (offline) or a user-supplied live LLM key. The assistant orb animates through 9 named states. |
| **Research** | A staged research state-machine with source lists, verification, and a failure/recovery demo. |
| **Learn → Earn** | Courses, jobs, marketplace listings, and a 7-stage "Money Earned" celebration animation. |
| **Evolution** | A 13-stage × (low/mid/high) progression driven by skill points, never by money. |
| **Spark** | The in-app currency: buy, send, withdraw, with a fee table. |
| **Agent Platform** | Mission control, an agent marketplace, a drag-and-drop workflow builder, and service integrations that make real network calls. |

**Tech profile**

- Vanilla ES5/ES6 browser JavaScript. Single global namespace `window.SAGE` (`S`).
- Every module is an IIFE that attaches to `S`. No imports/exports, no bundler.
- Persistence: `localStorage` key `sage-one-state-v1` (app state) and `sage-ai-cfg-v1` (AI key config, kept out of app state so the key is never logged with the rest).
- Routing: in-memory stack (no URL hash). Render targets swap between phone `#screen` and desktop `#deskContent`.
- Theming: `data-theme` attribute on `<html>` + CSS custom properties; each Evolution stage rewrites `--accent*` vars.

---

## 2. Architecture at a glance

```
index.html                     shell: cosmos backdrop, desktop #desk, phone .device, overlays
  ├─ css/styles.css            all styling (phone + desktop, themes, FX animations)
  └─ js/  (load order matters)
      ├─ core.js               S.$ helpers, esc/npr/fmt, state load/save/reset, evo helpers,
      │                        i18n S.t(), theme, toast(), sheet()
      ├─ data.js               S.DATA.*  — every catalog (agents, listings, jobs, courses,
      │                        i18n dict, evolutions, logo states, fee table, …)
      ├─ components.js         S.logo(), S.stateOrb(), S.icon(), S.topNav(),
      │                        S.playEarning(), S.playFailure(), S.playTransition(), S.initStars()
      ├─ ai.js                 S.AI — answer(), isResearch(), askLive(), setCfg(), isLive()
      ├─ screens-*.js          each registers routes onto the shared  S.screens  object
      └─ app.js                S.render(), S.go()/back(), desktop/phone mode, the
                               S.act() action dispatcher, delegated click listener, boot()
```

**Render flow:** a click on any `[data-act]` bubbles to the single delegated listener in
`app.js`, which calls `S.act(name, arg)`. The dispatcher's `switch` handles most actions;
anything in the agent workspace that it doesn't recognize is forwarded to `S.AG_ACT` via the
`S.AG_ACT_KNOWN` allowlist (see §6). `S.act` mutates state and calls `S.render()`, which asks
the current route's `view(param)` for HTML and swaps it in (calling the route's optional
`mount()` afterward for listeners/animation).

---

## 3. File manifest

| File | Bytes | Role |
|---|---:|---|
| `index.html` | 13293 | HTML shell |
| `css/styles.css` | 97894 | Stylesheet (dark/light/blue themes, phone + desktop) |
| `js/core.js` | 5655 | Core: namespace, utils, persisted state, i18n, theme, toast, sheet |
| `js/data.js` | 33696 | Data catalog: all content, agents, listings, i18n, evolutions |
| `js/components.js` | 27435 | Shared components: logo, orb, icons, earning/fail/transition FX |
| `js/ai.js` | 41427 | AI engine: built-in answer system + optional live LLM |
| `js/screens-onboarding.js` | 8470 | Screens: splash, welcome, language, auth, KYC, profile-create |
| `js/screens-home.js` | 19900 | Screens: home, chat (streaming AI, orb states) |
| `js/screens-apps.js` | 21013 | Screens: apps, marketplace, jobs, learning, community, files, sell, listing/course detail |
| `js/screens-system.js` | 29091 | Screens: wallet, earn, spark, evolution, premium, fees, settings, aistudio, logostates |
| `js/screens-lab.js` | 20069 | Screens: research, memory, aisettings |
| `js/screens-agents.js` | 35235 | Screens: agent workspace — mission control, agent-market, workflow, integrations |
| `js/app.js` | 26864 | App controller: router, tabbar, desktop mode, action dispatcher |
| **Total** | **380042** | **13 files** |

---

## 4. Route map (37 routes)

Routes register onto the shared `S.screens` object (`const R = S.screens = S.screens || {}`).

**Onboarding** — `splash` · `welcome` · `welcome-go` · `language` · `auth` · `kyc` · `profile-create`

**Core** — `home` · `chat`

**Apps** — `apps` · `marketplace` · `listing-detail` · `jobs` · `learning` · `course-detail` · `community` · `files` · `sell`

**System / money** — `wallet` · `earn` · `spark` · `evolution` · `premium` · `fees` · `settings`

**AI / visual** — `aistudio` · `aisettings` · `logostates`

**Lab** — `research` · `memory`

**Agent platform** — `agents` · `agent-market` · `workflow` · `integrations`

Boot route: `home` if `state.onboarded`, otherwise `splash`. The bottom tab bar shows only for
tab routes (`home`, `research`, `chat`, `wallet`, `profile`); onboarding and detail screens set
`nonav: true`.

---

## 5. State model (persisted)

Single object under `localStorage["sage-one-state-v1"]`. Defaults in `core.js`:

```js
{
  onboarded: false,            lang: 'en',        theme: 'dark',
  user:   { name, phone, email, location: 'Kathmandu, Nepal', avatar },
  kyc:    { face: false, nid: false },
  spark:  2580,                lifetimeEarned: 24500,
  earnings: { marketplace: 12400, jobs: 7500, referral: 2600, content: 1000 },
  skillPoints: 3,
  evo:    { stage: 1, level: 'low', progress: 22, maxStage: 13 },
  appliedJobs: [], enrolled: [], ownedFiles: [], chat: [], tx: [], searchHistory: [],
  payMethod: 'fonepay', premium: false
}
```

**Key rule:** Evolution progress (`addProgress`) only advances from skill activity; money never
reduces it. `addSpark` / `creditEarning` mutate currency and append to `tx` (capped at 12).
The assistant orb has **9 states** (`S.DATA.LOGO_STATES`): `idle`, `searching`, `analyzing`, `verifying`, `success`, `failure`, `recovery`, `earning`, `premium`

---

## 6. Agent-workspace action wiring

Agent-workspace buttons (hiring, approvals, workflow, integrations Test/Save) emit a bare
`data-act` (e.g. `ig-test`, `agent-hire`, `wf-run`) that `S.act`'s switch does not own. A
`default:` case forwards any name present in the `S.AG_ACT_KNOWN` allowlist to `S.AG_ACT`
as `"name:arg"`, so those controls are reachable from the delegated click listener. The
allowlist is defined in `screens-agents.js` and mirrors `AG_ACT`'s `case` labels.

---

## 7. Complete source

Every file below is reproduced **verbatim**.


### `index.html`

<!-- HTML shell | 13293 bytes -->

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>SAGE ONE — Your Personal AI Mentor &amp; Execution Partner</title>
<meta name="description" content="SAGE ONE — Nepal's AI mentor & execution partner. Learn, earn, evolve." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/styles.css?v=2" />
<link rel="icon" href="img/sage-mark.png?v=1" type="image/png" />
</head>
<body>
  <!-- Cosmic desktop backdrop -->
  <div class="cosmos" aria-hidden="true">
    <canvas id="stars"></canvas>
    <div class="nebula n1"></div>
    <div class="nebula n2"></div>
    <div class="moon"></div>
    <div class="peaks"></div>
  </div>

  <!-- Desktop dashboard (board 2) -->
  <div class="desk" id="desk" aria-hidden="true">
    <aside class="desk-side">
      <div class="ds-brand">
        <span class="ds-logo" id="dsLogo"></span>
        <div class="ds-brandtext"><b>SAGE <i>ONE</i></b><span>YOUR EXECUTION PARTNER</span></div>
      </div>
      <nav class="ds-nav" id="dsNav"></nav>
      <div class="ds-credits">
        <div class="dsc-head">
          <span class="scoin">S</span>
          <div class="grow"><b>SAGE CREDITS</b><div class="dsc-amt" id="dsCredits">2,580</div><div class="tiny">≈ NPR <span id="dsCreditsNpr">2,580</span></div></div>
          <svg class="dsc-spark" viewBox="0 0 60 24" fill="none"><path d="M1 20 10 14 18 17 27 9 35 12 44 5 52 8 59 2" stroke="#4fe39b" stroke-width="1.6"/><path d="M1 20 10 14 18 17 27 9 35 12 44 5 52 8 59 2V24H1z" fill="rgba(79,227,155,.14)"/></svg>
        </div>
        <button class="btn primary xs" style="width:100%" data-act="buy-spark">+ Add Credits</button>
      </div>
      <div class="ds-prem" data-act="nav" data-arg="premium">
        <span class="ds-crown">👑</span>
        <div class="grow"><b>Premium Plan</b><div class="tiny">Unlock more. Do more.</div></div>
        <span class="ds-chev">›</span>
      </div>
      <div class="ds-user" data-act="nav" data-arg="profile">
        <span class="ds-ava" id="dsAva">S</span>
        <div class="grow"><b id="dsName">SAGE User</b><div class="tiny">Execution Partner</div></div>
        <span class="ds-status" title="Online"></span>
      </div>
    </aside>

    <div class="desk-body">
      <!-- Mt Everest + Buddha cosmic backdrop (board 1) -->
      <div class="desk-scene" aria-hidden="true">
        <svg viewBox="0 0 1000 350" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#071a3c"/>
              <stop offset="45%" stop-color="#050f28"/>
              <stop offset="100%" stop-color="#03060f"/>
            </linearGradient>
            <radialGradient id="moonG" cx="50%" cy="50%">
              <stop offset="0%" stop-color="#fffdf0" stop-opacity=".95"/>
              <stop offset="45%" stop-color="#dfe6d2" stop-opacity=".35"/>
              <stop offset="100%" stop-color="#a9c4ff" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="farG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#456aa8"/>
              <stop offset="55%" stop-color="#182a54"/>
              <stop offset="100%" stop-color="#060d1f"/>
            </linearGradient>
            <linearGradient id="eveG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#cfe0f7"/>
              <stop offset="16%" stop-color="#8aa9d6"/>
              <stop offset="52%" stop-color="#2c4676"/>
              <stop offset="100%" stop-color="#060d1f"/>
            </linearGradient>
            <linearGradient id="nearG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1a2c55"/>
              <stop offset="100%" stop-color="#04070f"/>
            </linearGradient>
            <linearGradient id="budG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fff0c4"/>
              <stop offset="34%" stop-color="#f0c273"/>
              <stop offset="72%" stop-color="#c08a3c"/>
              <stop offset="100%" stop-color="#6b4416"/>
            </linearGradient>
            <radialGradient id="haloG" cx="50%" cy="50%">
              <stop offset="0%" stop-color="#ffdf9a" stop-opacity=".5"/>
              <stop offset="55%" stop-color="#ffc76a" stop-opacity=".16"/>
              <stop offset="100%" stop-color="#ffc76a" stop-opacity="0"/>
            </radialGradient>
            <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4"/>
            </filter>
          </defs>

          <rect width="1000" height="350" fill="url(#skyG)"/>

          <!-- stars -->
          <g fill="#dceaff">
            <circle cx="62" cy="34" r="1.7" opacity=".9"/><circle cx="140" cy="74" r="1.1" opacity=".6"/>
            <circle cx="212" cy="28" r="1.4" opacity=".8"/><circle cx="296" cy="60" r="1" opacity=".5"/>
            <circle cx="370" cy="24" r="1.6" opacity=".85"/><circle cx="446" cy="80" r="1.1" opacity=".55"/>
            <circle cx="524" cy="40" r="1.3" opacity=".75"/><circle cx="602" cy="20" r="1.7" opacity=".9"/>
            <circle cx="676" cy="70" r="1" opacity=".5"/><circle cx="754" cy="30" r="1.5" opacity=".8"/>
            <circle cx="700" cy="104" r="1.2" opacity=".6"/><circle cx="884" cy="26" r="1.6" opacity=".85"/>
            <circle cx="948" cy="96" r="1.2" opacity=".6"/><circle cx="110" cy="128" r="1.3" opacity=".65"/>
            <circle cx="250" cy="116" r="1" opacity=".5"/><circle cx="340" cy="140" r="1.4" opacity=".7"/>
            <circle cx="560" cy="126" r="1.2" opacity=".6"/><circle cx="470" cy="126" r="1" opacity=".45"/>
            <circle cx="820" cy="152" r="1.3" opacity=".6"/><circle cx="180" cy="182" r="1" opacity=".4"/>
          </g>

          <!-- full moon -->
          <circle cx="845" cy="120" r="62" fill="url(#moonG)"/>
          <circle cx="845" cy="120" r="26" fill="#fdfbe9" opacity=".92"/>
          <circle cx="836" cy="113" r="5" fill="#e6e2c8" opacity=".5"/>
          <circle cx="854" cy="129" r="7" fill="#e6e2c8" opacity=".4"/>
          <circle cx="850" cy="107" r="3.5" fill="#e6e2c8" opacity=".45"/>

          <!-- distant range -->
          <path d="M0 258 L80 198 L150 242 L230 176 L310 238 L390 194 L470 250 L560 188 L650 244 L740 192 L830 248 L920 206 L1000 246 L1000 350 L0 350 Z" fill="url(#farG)" opacity=".75"/>

          <!-- Mt Everest massif -->
          <path d="M120 350 L300 168 L344 208 L400 78 L448 138 L492 62 L560 168 L620 128 L780 350 Z" fill="url(#eveG)"/>
          <!-- snow caps / ridges -->
          <path d="M492 62 L560 168 L532 158 L492 190 L458 144 L400 178 L400 78 Z" fill="#f2f7ff" opacity=".55"/>
          <path d="M492 62 L522 108 L490 124 L466 98 Z" fill="#ffffff" opacity=".85"/>
          <path d="M400 78 L430 122 L400 134 L378 110 Z" fill="#ffffff" opacity=".7"/>
          <path d="M300 168 L330 208 L302 200 L284 182 Z" fill="#e8f1ff" opacity=".5"/>
          <!-- ridge shadow -->
          <path d="M492 62 L560 168 L620 128 L780 350 L560 350 Z" fill="#050c1e" opacity=".38"/>
          <path d="M492 62 L448 138 L400 190 L300 350 L120 350 Z" fill="#ffffff" opacity=".05"/>

          <!-- foreground ridge -->
          <path d="M0 302 L110 280 L230 314 L360 286 L500 318 L640 290 L780 322 L900 296 L1000 318 L1000 350 L0 350 Z" fill="url(#nearG)"/>

          <!-- Seated Buddha (right of the hero orb) -->
          <g transform="translate(618 96) scale(0.86)">
            <ellipse cx="86" cy="112" rx="128" ry="120" fill="url(#haloG)"/>
            <g fill="url(#budG)" filter="url(#softGlow)" opacity=".35">
              <circle cx="86" cy="52" r="40"/><path d="M86 96c-38 0-58 40-62 96h124c-4-56-24-96-62-96z"/>
            </g>
            <g fill="url(#budG)">
              <!-- crossed legs / lotus base -->
              <path d="M12 236c0-20 32-34 74-34s74 14 74 34c0 10-12 16-30 18H42c-18-2-30-8-30-18z"/>
              <path d="M24 214c14-16 40-26 62-26s48 10 62 26c-14-6-36-10-62-10s-48 4-62 10z" opacity=".75"/>
              <!-- body + robe -->
              <path d="M86 74c-27 0-46 26-52 62-5 30-10 56-16 78h136c-6-22-11-48-16-78-6-36-25-62-52-62z"/>
              <!-- arms -->
              <path d="M40 118c-14 20-20 50-22 76l20 4c2-26 8-52 18-70z" opacity=".9"/>
              <path d="M132 118c14 20 20 50 22 76l-20 4c-2-26-8-52-18-70z" opacity=".9"/>
              <!-- hands in dhyana mudra -->
              <ellipse cx="86" cy="196" rx="40" ry="14"/>
              <!-- head -->
              <circle cx="86" cy="48" r="31"/>
              <!-- ushnisha -->
              <circle cx="86" cy="20" r="13"/>
              <circle cx="86" cy="7" r="6"/>
              <!-- elongated ears -->
              <ellipse cx="55" cy="54" rx="7" ry="21"/>
              <ellipse cx="117" cy="54" rx="7" ry="21"/>
            </g>
            <!-- halo ring -->
            <circle cx="86" cy="46" r="52" fill="none" stroke="rgba(255,224,160,.6)" stroke-width="1.6"/>
            <circle cx="86" cy="46" r="62" fill="none" stroke="rgba(255,214,140,.25)" stroke-width="1" stroke-dasharray="3 7"/>
          </g>
        </svg>
        <div class="desk-scene-fade"></div>
      </div>
      <header class="desk-top">
        <div class="dt-search">
          <span class="dt-sic"></span>
          <input placeholder="More than an AI. It's your execution partner." autocomplete="off" data-act="chat">
        </div>
        <button class="dt-ic" data-act="toast" data-arg="No new notifications" id="dtBell1"></button>
        <button class="dt-ic dot" data-act="nav" data-arg="wallet" id="dtBell2"></button>
        <button class="dt-credits" data-act="nav" data-arg="spark"><span class="scoin sm">S</span><b id="dtSpark">2,580</b></button>
        <button class="dt-orb" data-act="nav" data-arg="logostates" id="dtOrb"></button>
        <button class="dt-ic plus" data-act="chat" title="New chat">+</button>
      </header>
      <main class="desk-content" id="deskContent"></main>
    </div>

    <aside class="desk-right" id="deskRight"></aside>
  </div>

  <button class="view-toggle" id="viewToggle" data-act="toggle-mode">📱 Phone view</button>

  <main class="stage-wrap">
    <header class="brandbar">
      <div class="brandbar-logo" id="brandLogo"></div>
      <div class="brandbar-text">
        <h1>SAGE <span>ONE</span></h1>
        <p>Your Personal AI Mentor &amp; Execution Partner</p>
      </div>
      <div class="brandbar-quote" lang="ne">“सपना होइन, लक्ष्य बनाऔं। लक्ष्य होइन, कार्य बनाऔं। कार्य होइन, वास्तविकता बनाऔं।”</div>
    </header>

    <!-- Phone -->
    <div class="device" id="device">
      <div class="device-notch"></div>
      <div class="statusbar">
        <span class="sb-time">9:41</span>
        <span class="sb-icons">
          <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" opacity=".4"/></svg>
          <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 9.6 9.9 7A3.4 3.4 0 0 0 5.1 7zM2.2 4.3a7.6 7.6 0 0 1 10.6 0l1.4-1.5a9.6 9.6 0 0 0-13.4 0z" fill="currentColor"/></svg>
          <svg width="25" height="11" viewBox="0 0 25 11"><rect x=".5" y=".5" width="21" height="10" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="15" height="7" rx="1.6" fill="currentColor"/><path d="M23 4v3a2 2 0 0 0 0-3z" fill="currentColor" opacity=".5"/></svg>
        </span>
      </div>
      <div class="screen" id="screen"></div>
      <nav class="tabbar" id="tabbar"></nav>
      <div class="home-indicator"></div>
    </div>

    <footer class="pagefoot">
      <span>SAGE ONE · More Than An App — It's Your Future Partner</span>
      <span class="nepal-flag">🇳🇵 Built in Nepal</span>
    </footer>
  </main>

  <!-- Overlays -->
  <div class="sheet-root" id="sheetRoot"></div>
  <div class="toast-root" id="toastRoot"></div>
  <div class="fx-root" id="fxRoot" aria-hidden="true"></div>

  <script src="js/core.js"></script>
  <script src="js/data.js?v=2"></script>
  <script src="js/components.js?v=3"></script>
  <script src="js/ai.js?v=2"></script>
  <script src="js/screens-onboarding.js"></script>
  <script src="js/screens-home.js?v=3"></script>
  <script src="js/screens-apps.js"></script>
  <script src="js/screens-system.js"></script>
  <script src="js/screens-lab.js"></script>
  <script src="js/screens-agents.js?v=3"></script>
  <script src="js/app.js?v=2"></script>
</body>
</html>

```

### `css/styles.css`

<!-- Stylesheet (dark/light/blue themes, phone + desktop) | 97894 bytes -->

```css
/* ============================================================
   SAGE ONE — Design System
   Identity rule: SAGE blue + black NEVER disappears.
   Evolution color is an ACCENT layer only. (Why Not Full Color Takeover)
   ============================================================ */

:root{
  /* SAGE Identity (Permanent) */
  --black:#03060f;
  --deep-blue:#081229;
  --panel-blue:#0b1b3f;
  --electric:#2e86ff;
  --electric-2:#4fa8ff;
  --cyan:#6fd2ff;
  --white:#eaf2ff;
  --gold:#f5c86b;

  /* Surfaces */
  --bg:var(--black);
  --bg-2:#050b1c;
  --card:rgba(10,22,52,.66);
  --card-2:rgba(14,30,66,.85);
  --stroke:rgba(84,150,255,.20);
  --stroke-2:rgba(84,150,255,.38);
  --text:#e8f1ff;
  --muted:#8fa6cc;
  --muted-2:#5f7398;

  /* Evolution accent layer (defaults to stage 1 Bronze) */
  --accent:#c98a4b;
  --accent-glow:#e0a56b;
  --accent-soft:rgba(201,138,75,.16);

  /* Effects */
  --glow:0 0 24px rgba(47,134,255,.38);
  --glow-strong:0 0 44px rgba(47,134,255,.55);
  --accent-glow-shadow:0 0 22px var(--accent-glow);
  --r-lg:22px;
  --r-md:16px;
  --r-sm:12px;
  --grad-btn:linear-gradient(135deg,#1b5cff 0%,#39a0ff 100%);
  --grad-card:linear-gradient(160deg,rgba(23,53,116,.55),rgba(8,17,40,.75));
  --font:'Poppins','Noto Sans Devanagari',system-ui,-apple-system,sans-serif;
  --font-ui:'Inter','Noto Sans Devanagari',system-ui,sans-serif;
}

/* Theme: Light */
html[data-theme="light"]{
  --bg:#eef3fc; --bg-2:#e2ebfa;
  --card:rgba(255,255,255,.82);
  --card-2:rgba(255,255,255,.95);
  --stroke:rgba(27,92,255,.16);
  --stroke-2:rgba(27,92,255,.34);
  --text:#0c1a38; --muted:#4a5f85; --muted-2:#7b8db0;
  --deep-blue:#d7e5ff; --panel-blue:#c9dcff;
}
/* Theme: Blue */
html[data-theme="blue"]{
  --bg:#04102e; --bg-2:#061a44;
  --card:rgba(12,38,96,.72);
  --card-2:rgba(16,48,120,.9);
  --stroke:rgba(110,180,255,.3);
  --stroke-2:rgba(110,180,255,.5);
  --text:#e9f4ff; --muted:#a8c6f0; --muted-2:#7d9dd0;
}

*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{
  font-family:var(--font-ui);
  background:var(--black);
  color:var(--text);
  overflow-x:hidden;
  display:flex;align-items:center;justify-content:center;
  min-height:100vh;
}
button{font-family:inherit;color:inherit;background:none;border:none;cursor:pointer}
input,textarea,select{font-family:inherit}
::-webkit-scrollbar{width:0;height:0}

/* ============ COSMIC BACKDROP ============ */
.cosmos{position:fixed;inset:0;z-index:0;overflow:hidden;background:
  radial-gradient(1200px 700px at 78% -10%,#0d2a6b 0%,transparent 60%),
  radial-gradient(900px 600px at 12% 110%,#0a1e4d 0%,transparent 55%),
  linear-gradient(180deg,#03060f 0%,#050d22 60%,#03060f 100%);}
#stars{position:absolute;inset:0;width:100%;height:100%}
.nebula{position:absolute;border-radius:50%;filter:blur(90px);opacity:.5;animation:drift 26s ease-in-out infinite alternate}
.nebula.n1{width:640px;height:520px;left:-140px;top:-120px;background:radial-gradient(circle,#1b4fd8 0%,transparent 70%)}
.nebula.n2{width:720px;height:560px;right:-180px;bottom:-160px;background:radial-gradient(circle,#0e63c9 0%,transparent 70%);animation-delay:-13s}
@keyframes drift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(40px,-30px,0) scale(1.12)}}
.moon{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:420px;height:420px;border-radius:50%;
  background:radial-gradient(circle at 42% 38%,#fdf6dd 0%,#f4e3ae 34%,#c9a94f 62%,rgba(80,60,15,0) 72%);
  filter:blur(2px);opacity:.5;box-shadow:0 0 180px 60px rgba(245,215,130,.16)}
.peaks{position:absolute;left:0;right:0;bottom:-2px;height:34vh;opacity:.85;background:
  linear-gradient(180deg,transparent 0%,rgba(3,8,22,.6) 100%),
  conic-gradient(from 130deg at 22% 100%,#0a1731 0deg,#0a1731 26deg,transparent 27deg),
  conic-gradient(from 122deg at 52% 100%,#0c1c3c 0deg,#0c1c3c 34deg,transparent 35deg),
  conic-gradient(from 138deg at 82% 100%,#081226 0deg,#081226 30deg,transparent 31deg)}

/* ============ PAGE LAYOUT ============ */
.stage-wrap{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:18px;padding:26px 16px 34px;min-height:100vh;justify-content:center;width:100%}
.brandbar{display:flex;align-items:center;gap:16px;max-width:980px;width:100%;justify-content:center;flex-wrap:wrap}
.brandbar-logo{width:56px;height:56px;flex:none}
.brandbar-text h1{font-size:26px;letter-spacing:7px;font-weight:700;color:#fff}
.brandbar-text h1 span{color:var(--electric-2);font-weight:300}
.brandbar-text p{font-size:11px;letter-spacing:2.5px;color:var(--muted);text-transform:uppercase}
.brandbar-quote{font-family:var(--font);font-size:12.5px;color:#cfe0ff;opacity:.85;border-left:2px solid var(--electric);padding-left:12px;max-width:300px;line-height:1.7}
.pagefoot{display:flex;gap:18px;align-items:center;font-size:11px;letter-spacing:1.6px;color:var(--muted);text-transform:uppercase;flex-wrap:wrap;justify-content:center}
.nepal-flag{color:#9fb8e6}

/* ============ DEVICE ============ */
.device{
  position:relative;width:390px;height:820px;flex:none;
  background:linear-gradient(180deg,#0a1430,#050b1c);
  border-radius:52px;padding:12px;
  border:1px solid rgba(110,170,255,.35);
  box-shadow:0 0 0 2px rgba(6,12,30,.9),0 0 70px rgba(47,134,255,.28),0 40px 90px rgba(0,0,0,.65),inset 0 0 30px rgba(47,134,255,.07);
  transition:box-shadow .8s ease;
}
.device.evolving{box-shadow:0 0 0 2px rgba(6,12,30,.9),0 0 120px var(--accent-glow),0 40px 90px rgba(0,0,0,.65)}
.device-notch{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:128px;height:26px;background:#02040c;border-radius:0 0 18px 18px;z-index:30}
.statusbar{position:absolute;top:16px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:center;z-index:25;color:var(--text);font-size:12.5px;font-weight:600;pointer-events:none}
.sb-icons{display:flex;gap:5px;align-items:center}
.home-indicator{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);width:128px;height:4.5px;border-radius:4px;background:rgba(232,241,255,.5);z-index:30}
.screen{position:absolute;inset:12px;border-radius:42px;overflow:hidden;background:var(--bg);display:flex;flex-direction:column}
.screen::before{content:"";position:absolute;inset:0;background:
  radial-gradient(520px 300px at 80% -8%,rgba(30,80,190,.35),transparent 65%),
  radial-gradient(420px 260px at 0% 108%,rgba(20,60,150,.28),transparent 60%);pointer-events:none}
html[data-theme="light"] .screen::before{background:
  radial-gradient(520px 300px at 80% -8%,rgba(90,150,255,.28),transparent 65%),
  radial-gradient(420px 260px at 0% 108%,rgba(120,170,255,.25),transparent 60%)}
.view{position:relative;z-index:2;height:100%;overflow-y:auto;overflow-x:hidden;padding:58px 18px 96px;scroll-behavior:smooth}
.view.nonav{padding-bottom:28px}
.view.flush{padding-left:0;padding-right:0}
.view.chatview{padding:0;overflow:hidden;display:flex;flex-direction:column}
.btn svg,.list-item>svg,.set-item>svg,.notice svg,.sect-label svg,.link svg,.msg .bot svg{width:15px;height:15px;flex:none}
.pill svg{width:12px;height:12px;flex:none}

/* ============ TABBAR ============ */
.tabbar{position:absolute;bottom:0;left:0;right:0;height:86px;z-index:20;display:flex;align-items:flex-start;justify-content:space-around;padding:12px 10px 0;
  background:linear-gradient(180deg,transparent,rgba(3,7,18,.94) 42%);
  backdrop-filter:blur(14px);border-top:1px solid rgba(84,150,255,.12)}
.tabbar.hidden{display:none}
.tab{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:9.5px;letter-spacing:.6px;color:var(--muted-2);width:60px;padding-top:6px;transition:color .25s}
.tab svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.tab.active{color:var(--electric-2)}
.tab.active svg{filter:drop-shadow(0 0 8px rgba(79,168,255,.8))}
.tab.center{margin-top:-26px}
.tab.center .orb{width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#2d7dff,#0a2a7a 70%,#041028);
  display:flex;align-items:center;justify-content:center;border:1px solid rgba(120,190,255,.5);
  box-shadow:0 0 26px rgba(47,134,255,.65),inset 0 0 18px rgba(120,200,255,.35);animation:orbPulse 3.2s ease-in-out infinite}
.tab.center .orb svg{width:30px;height:30px;stroke:#cfe8ff;filter:drop-shadow(0 0 6px rgba(160,220,255,.9))}
@keyframes orbPulse{0%,100%{box-shadow:0 0 22px rgba(47,134,255,.5),inset 0 0 14px rgba(120,200,255,.3)}50%{box-shadow:0 0 36px rgba(47,134,255,.85),inset 0 0 22px rgba(120,200,255,.5)}}

/* ============ PRIMITIVES ============ */
.view h2.screen-title{font-size:20px;font-weight:700;letter-spacing:.2px;margin-bottom:2px}
.screen-sub{font-size:12px;color:var(--muted);margin-bottom:16px}
.card{background:var(--grad-card);border:1px solid var(--stroke);border-radius:var(--r-md);padding:14px;position:relative;overflow:hidden;backdrop-filter:blur(8px)}
.card.glow{border-color:var(--stroke-2);box-shadow:0 0 18px rgba(47,134,255,.12)}
.card.accented{border-color:color-mix(in srgb,var(--accent) 55%,transparent);box-shadow:0 0 20px var(--accent-soft)}
.row{display:flex;align-items:center;gap:12px}
.between{justify-content:space-between}
.col{display:flex;flex-direction:column;gap:2px}
.grow{flex:1;min-width:0}
.muted{color:var(--muted)}
.tiny{font-size:10.5px}
.small{font-size:12px}
.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}.mt20{margin-top:20px}
.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}
.ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sect-label{font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:var(--muted-2);margin:18px 0 10px;display:flex;justify-content:space-between;align-items:center}
.sect-label .link{color:var(--electric-2);letter-spacing:.4px;text-transform:none;font-size:11px}

.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 16px;border-radius:14px;font-size:14px;font-weight:600;letter-spacing:.2px;transition:transform .12s,box-shadow .25s,filter .2s}
.btn:active{transform:scale(.97)}
.btn.primary{background:var(--grad-btn);color:#fff;box-shadow:0 6px 22px rgba(27,92,255,.45),inset 0 1px 0 rgba(255,255,255,.25)}
.btn.primary:hover{filter:brightness(1.08)}
.btn.ghost{background:rgba(47,134,255,.08);border:1px solid var(--stroke-2);color:var(--electric-2)}
.btn.soft{background:var(--card-2);border:1px solid var(--stroke);color:var(--text)}
.btn.accent-btn{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 80%,#000),var(--accent));color:#fff;box-shadow:0 6px 20px var(--accent-soft)}
.btn.sm{padding:9px 14px;font-size:12px;border-radius:11px;width:auto}
.btn.xs{padding:6px 11px;font-size:11px;border-radius:9px;width:auto}
.btn:disabled{opacity:.45;pointer-events:none}

.chiprow{display:flex;gap:8px;overflow-x:auto;padding:2px 18px;margin:0 -18px 12px}
.chip{flex:none;padding:8px 15px;border-radius:20px;font-size:12px;font-weight:500;background:var(--card);border:1px solid var(--stroke);color:var(--muted);transition:.2s}
.chip.active{background:var(--grad-btn);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(27,92,255,.4)}

.input{width:100%;background:rgba(6,14,34,.7);border:1px solid var(--stroke);border-radius:13px;padding:14px 14px;font-size:13.5px;color:var(--text);outline:none;transition:.2s}
html[data-theme="light"] .input{background:rgba(255,255,255,.75)}
.input:focus{border-color:var(--electric);box-shadow:0 0 0 3px rgba(47,134,255,.15)}
.input::placeholder{color:var(--muted-2)}
.field{margin-bottom:12px}
.field label{display:block;font-size:11px;color:var(--muted);margin-bottom:6px;letter-spacing:.4px}

.iconbox{width:42px;height:42px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(47,134,255,.1);border:1px solid var(--stroke);color:var(--electric-2)}
.iconbox svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.iconbox.accent{background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 45%,transparent);color:var(--accent-glow)}

.pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.5px}
.pill.blue{background:rgba(47,134,255,.14);color:var(--electric-2);border:1px solid rgba(47,134,255,.3)}
.pill.gold{background:rgba(245,200,107,.12);color:var(--gold);border:1px solid rgba(245,200,107,.3)}
.pill.green{background:rgba(46,191,113,.12);color:#4fe39b;border:1px solid rgba(46,191,113,.3)}
.pill.accent{background:var(--accent-soft);color:var(--accent-glow);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}
.dot{width:7px;height:7px;border-radius:50%;background:#4fe39b;box-shadow:0 0 8px #4fe39b}

.list-item{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:var(--card);border:1px solid var(--stroke);margin-bottom:10px;transition:.2s;cursor:pointer}
.list-item:hover{border-color:var(--stroke-2);transform:translateY(-1px)}
.divider{height:1px;background:var(--stroke);margin:12px 0}

.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}

/* Progress */
.bar{height:7px;border-radius:6px;background:rgba(47,134,255,.12);overflow:hidden}
.bar > i{display:block;height:100%;border-radius:6px;background:var(--grad-btn);box-shadow:0 0 10px rgba(47,134,255,.7);transition:width .9s cubic-bezier(.2,.8,.2,1)}
.bar.accent > i{background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 70%,#fff),var(--accent));box-shadow:0 0 10px var(--accent-glow)}

/* ============ SAGE LOGO ============ */
.sage-logo{position:relative;display:block;flex:none}
.sage-logo .ring{transform-origin:50% 50%;animation:spinSlow 26s linear infinite}
.sage-logo .sage-mark{display:block;width:100%;height:100%;object-fit:contain;
  filter:drop-shadow(0 0 14px rgba(79,168,255,.5))}
.sage-logo.sage-spin::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;
  border:1px dashed rgba(140,200,255,.45);animation:spinSlow 26s linear infinite}
@keyframes spinSlow{to{transform:rotate(360deg)}}

/* ============ SPLASH ============ */
.splash{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;
  background:radial-gradient(600px 420px at 50% 22%,rgba(28,78,190,.5),transparent 62%),linear-gradient(180deg,#03060f,#061027 60%,#03060f)}
.splash .big-logo{width:150px;height:150px;animation:logoIn 1.6s cubic-bezier(.2,.8,.2,1)}
@keyframes logoIn{0%{opacity:0;transform:scale(.6)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}
.splash h1{font-size:34px;letter-spacing:13px;font-weight:700;color:#fff;text-shadow:0 0 30px rgba(79,168,255,.6)}
.splash h1 span{display:block;font-size:15px;letter-spacing:11px;font-weight:300;color:var(--electric-2);text-align:center;margin-top:2px}
.splash .tag{font-size:9.5px;letter-spacing:2.6px;color:var(--muted);text-transform:uppercase;text-align:center;max-width:250px;line-height:1.9}
.splash .quote{font-family:var(--font);font-size:12px;color:#d9e8ff;text-align:center;line-height:2;opacity:.9;max-width:270px}
.loadbar{width:150px;height:3px;border-radius:3px;background:rgba(79,168,255,.15);overflow:hidden}
.loadbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--electric),var(--cyan));box-shadow:0 0 12px var(--electric-2);animation:load 2.2s ease forwards}
@keyframes load{to{width:100%}}

/* ============ ONBOARDING ============ */
.hero-art{position:relative;height:300px;border-radius:26px;overflow:hidden;border:1px solid var(--stroke-2);margin-bottom:22px;
  background:radial-gradient(360px 220px at 50% 18%,rgba(250,222,140,.35),transparent 60%),linear-gradient(180deg,#071433,#0a1e4c 55%,#050b1c)}
.hero-art .h-moon{position:absolute;top:26px;left:50%;transform:translateX(-50%);width:120px;height:120px;border-radius:50%;
  background:radial-gradient(circle at 40% 36%,#fff8e0,#f2dc9e 55%,rgba(160,120,40,0) 74%);box-shadow:0 0 60px 16px rgba(245,215,130,.35)}
.hero-art .h-peak{position:absolute;left:0;right:0;bottom:0;height:120px;background:
  conic-gradient(from 128deg at 26% 100%,#0b1a3a 0deg,#0b1a3a 30deg,transparent 31deg),
  conic-gradient(from 120deg at 58% 100%,#0d2148 0deg,#0d2148 38deg,transparent 39deg),
  conic-gradient(from 136deg at 88% 100%,#081226 0deg,#081226 30deg,transparent 31deg)}
.hero-art .h-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-56%);width:110px;height:110px;filter:drop-shadow(0 0 26px rgba(79,168,255,.8))}
.hero-art .h-stars{position:absolute;inset:0;background-image:radial-gradient(1.4px 1.4px at 20% 30%,#fff,transparent),radial-gradient(1.2px 1.2px at 70% 18%,#cfe4ff,transparent),radial-gradient(1.6px 1.6px at 42% 66%,#fff,transparent),radial-gradient(1.1px 1.1px at 84% 48%,#dfeeff,transparent),radial-gradient(1.3px 1.3px at 12% 72%,#fff,transparent);opacity:.9}

.lang-card{display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;border:1px solid var(--stroke);background:var(--card);margin-bottom:12px;cursor:pointer;transition:.2s}
.lang-card.active{border-color:var(--electric);box-shadow:0 0 0 3px rgba(47,134,255,.14),0 0 22px rgba(47,134,255,.25);background:rgba(24,56,130,.4)}
.lang-card .flag{font-size:26px}
.lang-card b{font-size:15px}
.lang-card .sub{font-size:11px;color:var(--muted);font-family:var(--font)}

.or{display:flex;align-items:center;gap:12px;color:var(--muted-2);font-size:11px;margin:14px 0}
.or::before,.or::after{content:"";flex:1;height:1px;background:var(--stroke)}
.google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;border-radius:13px;background:#fff;color:#1f2a44;font-weight:600;font-size:13.5px}
.linkline{text-align:center;font-size:12px;color:var(--muted);margin-top:14px}
.linkline b{color:var(--electric-2);cursor:pointer}

.kyc-opt{display:flex;align-items:center;gap:13px;padding:15px;border-radius:15px;border:1px solid var(--stroke);background:var(--card);margin-bottom:11px;cursor:pointer;transition:.2s}
.kyc-opt.done{border-color:rgba(46,191,113,.5)}
.kyc-opt .status{font-size:10px;font-weight:600;color:var(--muted-2)}
.kyc-opt.done .status{color:#4fe39b}

.avatar-pick{width:92px;height:92px;border-radius:50%;margin:0 auto 16px;position:relative;cursor:pointer;
  background:radial-gradient(circle at 35% 30%,rgba(79,168,255,.35),rgba(10,25,64,.9));border:1.5px dashed rgba(120,180,255,.45);display:flex;align-items:center;justify-content:center;color:var(--electric-2)}
.avatar-pick.filled{border-style:solid;border-color:var(--electric)}
.avatar-pick .cam{position:absolute;right:-2px;bottom:-2px;width:30px;height:30px;border-radius:50%;background:var(--grad-btn);display:flex;align-items:center;justify-content:center;border:2px solid var(--bg)}

/* ============ HOME ============ */
.stage-hero{position:relative;border-radius:24px;padding:20px 18px 18px;overflow:hidden;border:1px solid var(--stroke-2);
  background:radial-gradient(300px 170px at 78% 0%,rgba(35,90,210,.5),transparent 62%),linear-gradient(165deg,rgba(13,32,76,.9),rgba(5,11,28,.92))}
.stage-hero .st-moon{position:absolute;top:-46px;right:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 40% 36%,rgba(255,246,214,.85),rgba(200,160,70,.35) 58%,transparent 72%);filter:blur(1px);opacity:.75}
.stage-hero .st-peak{position:absolute;left:0;right:0;bottom:0;height:70px;background:
  conic-gradient(from 126deg at 24% 100%,rgba(10,22,48,.9) 0deg,rgba(10,22,48,.9) 32deg,transparent 33deg),
  conic-gradient(from 118deg at 62% 100%,rgba(12,28,60,.9) 0deg,rgba(12,28,60,.9) 40deg,transparent 41deg),
  conic-gradient(from 134deg at 92% 100%,rgba(8,16,38,.9) 0deg,rgba(8,16,38,.9) 30deg,transparent 31deg);opacity:.8}
.stage-hero .st-content{position:relative;z-index:2;display:flex;gap:14px;align-items:center}
.stage-hero .st-name{font-size:19px;font-weight:700}
.stage-hero .st-rank{font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:var(--accent-glow);font-weight:600}
.stage-hero .st-desc{font-size:11.5px;color:var(--muted);margin-top:3px}

.spark-pill{display:flex;align-items:center;gap:7px;padding:8px 13px;border-radius:22px;background:rgba(6,16,40,.75);border:1px solid rgba(120,190,255,.35);font-size:13px;font-weight:700;color:#dff0ff;box-shadow:0 0 16px rgba(47,134,255,.25);cursor:pointer}
.spark-pill .spark-ic{width:18px;height:18px;color:var(--cyan);filter:drop-shadow(0 0 6px var(--cyan))}
.spark-pill .plus{width:18px;height:18px;border-radius:50%;background:var(--grad-btn);display:inline-flex;align-items:center;justify-content:center;font-size:13px;color:#fff;margin-left:2px}

.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.quick{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 6px;border-radius:16px;background:var(--card);border:1px solid var(--stroke);cursor:pointer;transition:.2s}
.quick:hover{border-color:var(--stroke-2);transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.3)}
.quick .qi{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(47,134,255,.12);border:1px solid var(--stroke)}
.quick .qi svg{width:19px;height:19px;stroke:var(--electric-2);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.quick span{font-size:10.5px;color:var(--muted);font-weight:500}

.stat-tile{padding:13px;border-radius:15px;background:var(--card);border:1px solid var(--stroke)}
.stat-tile .v{font-size:17px;font-weight:700}
.stat-tile .k{font-size:10px;color:var(--muted-2);letter-spacing:.5px;margin-top:2px}

.banner{position:relative;border-radius:18px;padding:15px;overflow:hidden;border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);
  background:linear-gradient(120deg,var(--accent-soft),rgba(6,14,36,.6))}
.banner h4{font-size:13.5px;font-weight:600}
.banner p{font-size:11px;color:var(--muted);margin-top:3px}

/* ============ CHAT ============ */
.chat-wrap{display:flex;flex-direction:column;height:100%}
.chat-head{position:absolute;top:0;left:0;right:0;z-index:10;padding:52px 16px 10px;display:flex;align-items:center;gap:11px;
  background:linear-gradient(180deg,rgba(4,9,24,.95),rgba(4,9,24,.8) 70%,transparent);backdrop-filter:blur(10px)}
.chat-head .sage-ava{width:38px;height:38px;flex:none}
.chat-body{flex:1;overflow-y:auto;padding:110px 16px 96px;display:flex;flex-direction:column;gap:12px}
.msg{max-width:82%;padding:12px 14px;border-radius:18px;font-size:13px;line-height:1.65;animation:msgIn .35s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.msg.user{align-self:flex-end;background:var(--grad-btn);color:#fff;border-bottom-right-radius:6px;box-shadow:0 4px 16px rgba(27,92,255,.35)}
.msg.bot{align-self:flex-start;background:var(--card-2);border:1px solid var(--stroke);border-bottom-left-radius:6px}
.msg.bot b{color:var(--cyan)}
.msg.bot ul{margin:6px 0 0 16px}
.msg.bot li{margin:2px 0}
.msg .src{display:flex;gap:8px;align-items:center;margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(47,134,255,.08);border:1px solid var(--stroke);font-size:11px}
.msg .src svg{width:13px;height:13px;stroke:var(--electric-2);fill:none;stroke-width:1.8}
.chat-input{position:absolute;bottom:0;left:0;right:0;z-index:10;padding:10px 14px 24px;display:flex;gap:9px;align-items:center;
  background:linear-gradient(0deg,rgba(4,9,24,.97),rgba(4,9,24,.85) 80%,transparent);backdrop-filter:blur(10px)}
.chat-input .input{border-radius:24px;padding:12px 16px}
.send-btn{width:44px;height:44px;flex:none;border-radius:50%;background:var(--grad-btn);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(27,92,255,.5)}
.send-btn svg{width:19px;height:19px;stroke:#fff;fill:none;stroke-width:2}
.quick-prompts{display:flex;gap:8px;overflow-x:auto;padding:0 16px 8px}
.quick-prompts .qp{flex:none;font-size:11px;padding:7px 12px;border-radius:16px;background:rgba(47,134,255,.1);border:1px solid var(--stroke);color:var(--electric-2)}

.research-card{align-self:stretch;max-width:100%;border-radius:18px;border:1px solid var(--stroke-2);background:var(--card-2);padding:15px;animation:msgIn .35s ease}
.research-step{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--muted);padding:6px 0;opacity:.4;transition:.4s}
.research-step.on{opacity:1;color:var(--text)}
.research-step .rs-dot{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--stroke-2);display:flex;align-items:center;justify-content:center;font-size:9px;flex:none}
.research-step.on .rs-dot{background:var(--grad-btn);border-color:transparent;box-shadow:0 0 10px rgba(47,134,255,.6)}
.research-step.done .rs-dot{background:rgba(46,191,113,.25);border-color:#4fe39b;color:#4fe39b}

/* ============ MARKETPLACE ============ */
.search-bar{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--stroke);border-radius:14px;padding:12px 14px;margin-bottom:12px}
.search-bar input{flex:1;background:none;border:none;outline:none;color:var(--text);font-size:13px}
.search-bar svg{width:17px;height:17px;stroke:var(--muted);fill:none;stroke-width:1.8}
.cat-row{display:flex;gap:8px;overflow-x:auto;margin:0 -18px 14px;padding:2px 18px}
.cat{flex:none;width:64px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:9.5px;color:var(--muted)}
.cat .ci{width:52px;height:52px;border-radius:16px;background:var(--card);border:1px solid var(--stroke);display:flex;align-items:center;justify-content:center;transition:.2s}
.cat.active .ci{border-color:var(--electric);box-shadow:0 0 16px rgba(47,134,255,.35);background:rgba(30,70,160,.4)}
.cat .ci svg{width:22px;height:22px;stroke:var(--electric-2);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.listing{border-radius:16px;overflow:hidden;border:1px solid var(--stroke);background:var(--card);margin-bottom:12px;cursor:pointer;transition:.2s}
.listing:hover{border-color:var(--stroke-2);transform:translateY(-1px)}
.listing .ph{height:118px;position:relative;display:flex;align-items:flex-end;padding:10px}
.listing .ph .price{background:rgba(3,8,20,.75);backdrop-filter:blur(6px);padding:5px 11px;border-radius:9px;font-size:12.5px;font-weight:700;color:#fff;border:1px solid rgba(120,190,255,.3)}
.listing .meta{padding:11px 12px}
.listing .meta h4{font-size:13.5px;font-weight:600}
.listing .meta p{font-size:11px;color:var(--muted);margin-top:2px}
.ph-veh{background:linear-gradient(140deg,#123266,#0a1c40 60%,#081226)}
.ph-elec{background:linear-gradient(140deg,#1a2c5e,#0d1b3e 55%,#091225)}
.ph-prop{background:linear-gradient(140deg,#0e3a4a,#0b2440 55%,#081226)}
.ph-land{background:linear-gradient(140deg,#14402c,#0c2a30 55%,#081826)}
.listing .ph::after{content:"";position:absolute;inset:0;background:radial-gradient(200px 100px at 70% 0%,rgba(90,160,255,.25),transparent 70%)}

.detail-hero{height:210px;border-radius:20px;position:relative;display:flex;align-items:flex-end;padding:14px;margin-bottom:14px;overflow:hidden}
.fee-box{border:1px dashed var(--stroke-2);border-radius:13px;padding:12px;background:rgba(47,134,255,.05)}

/* ============ JOBS / LEARNING / COMMUNITY ============ */
.job-card{display:flex;gap:12px;padding:14px;border-radius:16px;background:var(--card);border:1px solid var(--stroke);margin-bottom:11px;align-items:flex-start}
.job-card .logo{width:46px;height:46px;border-radius:13px;flex:none;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff}
.course-card{border-radius:16px;overflow:hidden;border:1px solid var(--stroke);background:var(--card);margin-bottom:12px;cursor:pointer}
.course-card .thumb{height:96px;position:relative;display:flex;align-items:center;justify-content:center}
.course-card .thumb .play{width:42px;height:42px;border-radius:50%;background:rgba(3,8,20,.6);border:1.5px solid rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.course-card .thumb .play svg{width:16px;height:16px;fill:#fff}
.course-card .body{padding:12px}
.group-avatar{width:48px;height:48px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;font-size:20px}

/* ============ FILES / AI STUDIO ============ */
.file-ic{width:44px;height:52px;flex:none;border-radius:9px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;font-size:8.5px;font-weight:800;letter-spacing:.5px;color:#fff;position:relative;overflow:hidden}
.file-ic::before{content:"";position:absolute;top:0;right:0;border-width:0 12px 12px 0;border-style:solid;border-color:transparent rgba(255,255,255,.35) transparent transparent}
.tool-card{padding:16px;border-radius:18px;border:1px solid var(--stroke);background:var(--card);cursor:pointer;transition:.2s;position:relative;overflow:hidden}
.tool-card:hover{border-color:var(--stroke-2);transform:translateY(-2px)}
.tool-card .ti{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.tool-card .ti svg{width:21px;height:21px;stroke:#fff;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.gen-canvas{width:100%;aspect-ratio:1;border-radius:18px;border:1px solid var(--stroke-2);background:#050b1c}

/* ============ WALLET / EARN ============ */
.balance-card{border-radius:22px;padding:20px;border:1px solid var(--stroke-2);position:relative;overflow:hidden;
  background:radial-gradient(260px 150px at 82% 0%,rgba(40,100,220,.5),transparent 62%),linear-gradient(150deg,rgba(14,34,82,.95),rgba(5,11,28,.95))}
.balance-card .amount{font-size:32px;font-weight:800;letter-spacing:-.5px}
.balance-card .cur{font-size:12px;color:var(--muted);letter-spacing:1.6px;text-transform:uppercase}
.spark-star{width:52px;height:52px;flex:none;color:var(--cyan);filter:drop-shadow(0 0 12px var(--cyan))}
.chart{height:96px;display:flex;align-items:flex-end;gap:5px;padding-top:8px}
.chart .cbar{flex:1;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,var(--electric-2),rgba(47,134,255,.12));min-height:6px;transition:height .7s cubic-bezier(.2,.8,.2,1)}
.chart .cbar.dim{background:linear-gradient(180deg,rgba(143,166,204,.5),rgba(143,166,204,.06))}
.range-row{display:flex;gap:6px;margin-top:10px}
.range-row button{flex:1;padding:7px;border-radius:9px;font-size:11px;color:var(--muted);background:rgba(47,134,255,.06);border:1px solid var(--stroke)}
.range-row button.active{color:#fff;background:var(--grad-btn);border-color:transparent}

.fee-table{width:100%;border-collapse:collapse;font-size:12px}
.fee-table td{padding:9px 10px;border-bottom:1px solid var(--stroke)}
.fee-table td:last-child{text-align:right;font-weight:700;color:var(--electric-2)}
.fee-table tr:last-child td{border-bottom:none}
.pay-method{display:flex;align-items:center;gap:12px;padding:13px;border-radius:14px;border:1px solid var(--stroke);background:var(--card);margin-bottom:10px;cursor:pointer;transition:.2s}
.pay-method.active{border-color:var(--electric);box-shadow:0 0 0 3px rgba(47,134,255,.12)}
.pay-logo{width:44px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800;color:#fff;letter-spacing:.3px}

/* ============ EVOLUTION ============ */
.emblem-wrap{display:flex;flex-direction:column;align-items:center;padding:14px 0 6px}
.emblem{position:relative;filter:drop-shadow(0 0 18px var(--accent-glow))}
.emblem.low{filter:drop-shadow(0 0 8px var(--accent-glow)) brightness(.92)}
.emblem.high{filter:drop-shadow(0 0 30px var(--accent-glow)) saturate(1.2)}
.emblem .orb-spin{transform-origin:50% 50%;animation:spinSlow 18s linear infinite}
.emblem.high .orb-spin{animation-duration:9s}
.emblem.low .orb-spin{animation-duration:30s}
.level-row{display:flex;gap:8px;justify-content:center;margin-top:10px}
.level-btn{padding:8px 16px;border-radius:12px;font-size:11px;font-weight:600;letter-spacing:1px;border:1px solid var(--stroke);color:var(--muted);background:var(--card)}
.level-btn.active{color:#fff;border-color:transparent;box-shadow:0 0 16px var(--accent-soft)}

.evo-track{display:flex;gap:10px;overflow-x:auto;margin:0 -18px;padding:6px 18px 12px}
.evo-node{flex:none;width:76px;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;opacity:.55;transition:.25s}
.evo-node.reached{opacity:1}
.evo-node.current .en-circle{box-shadow:0 0 0 2px var(--electric),0 0 22px rgba(47,134,255,.6)!important}
.evo-node .en-circle{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(150,190,255,.2);position:relative;transition:.25s}
.evo-node .en-name{font-size:9.5px;text-align:center;font-weight:600;line-height:1.3}
.evo-node .en-num{font-size:9px;color:var(--muted-2)}

.level-diagram{display:flex;gap:10px;justify-content:center}
.level-card{flex:1;max-width:104px;border-radius:16px;border:1px solid var(--stroke);background:var(--card);padding:12px 8px;text-align:center}
.level-card h5{font-size:10.5px;letter-spacing:2px;margin-bottom:8px;color:var(--muted)}
.level-card.on{border-color:color-mix(in srgb,var(--accent) 60%,transparent);box-shadow:0 0 18px var(--accent-soft)}

.flow-strip{display:flex;align-items:center;gap:4px;overflow-x:auto;margin:0 -18px;padding:4px 18px}
.flow-step{flex:none;display:flex;flex-direction:column;align-items:center;gap:5px;width:64px;font-size:8.5px;color:var(--muted);text-align:center;line-height:1.3}
.flow-step .fs-ic{width:38px;height:38px;border-radius:50%;border:1px solid var(--stroke-2);display:flex;align-items:center;justify-content:center;background:var(--card)}
.flow-step .fs-ic svg{width:16px;height:16px;stroke:var(--electric-2);fill:none;stroke-width:1.7}
.flow-step.final .fs-ic{background:radial-gradient(circle,#f5c86b,#c98a4b);border-color:transparent;box-shadow:0 0 16px rgba(245,200,107,.6)}
.flow-step.final .fs-ic svg{stroke:#fff}
.flow-arrow{flex:none;color:var(--muted-2);font-size:11px;margin-top:-14px}

.compare{display:flex;gap:10px}
.compare .cbox{flex:1;border-radius:15px;border:1px solid var(--stroke);padding:13px;background:var(--card)}
.compare .cbox h5{font-size:11.5px;display:flex;gap:7px;align-items:center;margin-bottom:8px}
.compare .cbox ul{margin-left:15px;font-size:10.5px;color:var(--muted);line-height:1.8}
.compare .skill h5{color:#4fa8ff}
.compare .money h5{color:var(--gold)}

.not-this{display:flex;gap:10px}
.nt-card{flex:1;border-radius:14px;padding:12px;border:1px solid var(--stroke);text-align:center}
.nt-card.bad{border-color:rgba(224,70,70,.4);background:rgba(224,70,70,.06)}
.nt-card.good{border-color:rgba(46,191,113,.4);background:rgba(46,191,113,.06)}
.nt-swatch{height:44px;border-radius:10px;margin-bottom:8px;position:relative;overflow:hidden}
.nt-swatch .accentbar{position:absolute;left:0;right:0;bottom:0;height:5px}

.accents-row{display:flex;gap:7px;flex-wrap:wrap}
.accent-dot{width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(255,255,255,.15);cursor:pointer;transition:.2s;position:relative}
.accent-dot:hover{transform:scale(1.15)}
.accent-dot.on{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--electric)}

.rules li{font-size:11.5px;color:var(--muted);line-height:1.9;margin-left:16px}
.rules b{color:var(--text)}

/* Transition FX overlay */
.fx-root{position:fixed;inset:0;z-index:100;pointer-events:none;display:none}
.fx-root.on{display:block;pointer-events:all}
.fx-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.9),transparent 60%);opacity:0}
.fx-flash.go{animation:flash .9s ease}
@keyframes flash{0%{opacity:0}25%{opacity:.85}100%{opacity:0}}
.fx-overlay{position:absolute;inset:0;background:rgba(2,4,12,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
.fx-overlay .fx-emblem{animation:emblemBurst 5.6s cubic-bezier(.2,.7,.2,1)}
@keyframes emblemBurst{0%{transform:scale(.6);filter:blur(8px) drop-shadow(0 0 10px var(--accent-glow))}
  55%{transform:scale(1.08);filter:blur(0) drop-shadow(0 0 40px var(--accent-glow))}
  70%{transform:scale(.97)}100%{transform:scale(1);filter:blur(0) drop-shadow(0 0 24px var(--accent-glow))}}
.fx-steps{display:flex;flex-direction:column;gap:6px;align-items:flex-start;min-height:190px}
.fx-step{font-size:12px;color:var(--muted);display:flex;gap:9px;align-items:center;opacity:0;transform:translateX(-8px);transition:.35s}
.fx-step.on{opacity:1;transform:none;color:var(--text)}
.fx-step .n{width:19px;height:19px;border-radius:50%;background:var(--grad-btn);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none}
.fx-title{font-size:20px;font-weight:800;letter-spacing:1px}
.fx-sub{font-size:11px;letter-spacing:2.6px;text-transform:uppercase;color:var(--accent-glow)}
.particle{position:absolute;border-radius:50%;pointer-events:none;animation:pfly linear forwards}
@keyframes pfly{to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}

/* ============ SHEET / TOAST ============ */
.sheet-root{position:fixed;inset:0;z-index:60;display:none}
.sheet-root.on{display:block}
.sheet-scrim{position:absolute;inset:0;background:rgba(2,5,14,.66);backdrop-filter:blur(4px);animation:fade .25s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.sheet{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(420px,100%);max-height:86vh;overflow-y:auto;
  background:linear-gradient(180deg,#0b1734,#070e22);border:1px solid var(--stroke-2);border-bottom:none;border-radius:26px 26px 0 0;padding:10px 20px 34px;animation:sheetUp .32s cubic-bezier(.2,.8,.2,1)}
html[data-theme="light"] .sheet{background:linear-gradient(180deg,#ffffff,#eef3fc)}
@keyframes sheetUp{from{transform:translate(-50%,100%)}to{transform:translate(-50%,0)}}
.sheet .grab{width:42px;height:4.5px;border-radius:4px;background:var(--stroke-2);margin:4px auto 14px}
.sheet h3{font-size:16.5px;font-weight:700;margin-bottom:4px}
.sheet .sub{font-size:11.5px;color:var(--muted);margin-bottom:16px}

.toast-root{position:fixed;top:22px;left:50%;transform:translateX(-50%);z-index:120;display:flex;flex-direction:column;gap:9px;align-items:center;pointer-events:none}
.toast{padding:11px 18px;border-radius:14px;background:rgba(9,20,46,.96);border:1px solid var(--stroke-2);color:var(--text);font-size:12.5px;box-shadow:0 10px 34px rgba(0,0,0,.5),0 0 20px rgba(47,134,255,.2);animation:toastIn .3s ease;display:flex;gap:9px;align-items:center}
.toast .tdot{width:8px;height:8px;border-radius:50%;background:var(--electric-2);box-shadow:0 0 8px var(--electric-2)}
@keyframes toastIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}

/* steps / timeline */
.tl-step{display:flex;gap:12px;position:relative;padding-bottom:16px}
.tl-step::before{content:"";position:absolute;left:11px;top:26px;bottom:0;width:1.5px;background:var(--stroke)}
.tl-step:last-child::before{display:none}
.tl-dot{width:23px;height:23px;flex:none;border-radius:50%;background:var(--card-2);border:1.5px solid var(--stroke-2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--electric-2);z-index:2}
.tl-step.on .tl-dot{background:var(--grad-btn);border-color:transparent;color:#fff;box-shadow:0 0 12px rgba(47,134,255,.6)}

/* success screen */
.success-ic{width:92px;height:92px;border-radius:50%;margin:10px auto 18px;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle,rgba(46,191,113,.3),transparent 70%);border:1.5px solid rgba(46,191,113,.6);box-shadow:0 0 34px rgba(46,191,113,.35)}
.success-ic svg{width:40px;height:40px;stroke:#4fe39b;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}

/* settings */
.set-group{border-radius:16px;border:1px solid var(--stroke);background:var(--card);overflow:hidden;margin-bottom:14px}
.set-item{display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid var(--stroke);cursor:pointer;transition:.15s}
.set-item:last-child{border-bottom:none}
.set-item:hover{background:rgba(47,134,255,.05)}
.set-item .sv{font-size:12px;color:var(--muted)}
.theme-cards{display:flex;gap:10px}
.theme-card{flex:1;border-radius:15px;border:1.5px solid var(--stroke);padding:9px;cursor:pointer;transition:.2s}
.theme-card.on{border-color:var(--electric);box-shadow:0 0 18px rgba(47,134,255,.3)}
.theme-card .tprev{height:64px;border-radius:10px;margin-bottom:8px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,.08)}
.theme-card span{font-size:10.5px;text-align:center;display:block;color:var(--muted)}
.theme-card.on span{color:var(--text)}

/* misc */
.notice{font-size:10px;color:var(--muted-2);text-align:center;margin-top:10px;line-height:1.7}
.backbtn{position:absolute;top:52px;left:16px;z-index:12;width:38px;height:38px;border-radius:12px;background:rgba(9,20,46,.8);border:1px solid var(--stroke);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
.backbtn svg{width:17px;height:17px;stroke:var(--text);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.top-nav{display:flex;align-items:center;gap:12px;margin-bottom:14px;min-height:40px}
.top-nav h2{font-size:17px;font-weight:700}
.view.has-back{padding-top:100px}

@media (max-width:520px){
  .stage-wrap{padding:10px 0 14px;gap:10px}
  .brandbar{display:none}
  .device{width:100%;max-width:430px;height:min(880px,94vh);border-radius:0;border:none;padding:0;box-shadow:none}
  .device-notch{display:none}
  .screen{inset:0;border-radius:0}
  .home-indicator{display:none}
  .pagefoot{display:none}
}

/* ============================================================
   STATE ORB — 9 logo states & animations (board 2)
   ============================================================ */
.orb-fx{position:relative;display:inline-flex;align-items:center;justify-content:center;width:var(--os);height:var(--os);--dur:16s;line-height:0}
.orb-fx .orb-core{position:relative;z-index:3;display:block;line-height:0}
.orb-glow{position:absolute;inset:4%;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--oc) 55%,transparent) 0%,transparent 68%);filter:blur(10px);opacity:.7;animation:orbBreathe 4.2s ease-in-out infinite;z-index:1}
.orb-ring{position:absolute;inset:3%;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--oc) 55%,transparent);box-shadow:0 0 14px color-mix(in srgb,var(--oc) 40%,transparent);opacity:.85;z-index:2}
.orb-orbit{position:absolute;inset:-5%;border-radius:50%;border:1px dashed color-mix(in srgb,var(--oc) 45%,transparent);animation:spinSlow var(--dur) linear infinite;z-index:2}
.orb-orbit.o2{inset:-13%;animation-duration:calc(var(--dur) * 1.7);animation-direction:reverse;border-style:solid;border-color:color-mix(in srgb,var(--oc) 22%,transparent)}
.orb-orbit i{position:absolute;left:50%;top:-3.5px;width:7px;height:7px;margin-left:-3.5px;border-radius:50%;background:var(--oc2);box-shadow:0 0 9px var(--oc2)}
.orb-orbit i:nth-child(2){top:auto;bottom:-3px;width:5px;height:5px;margin-left:-2.5px}
.orb-pts{position:absolute;inset:0;animation:spinSlow calc(var(--dur) * .65) linear infinite reverse;z-index:2}
.orb-pts i{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:var(--oc2);box-shadow:0 0 7px var(--oc2);opacity:.85;
  transform:rotate(calc(var(--i) * 51.4deg)) translateY(calc(var(--os) * -.42))}
.orb-fx .orb-tag{position:absolute;bottom:-16%;left:50%;transform:translateX(-50%);font-size:9.5px;letter-spacing:2px;font-weight:700;color:var(--oc);white-space:nowrap;z-index:4;line-height:1}
.orb-crown{position:absolute;top:-12%;left:50%;transform:translateX(-50%);font-size:calc(var(--os) * .2);filter:drop-shadow(0 0 8px rgba(255,215,106,.85));z-index:5;animation:crownFloat 3s ease-in-out infinite;line-height:1}
.orb-crack{position:absolute;inset:9%;border-radius:50%;z-index:4;pointer-events:none;mix-blend-mode:screen;animation:spinSlow 11s linear infinite;
  background:conic-gradient(transparent 0 38deg,rgba(255,90,90,.75) 39deg 41deg,transparent 42deg 128deg,rgba(255,140,90,.6) 129deg 131deg,transparent 132deg 244deg,rgba(255,70,70,.7) 245deg 247deg,transparent 248deg)}
.orb-scan{position:absolute;left:10%;right:10%;height:30%;top:8%;border-radius:50%;z-index:4;pointer-events:none;filter:blur(3px);background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--oc) 45%,transparent));animation:scanY 2.4s ease-in-out infinite}

@keyframes orbBreathe{0%,100%{opacity:.5;transform:scale(.96)}50%{opacity:.95;transform:scale(1.05)}}
@keyframes crownFloat{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-5px)}}
@keyframes scanY{0%{top:8%}50%{top:58%}100%{top:8%}}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.06);opacity:1}}
@keyframes successRipple{0%{transform:scale(.92);opacity:1}70%{transform:scale(1.18);opacity:.25}100%{transform:scale(.92);opacity:1}}
@keyframes glitchJit{0%,86%,100%{transform:translate(0,0)}88%{transform:translate(-3px,1px) skewX(3deg)}91%{transform:translate(3px,-2px)}94%{transform:translate(-2px,-1px) skewX(-2deg)}97%{transform:translate(2px,2px)}}
@keyframes failFlicker{0%,100%{opacity:.75}42%{opacity:.35}46%{opacity:.9}52%{opacity:.4}}
@keyframes recoHue{0%{filter:hue-rotate(0deg) drop-shadow(0 0 14px rgba(208,179,255,.5))}50%{filter:hue-rotate(150deg) drop-shadow(0 0 22px rgba(112,211,252,.6))}100%{filter:hue-rotate(0deg) drop-shadow(0 0 14px rgba(208,179,255,.5))}}
@keyframes earnPop{0%{transform:scale(.7);opacity:.4}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}

/* per-state personality */
.st-idle .orb-glow{opacity:.5}
.st-idle .orb-orbit{animation-duration:26s}
.st-searching .orb-orbit{animation-duration:5.5s}
.st-searching .orb-orbit.o2{animation-duration:9s}
.st-searching .orb-pts{animation-duration:7s}
.st-analyzing .orb-glow{animation-duration:1.7s}
.st-analyzing .orb-ring{animation:ringPulse 1.9s ease-in-out infinite}
.st-analyzing .orb-orbit{animation-duration:7s}
.st-verifying .orb-glow{animation-duration:2.6s}
.st-success .orb-ring{animation:successRipple 2.1s ease-out infinite}
.st-success .orb-glow{opacity:.9;animation-duration:2.8s}
.st-failure{animation:glitchJit 3.4s steps(1) infinite}
.st-failure .orb-glow{background:radial-gradient(circle,rgba(255,70,70,.6),transparent 66%);animation:failFlicker 1.9s ease-in-out infinite}
.st-failure .orb-ring{border-color:rgba(255,110,110,.7);box-shadow:0 0 16px rgba(255,70,70,.5)}
.st-recovery{animation:recoHue 5s linear infinite}
.st-recovery .orb-orbit{animation-duration:6s}
.st-earning .orb-glow{opacity:1;animation-duration:2.2s;background:radial-gradient(circle,rgba(245,166,35,.6),transparent 68%)}
.st-earning .orb-ring{border-color:rgba(255,215,120,.85);box-shadow:0 0 20px rgba(245,180,60,.55)}
.st-earning .orb-pts{animation-duration:5s}
.st-premium .orb-glow{background:radial-gradient(circle,rgba(157,123,255,.55),transparent 68%)}
.st-premium .orb-ring{border-color:rgba(201,179,255,.8)}

/* fullscreen state preview */
.state-fx{text-align:center}
.state-orb{display:flex;justify-content:center}
.state-name{font-size:24px;font-weight:800;letter-spacing:6px;margin-top:18px}
.state-sub{font-size:13px;color:var(--muted);letter-spacing:1.4px;margin-top:5px}

/* ============================================================
   LOGO STATES GRID
   ============================================================ */
.ls-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ls-tile{position:relative;border-radius:16px;border:1px solid var(--stroke);background:linear-gradient(180deg,rgba(10,20,46,.88),rgba(4,9,22,.94));padding:22px 6px 13px;text-align:center;cursor:pointer;transition:.2s;overflow:hidden}
.ls-tile:hover{border-color:var(--stroke-2);transform:translateY(-3px);box-shadow:0 12px 26px rgba(0,0,0,.45)}
.ls-orb{display:flex;justify-content:center;margin-bottom:12px;min-height:96px;align-items:center}
.ls-name{font-size:10.5px;font-weight:700;letter-spacing:1.8px}
.ls-sub{font-size:9.5px;color:var(--muted);margin-top:3px;line-height:1.4}

/* ============================================================
   HOME HERO (board 2 — Think · Research · Create · Execute · Earn)
   ============================================================ */
.home-hero{position:relative;border-radius:24px;padding:24px 16px 18px;border:1px solid var(--stroke-2);overflow:hidden;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:11px;
  background:radial-gradient(420px 250px at 50% -12%,rgba(30,84,200,.55),transparent 66%),linear-gradient(180deg,rgba(9,20,50,.94),rgba(4,9,24,.96))}
.hh-orb{filter:drop-shadow(0 0 34px rgba(60,140,255,.55))}
.hh-tags{display:flex;gap:11px;flex-wrap:wrap;justify-content:center}
.hh-tags span{font-size:9.5px;letter-spacing:2.6px;color:#9fc2ff;font-weight:700}
.hh-claim{font-size:10.5px;letter-spacing:2.2px;color:var(--muted)}
.hh-claim i{font-style:normal;color:var(--electric-2)}
.hh-claim b{color:#fff;font-weight:700}
.hh-ask{display:flex;align-items:center;gap:8px;width:100%;background:rgba(5,12,30,.88);border:1px solid var(--stroke-2);border-radius:26px;padding:7px 8px 7px 15px;margin-top:4px}
.hh-ask > span{color:var(--muted);display:flex}
.hh-ask input{flex:1;min-width:0;background:none;border:none;outline:none;color:var(--text);font-size:13px}
.hh-ask input::placeholder{color:var(--muted-2)}
.hh-mic,.hh-send{width:34px;height:34px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center}
.hh-mic{background:rgba(47,134,255,.12);border:1px solid var(--stroke);color:var(--electric-2)}
.hh-send{background:var(--grad-btn);color:#fff;box-shadow:0 4px 14px rgba(27,92,255,.45)}
.hh-actions{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;width:100%}
.hh-act{display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 2px 9px;border-radius:14px;background:rgba(9,19,44,.82);border:1px solid var(--stroke);color:var(--muted);font-size:9.5px;letter-spacing:.4px;transition:.2s}
.hh-act svg{width:17px;height:17px;stroke:var(--electric-2);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.hh-act:hover{border-color:var(--stroke-2);color:#fff;transform:translateY(-2px);box-shadow:0 8px 18px rgba(0,0,0,.4)}

/* desktop hero split */
.dhero{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:30px;padding:30px 6px 20px}
.dhero-col{display:flex;flex-direction:column;gap:13px;font-size:12.5px;letter-spacing:5px;font-weight:600;color:#9fc2ff}
.dhero-col.left{align-items:flex-end;text-align:right}
.dhero-col.right{align-items:flex-start;color:var(--muted);letter-spacing:3.5px}
.dhero-col .hl{color:#fff;font-weight:700}
.dhero-col i{font-style:normal;color:var(--electric-2);font-size:15px;line-height:.7}
.dhero-orb{filter:drop-shadow(0 0 55px rgba(60,140,255,.6))}

/* ============================================================
   DESKTOP DASHBOARD SHELL (board 2)
   ============================================================ */
.desk{display:none;position:fixed;inset:0;z-index:6;grid-template-columns:236px minmax(0,1fr) 300px;
  background:linear-gradient(180deg,rgba(2,5,14,.62),rgba(2,5,14,.72));backdrop-filter:blur(7px)}
body.on-desk .desk{display:grid}
body.on-desk .stage-wrap{display:none}
body:not(.desk-home) .desk{grid-template-columns:236px minmax(0,1fr)}
body:not(.desk-home) .desk-right{display:none}

.desk-side{display:flex;flex-direction:column;gap:14px;padding:18px 14px 16px;overflow-y:auto;border-right:1px solid var(--stroke);background:rgba(4,9,24,.86)}
.ds-brand{display:flex;align-items:center;gap:10px}
.ds-logo{width:34px;height:34px;display:block;flex:none}
.ds-brandtext b{display:block;font-size:15.5px;letter-spacing:3.5px;font-weight:700;color:#fff}
.ds-brandtext b i{font-style:normal;font-weight:300;color:var(--electric-2)}
.ds-brandtext span{font-size:7.5px;letter-spacing:1.7px;color:var(--muted-2)}
.ds-nav{display:flex;flex-direction:column;gap:3px}
.ds-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:12px;font-size:13px;font-weight:500;color:var(--muted);border:1px solid transparent;transition:.18s;text-align:left}
.ds-item svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
.ds-item:hover{background:rgba(47,134,255,.08);color:#fff}
.ds-item.on{background:linear-gradient(90deg,rgba(27,92,255,.85),rgba(57,160,255,.6));color:#fff;border-color:rgba(120,190,255,.45);box-shadow:0 6px 18px rgba(27,92,255,.35)}
.ds-credits{border:1px solid var(--stroke);border-radius:16px;padding:12px;background:radial-gradient(180px 90px at 90% 0%,rgba(40,100,220,.3),transparent 70%),rgba(9,19,44,.85)}
.dsc-head{display:flex;gap:9px;align-items:flex-start;margin-bottom:10px}
.dsc-head b{font-size:8.5px;letter-spacing:1.6px;color:var(--muted)}
.dsc-amt{font-size:21px;font-weight:800;line-height:1.15;color:#fff}
.dsc-head .tiny{font-size:9.5px;color:var(--muted-2)}
.dsc-spark{width:56px;height:24px;flex:none;align-self:flex-end;margin-left:auto}
.ds-prem{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:14px;border:1px solid rgba(245,200,107,.3);background:linear-gradient(120deg,rgba(245,200,107,.1),rgba(9,19,44,.7));cursor:pointer;transition:.2s}
.ds-prem:hover{border-color:rgba(245,200,107,.55)}
.ds-crown{font-size:18px;filter:drop-shadow(0 0 8px rgba(245,200,107,.6))}
.ds-prem b{font-size:12.5px;color:#ffe6a8}
.ds-prem .tiny{font-size:10px;color:var(--muted)}
.ds-chev{color:var(--muted-2);font-size:17px}
.ds-user{display:flex;align-items:center;gap:10px;margin-top:auto;padding:10px 11px;border-radius:14px;border:1px solid var(--stroke);background:rgba(9,19,44,.8);cursor:pointer;transition:.2s}
.ds-user:hover{border-color:var(--stroke-2)}
.ds-ava{width:34px;height:34px;flex:none;border-radius:50%;background:var(--grad-btn);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;box-shadow:var(--glow)}
.ds-user b{font-size:12.5px;display:block}
.ds-user .tiny{font-size:10px;color:var(--muted)}
.ds-status{width:9px;height:9px;border-radius:50%;background:#4fe39b;box-shadow:0 0 8px #4fe39b;flex:none}

.desk-body{display:flex;flex-direction:column;min-width:0;height:100vh}
.desk-top{display:flex;align-items:center;gap:11px;padding:13px 22px;border-bottom:1px solid var(--stroke);background:rgba(4,9,24,.7);backdrop-filter:blur(10px);flex:none}
.dt-search{flex:1;max-width:640px;display:flex;align-items:center;gap:10px;background:rgba(8,16,38,.85);border:1px solid var(--stroke);border-radius:24px;padding:10px 16px;transition:.2s}
.dt-search:focus-within{border-color:var(--electric);box-shadow:0 0 0 3px rgba(47,134,255,.14)}
.dt-search input{flex:1;min-width:0;background:none;border:none;outline:none;color:var(--text);font-size:13px}
.dt-search input::placeholder{color:var(--muted-2)}
.dt-sic{display:flex;color:var(--muted)}
.dt-sic svg{width:16px;height:16px}
.dt-ic{position:relative;width:38px;height:38px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid var(--stroke);background:rgba(8,16,38,.8);color:var(--muted);transition:.2s}
.dt-ic:hover{border-color:var(--stroke-2);color:#fff}
.dt-ic svg{width:17px;height:17px}
.dt-ic.dot::after{content:"";position:absolute;top:7px;right:9px;width:7px;height:7px;border-radius:50%;background:#4fa8ff;box-shadow:0 0 8px #4fa8ff}
.dt-ic.plus{font-size:19px;color:var(--electric-2);font-weight:400}
.dt-credits{display:flex;align-items:center;gap:8px;padding:5px 13px 5px 6px;border-radius:22px;border:1px solid rgba(245,166,35,.4);background:rgba(34,24,4,.65);color:#ffe6a8;font-size:13.5px;transition:.2s}
.dt-credits:hover{border-color:rgba(245,166,35,.7)}
.dt-orb{width:40px;height:40px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(120,190,255,.45);background:rgba(8,16,38,.85);box-shadow:0 0 16px rgba(47,134,255,.4);transition:.2s}
.dt-orb:hover{box-shadow:0 0 24px rgba(47,134,255,.65)}
.scoin{width:26px;height:26px;flex:none;border-radius:50%;background:radial-gradient(circle at 35% 28%,#ffeeb0,#f5a623 58%,#b8860b);color:#3a2a00;font-weight:800;font-size:13px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(245,166,35,.55)}
.scoin.sm{width:23px;height:23px;font-size:11.5px}

/* Mt Everest + Buddha backdrop (board 1) */
.desk-body{position:relative;isolation:isolate}
.desk-scene{position:absolute;top:0;left:0;right:0;z-index:0;pointer-events:none;overflow:hidden}
.desk-scene svg{display:block;width:100%;height:auto}
.desk-scene-fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,6,15,.18) 0%,rgba(3,6,15,.1) 52%,rgba(3,6,15,.72) 86%,rgba(3,6,15,.96) 100%)}
.desk-top{position:relative;z-index:3}
.desk-content{position:relative;z-index:2;flex:1;min-height:0;overflow-y:auto;padding:20px 28px 46px}
/* banner reserve: scene height = 35% of desk-body width, minus the 67px topbar */
body.desk-home .desk-content{padding-top:calc(35% - 67px)}
body:not(.desk-home) .desk-scene{display:none}
.desk-content .view{position:relative;height:auto;min-height:100%;max-width:860px;margin:0 auto;padding:6px 0 30px;overflow:visible}
.desk-content .view.flush{padding-left:0;padding-right:0}
.desk-content .view.chatview{max-width:none;height:calc(100vh - 96px);margin:-20px -28px -46px;padding:0;overflow:hidden}
.desk-content .chat-body{padding-top:96px}
.desk-content .sect-label{margin-top:22px}
.desk-content .backbtn{top:14px}

.desk-right{display:flex;flex-direction:column;gap:14px;padding:18px 16px;overflow-y:auto;border-left:1px solid var(--stroke);background:rgba(4,9,24,.8)}
.rail-card{border:1px solid var(--stroke);border-radius:16px;background:rgba(9,19,44,.75);padding:12px 11px}
.rail-head{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;font-weight:700;margin-bottom:6px}
.rail-live{font-size:9px;letter-spacing:1.4px;color:#4fe39b}
.rail-foot{margin-top:auto;text-align:center;font-size:11px;letter-spacing:1.6px;color:var(--muted);line-height:1.9}
.rail-foot b{color:#fff}

.la-row{display:flex;align-items:center;gap:10px;padding:9px 6px;border-radius:11px;cursor:pointer;transition:.15s}
.la-row:hover{background:rgba(47,134,255,.07)}
.la-row + .la-row{border-top:1px solid rgba(84,150,255,.1)}
.la-row > svg{width:14px;height:14px;stroke:var(--muted-2);flex:none}
.la-row b{display:block}
.la-row .ellipsis{max-width:150px}

.view-toggle{position:fixed;right:16px;bottom:16px;z-index:45;display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:22px;
  background:rgba(9,20,46,.94);border:1px solid var(--stroke-2);color:var(--text);font-size:11.5px;letter-spacing:.6px;cursor:pointer;
  box-shadow:0 10px 26px rgba(0,0,0,.55),0 0 18px rgba(47,134,255,.2);transition:.2s}
.view-toggle:hover{border-color:var(--electric);transform:translateY(-2px)}
body.on-desk .desk-content .hh-ask,body.on-desk .desk-content .hh-actions{max-width:600px;margin-left:auto;margin-right:auto}
body.on-desk .home-panels{display:none}

/* ============================================================
   RESEARCH LAB (board 4)
   ============================================================ */
.rs-chips{display:flex;gap:6px;overflow-x:auto;margin:0 -18px 12px;padding:3px 18px}
.rs-chip{flex:none;padding:7px 14px;border-radius:17px;font-size:11px;font-weight:600;letter-spacing:.4px;color:var(--muted);background:rgba(9,19,44,.85);border:1px solid var(--stroke);transition:.2s}
.rs-chip.on{color:#fff;border-color:color-mix(in srgb,var(--rc) 65%,transparent);background:color-mix(in srgb,var(--rc) 20%,transparent);box-shadow:0 0 16px color-mix(in srgb,var(--rc) 35%,transparent)}
.rs-stage{position:relative;border-radius:22px;padding:15px 14px 13px;text-align:center;overflow:hidden;border:1px solid color-mix(in srgb,var(--rc) 38%,var(--stroke));
  background:radial-gradient(340px 210px at 50% -5%,color-mix(in srgb,var(--rc) 24%,transparent),transparent 72%),linear-gradient(180deg,rgba(6,13,32,.96),rgba(3,7,18,.98))}
.rs-caption{font-size:10px;letter-spacing:1.6px;color:var(--muted-2);margin-bottom:4px}
.rs-orb{display:flex;justify-content:center;margin:6px 0 10px}
.rs-title{font-size:19px;font-weight:700;letter-spacing:.3px}
.rs-title.brand{letter-spacing:9px;font-size:25px;background:linear-gradient(135deg,#d6f0ff,#4fa8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.rs-sub{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.65}
.rs-prog{height:6px;border-radius:6px;background:rgba(255,255,255,.08);margin-top:14px;overflow:hidden}
.rs-prog i{display:block;height:100%;width:0;border-radius:6px;transition:width 1.1s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 10px currentColor}
.rs-pct{font-size:11.5px;font-weight:700;margin-top:6px}
.rs-stats{margin-top:13px;display:flex;flex-direction:column;gap:7px;text-align:left}
.rs-stat{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:rgba(9,19,44,.8);border:1px solid var(--stroke);font-size:12.5px}
.rs-stat .tick{width:8px;height:8px;flex:none;border-radius:50%;box-shadow:0 0 8px currentColor}
.rs-stat b{font-size:13px}
.rs-ask{display:flex;align-items:center;gap:8px;margin-top:13px;background:rgba(5,12,30,.92);border:1px solid var(--stroke-2);border-radius:24px;padding:7px 8px 7px 14px;color:var(--muted)}
.rs-ask input{flex:1;min-width:0;background:none;border:none;outline:none;color:var(--text);font-size:12.5px}
.rs-ask input::placeholder{color:var(--muted-2)}
.rs-mic{width:30px;height:30px;flex:none;border-radius:50%;background:rgba(47,134,255,.14);display:flex;align-items:center;justify-content:center;color:var(--electric-2)}
.rs-srcrow{display:flex;gap:9px;justify-content:center;margin-top:15px;flex-wrap:wrap}
.rs-src{width:35px;height:35px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:800;background:#fff;color:#333;border:1px solid rgba(255,255,255,.2)}
.rs-src:nth-child(1){background:#4285f4;color:#fff}
.rs-src:nth-child(2){background:#ff0000;color:#fff}
.rs-src:nth-child(3){background:#f1f3f4;color:#111}
.rs-src:nth-child(4){background:#ff4500;color:#fff}
.rs-src:nth-child(5){background:#24292f;color:#fff}
.rs-src:nth-child(6){background:#000;color:#fff;border-color:#3a3a3a}
.rs-src.more{background:rgba(47,134,255,.1);color:var(--electric-2);border:1px dashed var(--stroke-2);font-size:15px}
.rs-tabbar{display:flex;justify-content:space-around;margin-top:15px;padding-top:11px;border-top:1px solid rgba(84,150,255,.15);font-size:9.5px;letter-spacing:.7px;color:var(--muted-2)}
.rs-tabbar .on{color:#34d399;font-weight:700}
.rs-top-src{display:flex;align-items:center;gap:10px;margin-top:13px;padding:10px 11px;border-radius:13px;background:rgba(9,19,44,.88);border:1px solid var(--stroke);text-align:left;cursor:pointer}
.rs-checks{margin-top:11px;display:flex;flex-direction:column;gap:7px;text-align:left}
.rs-checks div{display:flex;gap:9px;align-items:center;font-size:12px;color:var(--muted)}
.ck{width:17px;height:17px;flex:none;border-radius:50%;background:rgba(52,211,153,.16);color:#34d399;font-size:10px;display:inline-flex;align-items:center;justify-content:center}

.src-badge{width:30px;height:30px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;letter-spacing:0}
.src-badge svg{width:15px;height:15px}
.src-badge.lg{width:42px;height:42px;border-radius:13px;font-size:15px}
.src-badge.ghost{background:none;border:1px dashed var(--stroke-2);color:var(--muted);font-weight:600}
.src-panel{padding:12px 11px}
.sp-head{display:flex;align-items:center;gap:9px;padding-bottom:10px;border-bottom:1px solid var(--stroke);margin-bottom:6px}
.sp-head span:first-child{font-size:16px;color:var(--electric-2)}
.sp-row{display:flex;align-items:center;gap:10px;padding:10px 5px;border-radius:11px;cursor:pointer;transition:.15s}
.sp-row:hover{background:rgba(47,134,255,.07)}
.sp-row + .sp-row{border-top:1px solid rgba(84,150,255,.1)}
.sp-row b{display:block}
.src-detail{padding:14px 13px}
.src-head{display:flex;align-items:center;gap:11px}
.src-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}
.src-stats div{background:rgba(47,134,255,.08);border:1px solid var(--stroke);border-radius:12px;padding:9px 5px;text-align:center}
.src-stats b{display:block;font-size:15.5px;color:var(--electric-2)}
.src-stats span{font-size:9.5px;color:var(--muted)}
.src-tabs{display:flex;gap:7px;margin-bottom:11px}
.src-tabs button{flex:1;padding:8px;border-radius:11px;font-size:11.5px;color:var(--muted);background:rgba(9,19,44,.75);border:1px solid var(--stroke);transition:.2s}
.src-tabs button.on{background:var(--grad-btn);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(27,92,255,.35)}
.src-pages .btn{margin-top:10px}
.src-page{display:flex;align-items:center;gap:9px;padding:9px 3px;border-bottom:1px solid rgba(84,150,255,.1)}
.sp-n{font-size:11px;color:var(--muted-2);width:16px;flex:none}
.sp-ic{width:27px;height:27px;flex:none;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800}
.src-page b{font-size:12.5px;display:block}
.sp-ok{font-size:13px;flex:none;font-weight:700}
.src-preview p{font-size:12.5px;line-height:1.75;color:var(--muted);margin-bottom:10px}
.src-preview b{color:var(--text)}

.fail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.fl-tile{position:relative;border-radius:15px;padding:22px 7px 11px;text-align:center;overflow:hidden;transition:.2s;border:1px solid color-mix(in srgb,var(--rc) 32%,var(--stroke));
  background:linear-gradient(180deg,rgba(9,17,40,.92),rgba(4,8,20,.96))}
.fl-tile:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--rc) 60%,transparent)}
.fl-num{position:absolute;top:7px;left:8px;width:17px;height:17px;border-radius:50%;background:var(--rc);color:#07101c;font-size:9.5px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px color-mix(in srgb,var(--rc) 60%,transparent)}
.fl-orb{display:flex;justify-content:center;margin-bottom:9px}
.fl-name{display:block;font-size:10.5px;letter-spacing:.7px}
.fl-name em{font-style:normal;color:var(--muted-2);font-weight:400;font-size:9px}
.fl-desc{display:block;font-size:9.5px;color:var(--muted);margin-top:4px;line-height:1.5;min-height:26px}
.fl-error{display:flex;flex-wrap:wrap;gap:11px;align-items:center;margin-top:11px;padding:13px;border-radius:15px;border:1px solid rgba(255,107,107,.45);background:linear-gradient(120deg,rgba(255,107,107,.13),rgba(9,19,44,.65))}
.fl-warn{width:38px;height:38px;flex:none;border-radius:50%;background:rgba(255,107,107,.18);display:flex;align-items:center;justify-content:center;color:#ff8f8f;font-size:17px}
.fl-error b{color:#ff9d9d}
.fl-btns{display:flex;gap:9px;width:100%}
.fl-btns .btn{flex:1}

.rec-strip{display:flex;align-items:center;gap:5px;overflow-x:auto;margin:0 -18px;padding:8px 18px}
.rec-step{flex:none;width:86px;text-align:center}
.rec-orb{display:flex;justify-content:center;margin-bottom:6px}
.rec-step b{display:block;font-size:10.5px;letter-spacing:.5px;color:var(--rc)}
.rec-step span{font-size:9px;color:var(--muted)}
.rec-arrow{flex:none;color:var(--muted-2);font-size:16px}

.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.ue-tile{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 4px 10px;border-radius:13px;background:rgba(9,19,44,.85);border:1px solid var(--stroke);font-size:10px;color:var(--muted);cursor:pointer;transition:.2s}
.ue-tile:hover{border-color:var(--stroke-2)}
.ue-tile svg{width:17px;height:17px;stroke:var(--electric-2);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.pal-list{padding:6px 14px}
.pal-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(84,150,255,.1)}
.pal-row:last-child{border-bottom:none}
.pal-dot{width:22px;height:22px;flex:none;border-radius:50%;box-shadow:0 0 10px rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.16)}
.pal-row code{font-size:10.5px;color:var(--muted);letter-spacing:.6px;font-family:ui-mon,Menlo,monospace}

/* ============================================================
   EARNING ANIMATION FX (board 3)
   ============================================================ */
.earn-fx{gap:11px}
.earn-top{display:flex;flex-direction:column;align-items:center;gap:11px;width:min(460px,88vw)}
.earn-stage{display:flex;align-items:center;gap:10px;font-size:13px;letter-spacing:3.4px;color:#ffe6a8;font-weight:600}
.earn-stage em{font-style:normal;font-size:10.5px;color:var(--muted);letter-spacing:1.4px}
.earn-n{width:25px;height:25px;flex:none;border-radius:50%;background:linear-gradient(135deg,#f5c86b,#b8860b);color:#2a1c02;font-weight:800;font-size:12.5px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(245,200,107,.55)}
.earn-rail{display:flex;gap:7px;justify-content:center}
.earn-rail i{width:27px;height:4px;border-radius:4px;background:rgba(255,255,255,.14);transition:.35s}
.earn-rail i.on{background:linear-gradient(90deg,#f5c86b,#ffe9a8);box-shadow:0 0 9px rgba(245,200,107,.75)}
.fail-fx .earn-rail i.on{background:var(--rc);box-shadow:0 0 9px var(--rc)}
.earn-orb{filter:drop-shadow(0 0 44px rgba(245,166,35,.35));animation:earnPop .9s cubic-bezier(.2,.8,.2,1)}
.earn-fx[data-s="3"] .earn-orb,.earn-fx[data-s="4"] .earn-orb,.earn-fx[data-s="5"] .earn-orb,.earn-fx[data-s="6"] .earn-orb{filter:drop-shadow(0 0 70px rgba(245,166,35,.65)) saturate(1.35)}
.earn-amount{opacity:0;transform:translateY(10px);transition:.55s cubic-bezier(.2,.8,.2,1);text-align:center}
.earn-amount.show{opacity:1;transform:none}
.earn-amount span{display:block;font-size:36px;font-weight:800;letter-spacing:-.5px;color:#ffd97a;text-shadow:0 0 30px rgba(245,200,107,.65)}
.earn-amount em{display:block;font-style:normal;font-size:11px;letter-spacing:7px;color:#f5c86b;margin-top:3px}
.earn-desc{font-size:12.5px;color:var(--muted);max-width:400px;text-align:center;line-height:1.65;min-height:40px;padding:0 16px}
.earn-chip{display:inline-flex;gap:8px;align-items:center;padding:8px 17px;border-radius:19px;font-size:11.5px;color:#ffe6a8;background:rgba(245,200,107,.1);border:1px solid rgba(245,200,107,.38);letter-spacing:.4px}
.earn-fx.quick .earn-desc{min-height:0}

.fail-fx{gap:13px}
.fail-head{display:flex;align-items:center;gap:11px;width:min(420px,88vw);font-size:14px;letter-spacing:2.6px;color:#ffd4d4}
.fail-head b{font-weight:700}
.fail-head em{font-style:normal;font-size:10.5px;color:var(--muted);letter-spacing:1.2px}
.fail-n{width:27px;height:27px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:800;color:#07101c;box-shadow:0 0 14px rgba(255,90,90,.4)}
.fail-orb{filter:drop-shadow(0 0 36px rgba(255,80,80,.4))}
.fail-desc{font-size:12.5px;color:var(--muted);letter-spacing:.6px}
.fail-card{display:none;gap:12px;align-items:center;flex-wrap:wrap;width:min(480px,92vw);padding:14px;border-radius:16px;border:1px solid rgba(255,107,107,.5);background:rgba(28,7,9,.82)}
.fail-card.show{display:flex;animation:msgIn .35s ease}
.fail-card b{color:#ff9d9d;font-size:13px}
.fail-warn{width:40px;height:40px;flex:none;border-radius:50%;background:rgba(255,107,107,.2);display:flex;align-items:center;justify-content:center;color:#ff8f8f;font-size:18px}
.fail-btns{display:flex;gap:9px;width:100%}
.fail-btns .btn{flex:1}

/* ============================================================
   EARN SCREEN SECTIONS (board 3)
   ============================================================ */
.es-timeline{display:flex;flex-direction:column;gap:9px}
.es-stage{display:flex;gap:11px;padding:12px 11px;border-radius:15px;background:var(--card);border:1px solid var(--stroke);transition:.2s}
.es-stage:hover{border-color:rgba(245,200,107,.35)}
.es-n{width:27px;height:27px;flex:none;border-radius:50%;background:linear-gradient(135deg,#f5c86b,#b8860b);color:#2a1c02;font-weight:800;font-size:12.5px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(245,200,107,.4)}
.es-body{flex:1;min-width:0}
.es-head{display:flex;justify-content:space-between;align-items:baseline;gap:9px}
.es-head b{font-size:11.5px;letter-spacing:1.8px;color:#ffe6a8}
.es-head em{font-style:normal;font-size:10px;color:var(--muted-2);flex:none}
.es-chip{display:inline-block;margin-top:7px;font-size:10px;padding:4px 11px;border-radius:13px;background:rgba(245,200,107,.1);border:1px solid rgba(245,200,107,.3);color:#f5c86b;letter-spacing:.3px}
.tier-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.tier-card{border-radius:17px;padding:14px 10px 12px;text-align:center;cursor:pointer;transition:.22s;overflow:hidden;border:1px solid color-mix(in srgb,var(--tc) 35%,var(--stroke));
  background:radial-gradient(210px 130px at 50% 0%,color-mix(in srgb,var(--tc) 22%,transparent),transparent 72%),linear-gradient(180deg,rgba(8,15,36,.95),rgba(4,8,20,.98))}
.tier-card:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--tc) 65%,transparent);box-shadow:0 14px 30px rgba(0,0,0,.5)}
.tier-name{font-size:11px;font-weight:700;letter-spacing:1.3px;color:var(--tc2)}
.tier-range{font-size:9.5px;color:var(--muted-2);margin-top:3px}
.tier-orb{display:flex;justify-content:center;margin:10px 0 8px;min-height:92px;align-items:center}
.tier-amt{font-size:15px;font-weight:800;color:#ffd97a;text-shadow:0 0 16px rgba(245,200,107,.4)}
.tier-amt em{display:block;font-style:normal;font-size:9px;letter-spacing:3.5px;color:var(--muted);margin-top:2px;text-shadow:none}
.tier-d{font-size:10px;color:var(--muted);margin-top:8px;line-height:1.55}
.tier-use{font-size:9.5px;color:var(--muted-2);margin-top:8px;padding-top:8px;border-top:1px solid rgba(84,150,255,.14);line-height:1.55}
.notif-card{border-color:rgba(79,227,155,.35)}
.notif-ic{width:42px;height:42px;flex:none;border-radius:13px;background:rgba(79,227,155,.14);border:1px solid rgba(79,227,155,.42);color:#4fe39b;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(79,227,155,.2)}
.notif-pt{display:flex;gap:10px;align-items:center;font-size:12.5px;color:var(--muted);padding:5px 0}

/* ============================================================
   WALLET (board 2)
   ============================================================ */
.wallet-act{display:flex;flex-direction:column;align-items:center;gap:7px;padding:13px 4px 11px;border-radius:15px;background:var(--card);border:1px solid var(--stroke);font-size:11.5px;color:var(--muted);cursor:pointer;transition:.2s}
.wallet-act:hover{border-color:var(--stroke-2);transform:translateY(-2px)}
.wallet-act span{width:32px;height:32px;border-radius:50%;background:rgba(47,134,255,.13);color:var(--electric-2);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 12px rgba(47,134,255,.2)}

/* ============================================================
   PREMIUM (board 2)
   ============================================================ */
.prem-hero{text-align:center;padding:24px 16px 18px;border-radius:22px;margin-bottom:16px;border:1px solid rgba(157,123,255,.38);
  background:radial-gradient(320px 180px at 50% 0%,rgba(109,77,255,.4),transparent 72%),linear-gradient(180deg,rgba(13,18,44,.95),rgba(5,9,24,.97))}
.prem-crown{width:54px;height:54px;margin:0 auto 11px;border-radius:50%;background:rgba(157,123,255,.16);border:1px solid rgba(157,123,255,.55);display:flex;align-items:center;justify-content:center;color:#c9b3ff;box-shadow:0 0 26px rgba(157,123,255,.45)}
.prem-crown svg{width:25px;height:25px}
.prem-hero h2{font-size:19px;letter-spacing:5.5px;font-weight:700}
.prem-hero p{font-size:11.5px;color:var(--muted);letter-spacing:2.4px;margin-top:4px}
.prem-orb{display:flex;justify-content:center;margin-top:14px}
.prem-list{display:flex;flex-direction:column;gap:9px}
.prem-item{display:flex;align-items:center;gap:12px;padding:14px 15px;border-radius:14px;background:var(--card);border:1px solid var(--stroke);font-size:13.5px;transition:.2s}
.prem-item .pk{width:21px;height:21px;flex:none;border-radius:50%;background:rgba(47,134,255,.14);color:var(--electric-2);font-size:11.5px;display:flex;align-items:center;justify-content:center;font-weight:700}
.prem-item.on{border-color:rgba(157,123,255,.5);background:rgba(109,77,255,.1)}
.prem-item.on .pk{background:rgba(52,211,153,.18);color:#34d399}
.prem-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding:16px;border-radius:17px;border:1px dashed var(--stroke-2);background:rgba(47,134,255,.05)}
.prem-foot b{font-size:13.5px;display:block}
.prem-foot span{font-size:12.5px;color:var(--muted)}

/* ============================================================
   RESPONSIVE (new components)
   ============================================================ */
@media (max-width:1179px){
  body.on-desk .desk{grid-template-columns:210px minmax(0,1fr)}
}
@media (max-width:860px){
  body.on-desk .desk{grid-template-columns:minmax(0,1fr)}
  body.on-desk .desk-side{display:none}
  .desk-content{padding:16px 16px 40px}
}
@media (max-width:520px){
  .ls-grid{gap:8px}
  .ls-tile{padding:18px 4px 11px}
  .fail-grid{gap:7px}
  .dhero{grid-template-columns:1fr;justify-items:center;gap:16px}
  .dhero-col.left,.dhero-col.right{align-items:center;text-align:center;flex-direction:row;flex-wrap:wrap;justify-content:center;gap:10px}
}

/* ============================================================
   AI ENGINE — answer bubbles, streaming, settings
   ============================================================ */
.msg.ai-msg{max-width:640px;padding:13px 15px 15px;border-color:rgba(47,134,255,.32);
  background:linear-gradient(180deg,rgba(11,24,56,.96),rgba(7,15,36,.96));
  box-shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(140,200,255,.12)}
.ai-top{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.ai-top .ai-ava{width:20px;height:20px;display:block;flex:none;line-height:0}
.ai-top b{font-size:11px;letter-spacing:2.2px;color:#cfe6ff}
.ai-badge{margin-left:auto;font-size:8.5px;letter-spacing:1.1px;padding:3.5px 8px;border-radius:20px;
  background:rgba(47,134,255,.14);border:1px solid rgba(120,190,255,.35);color:#8fd0ff}
.ai-badge.live{background:rgba(157,123,255,.16);border-color:rgba(157,123,255,.45);color:#c9b3ff}
.ai-title{font-size:15.5px;font-weight:700;color:#fff;line-height:1.35;margin-bottom:7px;
  text-shadow:0 0 22px rgba(79,168,255,.35)}
.ai-p{font-size:13.5px;line-height:1.75;color:#dbe7fb;margin:0 0 4px}
.ai-caret{display:inline-block;width:7px;height:14px;margin-left:2px;vertical-align:-2px;background:#4fa8ff;
  border-radius:1px;animation:blink .85s steps(2,start) infinite}
@keyframes blink{50%{opacity:0}}
.ai-h{font-size:10.5px;letter-spacing:1.6px;text-transform:uppercase;color:#7fc4ff;margin:14px 0 7px;font-weight:700}
.ai-ul,.ai-ol{margin:0 0 4px;padding-left:18px;font-size:13px;line-height:1.7;color:#cddcf5}
.ai-ul li,.ai-ol li{margin-bottom:6px}
.ai-ul li::marker{color:#4fa8ff}
.ai-ol li::marker{color:#4fa8ff;font-weight:700}
.ai-note{margin-top:10px;padding:10px 12px;border-radius:11px;font-size:12.5px;line-height:1.65;
  color:#ffe9b8;background:rgba(245,200,107,.09);border:1px solid rgba(245,200,107,.28)}
.ai-kv{display:flex;flex-direction:column;gap:5px;margin:4px 0 6px}
.ai-kv>div{display:flex;justify-content:space-between;gap:12px;padding:7px 10px;border-radius:9px;
  background:rgba(8,17,40,.75);border:1px solid var(--stroke);font-size:12px}
.ai-kv span{color:var(--muted)}
.ai-kv b{color:#eaf4ff;font-weight:600;text-align:right}
.ai-srcs{margin-top:13px;padding-top:11px;border-top:1px dashed rgba(120,190,255,.22)}
.ai-srcs .ai-h{margin-top:0}
.ai-srcs .src{margin-top:6px}
.ai-conf{display:flex;align-items:center;gap:9px;margin-top:11px;font-size:10px;letter-spacing:.9px;color:var(--muted)}
.ai-conf i{flex:1;height:5px;border-radius:4px;background:rgba(120,190,255,.16);overflow:hidden}
.ai-conf i b{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#2e86ff,#4fe39b)}
.ai-conf em{font-style:normal;color:#8fd0ff;font-weight:700}
.ai-fu{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;padding-top:11px;border-top:1px dashed rgba(120,190,255,.22)}
.ai-fu .tiny{width:100%}
.ai-fu .qp{cursor:pointer;transition:.18s}
.ai-fu .qp:hover{background:rgba(47,134,255,.22);color:#dff0ff}
.msg.ai-think{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted);width:fit-content}
.ai-pulse{width:11px;height:11px;border-radius:50%;background:#4fa8ff;box-shadow:0 0 0 0 rgba(79,168,255,.55);
  animation:pulse 1.15s ease-out infinite}
@keyframes pulse{70%{box-shadow:0 0 0 11px rgba(79,168,255,0)}100%{box-shadow:0 0 0 0 rgba(79,168,255,0)}}

/* AI engine settings */
.mode-cards{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.mode-card{position:relative;padding:15px 15px 16px;border-radius:16px;background:var(--card);
  border:1px solid var(--stroke);cursor:pointer;transition:.2s;text-align:left}
.mode-card b{display:block;font-size:14px;color:#eaf4ff;margin-bottom:6px}
.mode-card p{font-size:11.5px;line-height:1.65;color:var(--muted);margin:0 0 10px}
.mode-card .tag{display:inline-block;font-size:9px;letter-spacing:1.3px;padding:3px 8px;border-radius:20px;
  background:rgba(47,134,255,.13);border:1px solid var(--stroke);color:var(--muted-2)}
.mode-card:hover{border-color:var(--stroke-2);transform:translateY(-2px)}
.mode-card.on{border-color:rgba(120,190,255,.6);background:rgba(27,92,255,.12);
  box-shadow:0 10px 26px rgba(27,92,255,.22)}
.mode-card.on b{color:#fff}
.mode-card.on .tag{background:rgba(79,168,255,.24);border-color:rgba(120,190,255,.5);color:#bfe0ff}
.seg{display:flex;gap:6px;padding:4px;border-radius:12px;background:rgba(8,17,40,.85);border:1px solid var(--stroke)}
.seg button{flex:1;padding:9px 8px;border-radius:9px;border:1px solid transparent;background:transparent;
  color:var(--muted);font-size:11.5px;cursor:pointer;transition:.18s}
.seg button:hover{color:#fff}
.seg button.on{background:linear-gradient(90deg,rgba(27,92,255,.85),rgba(57,160,255,.6));color:#fff;
  border-color:rgba(120,190,255,.45)}
@media (max-width:520px){ .mode-cards{grid-template-columns:1fr} }

/* ============ ORB — LISTENING & THINKING STATES (board 7) ============ */
.orb-wave{position:absolute;left:20%;right:20%;top:50%;height:24%;transform:translateY(-50%);
  display:flex;align-items:center;justify-content:center;gap:3px;z-index:4;opacity:0;transition:opacity .35s;pointer-events:none}
.orb-wave i{width:2.5px;height:100%;border-radius:2px;background:linear-gradient(180deg,var(--oc2),var(--oc));
  transform:scaleY(.12);animation:waveBar 1.15s ease-in-out infinite;animation-delay:calc(var(--i) * .11s);
  box-shadow:0 0 6px color-mix(in srgb,var(--oc) 60%,transparent)}
@keyframes waveBar{0%,100%{transform:scaleY(.12)}50%{transform:scaleY(1)}}
.st-listening .orb-wave{opacity:1}
.st-listening .orb-glow{opacity:1;animation-duration:2.3s;
  background:radial-gradient(circle,rgba(31,157,255,.68),transparent 66%)}
.st-listening .orb-ring{border-color:#7fe9ff;box-shadow:0 0 22px rgba(31,157,255,.65),inset 0 0 18px rgba(31,157,255,.38)}
.st-listening .orb-orbit{animation-duration:12s}
.st-thinking .orb-glow{animation-duration:1.5s;
  background:radial-gradient(circle,rgba(124,92,255,.5),rgba(20,184,255,.28) 55%,transparent 70%)}
.st-thinking .orb-orbit{animation-duration:4.2s}
.st-thinking .orb-orbit.o2{animation-duration:6.5s}
.st-thinking .orb-pts i{animation:thinkSpark 1.9s ease-in-out infinite;animation-delay:calc(var(--i) * .24s)}
@keyframes thinkSpark{0%,100%{opacity:.35;transform:rotate(calc(var(--i) * 51.4deg)) translateY(calc(var(--os) * -.42)) scale(.7)}
  50%{opacity:1;transform:rotate(calc(var(--i) * 51.4deg)) translateY(calc(var(--os) * -.44)) scale(1.35)}}

/* ============ AGENT WORKSPACE — shared (boards 5–8) ============ */
.ag-tabs{display:flex;gap:6px;padding:4px;border-radius:13px;background:var(--card-2);border:1px solid var(--stroke);
  margin:0 0 14px;overflow-x:auto;scrollbar-width:none}
.ag-tabs::-webkit-scrollbar{display:none}
.ag-tab{flex:1;min-width:max-content;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;
  border-radius:10px;font-size:11.5px;font-weight:600;color:var(--muted);cursor:pointer;transition:.18s;border:none;background:none}
.ag-tab svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.8}
.ag-tab:hover{color:#fff}
.ag-tab.on{background:linear-gradient(90deg,rgba(27,92,255,.85),rgba(57,160,255,.55));color:#fff;
  box-shadow:0 3px 12px rgba(27,92,255,.35)}

/* --- mission control --- */
.mc-hero{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.mc-hero .mc-orb{width:54px;height:54px;flex:none;display:flex;align-items:center;justify-content:center}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.stat-card{position:relative;padding:12px 13px;border-radius:14px;background:var(--grad-card);border:1px solid var(--stroke);overflow:hidden}
.stat-card .sc-label{font-size:9.5px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted-2)}
.stat-card .sc-num{font-size:22px;font-weight:700;color:#eaf4ff;margin-top:4px;line-height:1.1}
.stat-card .sc-sub{font-size:10px;color:var(--muted);margin-top:3px}
.stat-card .sc-sub.up{color:#4fe39b}.stat-card .sc-sub.warn{color:var(--gold)}
.stat-card .sc-spark{position:absolute;right:8px;bottom:8px;opacity:.7}
.life-graph{display:flex;align-items:center;gap:0;padding:14px 4px 6px;overflow-x:auto;scrollbar-width:none}
.life-graph::-webkit-scrollbar{display:none}
.lg-node{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:76px}
.lg-node .lg-ic{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  background:rgba(47,134,255,.1);border:1px solid rgba(120,190,255,.3);color:var(--electric-2);position:relative}
.lg-node .lg-ic svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.7}
.lg-node.on .lg-ic{border-color:rgba(120,190,255,.8);box-shadow:0 0 14px rgba(47,134,255,.4)}
.lg-node .lg-nm{font-size:9.5px;color:var(--muted);letter-spacing:.4px;white-space:nowrap}
.lg-node.on .lg-nm{color:#dceaff}
.lg-link{flex:1;min-width:22px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(79,168,255,.15),rgba(79,168,255,.55),rgba(79,168,255,.15));
  background-size:200% 100%;animation:lgFlow 1.8s linear infinite;margin:0 -6px;margin-bottom:16px}
@keyframes lgFlow{0%{background-position:100% 0}100%{background-position:-100% 0}}
.run-row{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:13px;background:var(--card-2);
  border:1px solid var(--stroke);margin-bottom:8px;cursor:pointer;transition:.18s}
.run-row:hover{border-color:var(--stroke-2);transform:translateX(2px)}
.run-row .rr-ava{width:36px;height:36px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:17px;
  background:rgba(47,134,255,.09);border:1px solid var(--stroke)}
.run-row .rr-task{font-size:12.5px;font-weight:600;color:#e6f0ff}
.run-row .rr-meta{font-size:10px;color:var(--muted);margin-top:2px;display:flex;gap:7px;align-items:center}
.run-row .rr-right{margin-left:auto;text-align:right;flex:none}
.pill.run{background:rgba(47,134,255,.13);color:var(--electric-2);border:1px solid rgba(47,134,255,.32)}
.pill.queued{background:rgba(245,200,107,.1);color:var(--gold);border:1px solid rgba(245,200,107,.28)}
.appr-row{display:flex;align-items:center;gap:11px;padding:12px;border-radius:13px;background:var(--card-2);
  border:1px solid var(--stroke);margin-bottom:8px}
.appr-row .ap-act{font-size:12.5px;font-weight:600;color:#e6f0ff}
.appr-row .ap-meta{font-size:10px;color:var(--muted);margin-top:2px}
.risk{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:20px}
.risk.high{background:rgba(255,107,107,.13);color:#ff8585;border:1px solid rgba(255,107,107,.35)}
.risk.medium{background:rgba(245,200,107,.12);color:var(--gold);border:1px solid rgba(245,200,107,.3)}
.risk.low{background:rgba(46,191,113,.12);color:#4fe39b;border:1px solid rgba(46,191,113,.3)}
.fleet-row{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:13px;background:var(--card-2);
  border:1px solid var(--stroke);margin-bottom:8px}
.fleet-row .fl-avas{display:flex;gap:-4px;font-size:14px}
.fleet-row .fl-avas span{margin-right:-6px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))}
.fleet-row .bar{flex:1;max-width:130px}

/* --- marketplace --- */
.agent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:11px}
.agent-card{position:relative;display:flex;flex-direction:column;padding:13px;border-radius:16px;background:var(--grad-card);
  border:1px solid var(--stroke);cursor:pointer;transition:.2s;overflow:hidden}
.agent-card:hover{transform:translateY(-3px);border-color:var(--stroke-2)}
.agent-card .ac-tag{position:absolute;top:9px;right:9px;font-size:8.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
  padding:3px 8px;border-radius:20px;background:rgba(245,200,107,.14);color:var(--gold);border:1px solid rgba(245,200,107,.35)}
.agent-card .ac-ava{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:9px;
  background:rgba(47,134,255,.09);border:1px solid var(--stroke)}
.agent-card .ac-name{font-size:13px;font-weight:700;color:#eaf4ff}
.agent-card .ac-cat{font-size:9.5px;color:var(--muted-2);letter-spacing:.6px;text-transform:uppercase;margin-top:1px}
.agent-card .ac-desc{font-size:10.5px;color:var(--muted);line-height:1.55;margin-top:6px;display:-webkit-box;
  -webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1}
.agent-card .ac-foot{display:flex;align-items:center;justify-content:space-between;margin-top:10px}
.agent-card .ac-price{font-size:12.5px;font-weight:700;color:var(--electric-2)}
.agent-card .ac-price i{font-style:normal;font-size:9px;color:var(--muted);font-weight:500}
.agent-card .ac-rate{font-size:10px;color:var(--gold);display:flex;align-items:center;gap:3px}
.agent-card .ac-rate svg{width:11px;height:11px;fill:var(--gold);stroke:none}
.agent-card.hired{border-color:rgba(79,227,155,.5)}

/* --- workflow builder --- */
.wf-wrap{display:grid;grid-template-columns:150px 1fr 200px;gap:11px;height:min(560px,64vh);margin-bottom:12px}
.wf-pal{border-radius:15px;background:var(--card);border:1px solid var(--stroke);padding:11px;overflow-y:auto;scrollbar-width:thin}
.wf-pal .wf-pal-label{font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted-2);margin:10px 0 7px}
.wf-pal-item{display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:10px;background:var(--card-2);
  border:1px solid var(--stroke);margin-bottom:6px;font-size:11px;font-weight:600;color:#d7e6ff;cursor:pointer;transition:.16s}
.wf-pal-item:hover{border-color:rgba(120,190,255,.55);transform:translateX(2px)}
.wf-pal-item .wfp-ic{width:24px;height:24px;flex:none;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;
  background:rgba(47,134,255,.12);border:1px solid var(--stroke)}
.wf-stage{position:relative;border-radius:15px;background:var(--card);border:1px solid var(--stroke);overflow:hidden}
.wf-toolbar{display:flex;align-items:center;gap:7px;padding:9px 11px;border-bottom:1px solid var(--stroke)}
.wf-toolbar .wf-title{font-size:12px;font-weight:700;color:#e6f0ff;flex:1;display:flex;align-items:center;gap:7px}
.wf-canvas{position:absolute;inset:44px 0 0 0;overflow:hidden;
  background-image:radial-gradient(rgba(120,160,230,.13) 1px,transparent 1.4px);background-size:22px 22px}
.wf-edges{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.wf-edges path{fill:none;stroke:rgba(79,168,255,.5);stroke-width:2}
.wf-edges path.live{stroke:#4fa8ff;stroke-dasharray:6 7;animation:edgeFlow 1s linear infinite;filter:drop-shadow(0 0 5px rgba(79,168,255,.7))}
@keyframes edgeFlow{to{stroke-dashoffset:-13}}
.wf-node{position:absolute;width:138px;border-radius:12px;background:linear-gradient(180deg,rgba(18,30,58,.96),rgba(10,18,40,.96));
  border:1px solid rgba(120,160,230,.3);z-index:2;cursor:grab;user-select:none;transition:box-shadow .2s,border-color .2s}
.wf-node:active{cursor:grabbing}
.wf-node .n-head{display:flex;align-items:center;gap:6px;padding:7px 9px;border-bottom:1px solid rgba(120,160,230,.18);
  font-size:10.5px;font-weight:700;color:#dceaff;letter-spacing:.3px}
.wf-node .n-head .n-ic{width:18px;height:18px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;
  background:rgba(47,134,255,.16);flex:none}
.wf-node .n-body{padding:7px 9px 8px;font-size:9.5px;color:var(--muted);line-height:1.5;min-height:26px}
.wf-node .n-body b{color:#bcd4ff;font-weight:600}
.wf-node.selected{border-color:#4fa8ff;box-shadow:0 0 0 1.5px rgba(79,168,255,.4),0 0 22px rgba(47,134,255,.35)}
.wf-node.running{border-color:#f5a623;box-shadow:0 0 18px rgba(245,166,35,.45);animation:nPulse 1s ease-in-out infinite}
.wf-node.done{border-color:rgba(52,211,153,.6)}
@keyframes nPulse{0%,100%{box-shadow:0 0 10px rgba(245,166,35,.3)}50%{box-shadow:0 0 22px rgba(245,166,35,.6)}}
.wf-node .n-port{position:absolute;width:9px;height:9px;border-radius:50%;background:#4fa8ff;border:2px solid #0a1228;
  box-shadow:0 0 7px rgba(79,168,255,.8);top:50%;margin-top:-4.5px}
.wf-node .n-port.in{left:-5px}.wf-node .n-port.out{right:-5px}
.wf-insp{border-radius:15px;background:var(--card);border:1px solid var(--stroke);padding:12px;overflow-y:auto;scrollbar-width:thin}
.wf-insp .wi-tabs{display:flex;gap:4px;margin-bottom:11px;border-bottom:1px solid var(--stroke)}
.wf-insp .wi-tab{flex:1;padding:7px 4px;font-size:10.5px;font-weight:600;color:var(--muted);cursor:pointer;text-align:center;
  border:none;background:none;border-bottom:2px solid transparent;transition:.16s}
.wf-insp .wi-tab.on{color:var(--electric-2);border-bottom-color:var(--electric-2)}
.wf-insp .wi-row{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;padding:6px 0;border-bottom:1px dashed rgba(120,160,230,.14)}
.wf-insp .wi-row b{color:#cfe0ff;font-weight:600;text-align:right}
.wf-insp .wi-row span{color:var(--muted)}
.wf-log{position:absolute;left:11px;right:11px;bottom:10px;border-radius:11px;background:rgba(5,10,24,.92);border:1px solid rgba(120,160,230,.25);
  padding:8px 11px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px;color:#8fb6e8;line-height:1.7;
  max-height:96px;overflow-y:auto;z-index:5;scrollbar-width:thin}
.wf-log .ok{color:#4fe39b}.wf-log .run{color:var(--gold)}
@media (max-width:760px){
  .wf-wrap{grid-template-columns:1fr;height:auto}
  .wf-pal{display:flex;gap:6px;overflow-x:auto;padding:9px}
  .wf-pal .wf-pal-label{display:none}
  .wf-pal-item{flex:none;margin-bottom:0}
  .wf-stage{height:420px}
  .wf-insp{max-height:260px}
}

/* --- integrations --- */
.integ-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(235px,1fr));gap:11px}
.integ-card{display:flex;flex-direction:column;padding:13px;border-radius:16px;background:var(--grad-card);
  border:1px solid var(--stroke);transition:.2s}
.integ-card:hover{border-color:var(--stroke-2)}
.integ-card .ig-head{display:flex;align-items:center;gap:9px;margin-bottom:4px}
.integ-card .ig-ic{width:34px;height:34px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;
  background:color-mix(in srgb,var(--igc,#4fa8ff) 14%,transparent);border:1px solid color-mix(in srgb,var(--igc,#4fa8ff) 32%,transparent);color:var(--igc,#4fa8ff)}
.integ-card .ig-ic svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8}
.integ-card .ig-name{font-size:12.5px;font-weight:700;color:#eaf4ff}
.integ-card .ig-status{font-size:9.5px;letter-spacing:.4px;display:flex;align-items:center;gap:4px}
.integ-card .ig-status.no{color:var(--muted)}
.integ-card .ig-status.ok{color:#4fe39b}
.integ-card .ig-hint{font-size:10px;color:var(--muted);line-height:1.55;margin:7px 0 9px}
.integ-card .ig-hint a{color:var(--electric-2);text-decoration:none}
.integ-card .ig-fields{display:flex;flex-direction:column;gap:7px;margin-bottom:10px}
.integ-card .ig-f{position:relative}
.integ-card .ig-f input{width:100%;padding:9px 11px;border-radius:10px;background:var(--card-2);border:1px solid var(--stroke);
  color:#dfeaff;font-size:10.5px;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3px}
.integ-card .ig-f input:focus{outline:none;border-color:rgba(120,190,255,.55)}
.integ-card .ig-f input::placeholder{color:var(--muted-2);font-family:inherit}
.integ-card .ig-actions{display:flex;gap:7px;margin-top:auto}
.integ-card .ig-result{font-size:10px;line-height:1.55;margin-top:8px;padding:7px 9px;border-radius:9px;display:none}
.integ-card .ig-result.show{display:block}
.integ-card .ig-result.ok{background:rgba(46,191,113,.1);border:1px solid rgba(46,191,113,.3);color:#7df0bb}
.integ-card .ig-result.err{background:rgba(255,107,107,.09);border:1px solid rgba(255,107,107,.3);color:#ff9c9c}
.integ-card .ig-result.busy{background:rgba(47,134,255,.09);border:1px solid rgba(47,134,255,.3);color:var(--electric-2)}
@media (max-width:560px){ .stat-grid{grid-template-columns:repeat(2,1fr)} }

```

### `js/core.js`

<!-- Core: namespace, utils, persisted state, i18n, theme, toast, sheet | 5655 bytes -->

```js
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

```

### `js/data.js`

<!-- Data catalog: all content, agents, listings, i18n, evolutions | 33696 bytes -->

```js
/* SAGE ONE — Data decoded from the design board */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  /* ===== The 13 Evolutions (material accents from board) ===== */
  S.DATA = {};
  S.DATA.EVOLUTIONS = [
    { n:1,  name:'Bronze',              title:'Initiate',        desc:'Build the Foundation',      accent:'#c98a4b', glow:'#e0a56b', soft:'rgba(201,138,75,.16)', material:'Bronze/Copper',     icon:'i-bronze' },
    { n:2,  name:'Silver',              title:'Seeker',          desc:'Sharpen the Skill',         accent:'#c7d3e6', glow:'#eaf2ff', soft:'rgba(199,211,230,.16)', material:'Silver/White',       icon:'i-silver' },
    { n:3,  name:'Gold',                title:'Adept',           desc:'Proof of Craft',            accent:'#f2c14e', glow:'#ffd97a', soft:'rgba(242,193,78,.16)',  material:'Gold',               icon:'i-gold' },
    { n:4,  name:'Platinum',            title:'Professional',    desc:'Trusted Expert',            accent:'#9fd8e8', glow:'#cfeffa', soft:'rgba(159,216,232,.16)', material:'Platinum/Iridescent',icon:'i-plat' },
    { n:5,  name:'Jade',                title:'Vanguard',        desc:'Lead the Field',            accent:'#2fbf71', glow:'#5fe3a0', soft:'rgba(47,191,113,.16)',  material:'Jade Green',         icon:'i-jade' },
    { n:6,  name:'Ruby',                title:'Virtuoso',        desc:'Mastery Displayed',         accent:'#e0335c', glow:'#ff6f91', soft:'rgba(224,51,92,.16)',   material:'Ruby Red',           icon:'i-ruby' },
    { n:7,  name:'Sapphire',            title:'Luminary',        desc:'Guide Others',              accent:'#2e7bff', glow:'#6fb6ff', soft:'rgba(46,123,255,.16)',  material:'Sapphire Blue',      icon:'i-sapph' },
    { n:8,  name:'Emerald',             title:'Paragon',         desc:'Standard of Excellence',    accent:'#00c48c', glow:'#4ce7be', soft:'rgba(0,196,140,.16)',   material:'Emerald Green',      icon:'i-emer' },
    { n:9,  name:'Diamond Sovereign',   title:'Sovereign',       desc:'Rule Your Domain',          accent:'#e9f4ff', glow:'#ffffff', soft:'rgba(233,244,255,.18)', material:'Diamond/White',      icon:'i-dia' },
    { n:10, name:'Black Opal Realm',    title:'Opal Warden',     desc:'Beyond the Veil',           accent:'#8fa6c8', glow:'#b7d2f5', soft:'rgba(143,166,200,.18)', material:'Opalescent',         icon:'i-opal' },
    { n:11, name:'Painite Core',        title:'Painite Core',    desc:'Rare Power Awakened',       accent:'#ff6b3d', glow:'#ffa46b', soft:'rgba(255,107,61,.16)',  material:'Rare Red/Orange',    icon:'i-pain' },
    { n:12, name:'Void Matter',         title:'Void Walker',     desc:'Master of the Unknown',     accent:'#7b3fe4', glow:'#a97bff', soft:'rgba(123,63,228,.18)',  material:'Cosmic/Void',        icon:'i-void' },
    { n:13, name:'Californium Overlord',title:'Overlord',        desc:'The Apex of SAGE',          accent:'#ffd76a', glow:'#fff0b8', soft:'rgba(255,215,106,.18)', material:'Ultra-rare/Cosmic',  icon:'i-cal' }
  ];

  /* ===== i18n (नेपाली / English) ===== */
  S.DATA.I18N = {
    'onb.welcome':   { en:'Welcome to SAGE ONE', ne:'साज ONE मा स्वागत छ' },
    'onb.mentor':    { en:'Your AI assistant, Job Finder, Research Partner, and more — all in one app.', ne:'तपाईंको AI सहयोगी, जागिर खोज्ने, अनुसन्धान साथी — सबै एउटै एपमा।' },
    'onb.getstarted':{ en:'Get Started', ne:'सुरु गर्नुहोस्' },
    'onb.haveacc':   { en:'I already have an account', ne:'मेरो पहिले नै खाता छ' },
    'onb.chooseLang':{ en:'Choose Your Language', ne:'आफ्नो भाषा छान्नुहोस्' },
    'onb.continue':  { en:'Continue', ne:'अगाडि बढ्नुहोस्' },
    'nav.home':      { en:'Home', ne:'गृह' },
    'nav.apps':      { en:'Apps', ne:'एप्स' },
    'nav.activity':  { en:'Activity', ne:'गतिविधि' },
    'nav.profile':   { en:'Profile', ne:'प्रोफाइल' },
    'nav.sage':      { en:'SAGE', ne:'साज' },
    'home.stage':    { en:'Stage', ne:'चरण' },
    'home.evolution':{ en:'Evolution', ne:'विकास' },
    'home.apps':     { en:'SAGE Apps', ne:'साज एप्स' },
    'home.allapps':  { en:'All Apps', ne:'सबै एप्स' },
    'home.quick':    { en:'Quick Actions', ne:'छिटो कार्यहरू' },
    'chat.placeholder':{ en:'Type a message…', ne:'सन्देश लेख्नुहोस्…' },
    'chat.online':   { en:'Online', ne:'अनलाइन' }
  };

  /* ===== The Flow (Learn → … → Evolution) ===== */
  S.DATA.FLOW = [
    { k:'Learn', ic:'i-learn' }, { k:'Practice', ic:'i-practice' }, { k:'Evidence', ic:'i-evidence' },
    { k:'Skill', ic:'i-skill' }, { k:'Opportunity', ic:'i-opp' }, { k:'Work Earn', ic:'i-work' },
    { k:'Lifetime\nAchievement', ic:'i-award' }, { k:'Evolution', ic:'i-evo' }
  ];

  /* ===== Key Rules (verbatim from board) ===== */
  S.DATA.RULES = [
    'Evolution is <b>lifetime achievement</b> (withdrawal does not reduce it).',
    'Spark is <b>separate</b> from Evolution (it\'s the platform economy).',
    'Money supports the journey, but <b>skill &amp; achievement define Evolution</b>.',
    'The UI stays the same — <b>only visual layers evolve</b>.',
    'The SAGE <b>blue + black identity never disappears</b>.'
  ];

  /* ===== Core Concept: two progression paths ===== */
  S.DATA.CORE = {
    skill: ['Knowledge', 'Skills', 'Performance', 'Capability', 'Completed Achievements', 'Demonstrated Progress'],
    money: ['Earning', 'Economic Achievement', 'System Capability', 'Access to Higher-Level Functions']
  };

  /* ===== 9-Step Transition (Bronze High → Silver Low) ===== */
  S.DATA.TRANSITION = [
    'Particles accelerate', 'Energy concentrates', 'Screen darkens', 'Shockwave / burst',
    'Old material breaks', 'New material forms', 'New particles appear', 'New rank crystallizes', 'Interface settles'
  ];

  /* ===== Design Principles (board) ===== */
  S.DATA.PRINCIPLES = [
    'Keep the original artwork composition.', 'Maintain the SAGE blue and black identity.',
    'Use cosmic/mountain-inspired atmosphere.', 'Show Clear Low / Mid / High variations.',
    'Use particle/glow effects.', 'Keep UI clean and readable.',
    'No color takeover — only accent layers.', 'Maintain the Spiritual + futuristic balance.'
  ];

  /* ===== SAGE Identity colors (permanent) ===== */
  S.DATA.IDENTITY = [
    { n:'Black', c:'#03060f' }, { n:'Deep Blue', c:'#081229' }, { n:'Electric Blue', c:'#2e86ff' },
    { n:'White', c:'#eaf2ff' }, { n:'Subtle Gold', c:'#f5c86b' }
  ];

  /* ===== Fees (board section 14) ===== */
  S.DATA.FEES = {
    market: [
      { label:'Under NPR 10,000', pct:8 },
      { label:'Under NPR 50,000', pct:6 },
      { label:'Under NPR 100,000', pct:5 },
      { label:'Under NPR 500,000', pct:3 },
      { label:'Under NPR 1,000,000', pct:2 },
      { label:'Above NPR 1,000,000', pct:1 }
    ],
    tx: [
      { label:'Under 100,000', pct:1 },
      { label:'Under 1,000,000', pct:0.9 },
      { label:'Under 10,000,000 (Sale Withdraw)', pct:0.7 },
      { label:'Under 100,000,000 (Sale Withdraw)', pct:0.5 },
      { label:'Above 100,000,000', pct:0.3 }
    ]
  };
  S.marketFeePct = function (amount) {
    const t = S.DATA.FEES.market;
    if (amount < 10000) return t[0].pct;
    if (amount < 50000) return t[1].pct;
    if (amount < 100000) return t[2].pct;
    if (amount < 500000) return t[3].pct;
    if (amount < 1000000) return t[4].pct;
    return t[5].pct;
  };
  S.txFeePct = function (amount) {
    if (amount < 100000) return 1;
    if (amount < 1000000) return 0.9;
    if (amount < 10000000) return 0.7;
    if (amount < 100000000) return 0.5;
    return 0.3;
  };

  /* ===== Payment methods (Nepal Phase 1) ===== */
  S.DATA.PAYMENTS = [
    { id:'esewa',   name:'eSewa',    sub:'Digital Wallet',    c:'#60bb46', short:'eSewa' },
    { id:'khalti',  name:'Khalti',   sub:'Digital Wallet',    c:'#5c2d91', short:'Khalti' },
    { id:'fonepay', name:'FonePay',  sub:'Recommended',       c:'#e2231a', short:'FONE' },
    { id:'bank',    name:'Bank Transfer', sub:'Direct banking', c:'#1b5cff', short:'BANK' }
  ];

  /* ===== Marketplace listings ===== */
  S.DATA.LISTINGS = [
    { id:'l1', title:'Honda Dio Scooter', price:180000, cat:'vehicles',   loc:'Kathmandu', when:'2 days ago', ph:'ph-veh',  emoji:'🛵', desc:'2022 model, single owner, all documents clear. New tyres, serviced last month.' },
    { id:'l2', title:'iPhone 14',         price:65000,  cat:'electronics',loc:'Kathmandu', when:'2 days ago', ph:'ph-elec', emoji:'📱', desc:'128GB, Midnight, battery health 91%. Box and bill available.' },
    { id:'l3', title:'House (For Sale)',  price:8500000,cat:'property',   loc:'Pokhara',   when:'3 days ago', ph:'ph-prop', emoji:'🏠', desc:'2.5 aana plot, 3BHK, lake view, RCC structure, road access 16ft.' },
    { id:'l4', title:'Land (For Sale)',   price:4500000,cat:'property',   loc:'Chitwan',   when:'1 day ago',  ph:'ph-land', emoji:'🌳', desc:'8 aana south-facing land, fertile, near highway, great for farmhouse.' },
    { id:'l5', title:'MacBook Air M2',    price:145000, cat:'electronics',loc:'Lalitpur',  when:'5 hours ago',ph:'ph-elec', emoji:'💻', desc:'8GB/256GB, space grey, 112 charge cycles, AppleCare till 2025.' },
    { id:'l6', title:'Royal Enfield Classic 350', price:310000, cat:'vehicles', loc:'Pokhara', when:'4 days ago', ph:'ph-veh', emoji:'🏍️', desc:'2021 gunmetal grey, 12,000 km, first owner, recently serviced.' }
  ];
  S.DATA.CATS = [
    { id:'all',   name:'All',      ic:'i-grid' },
    { id:'vehicles', name:'Vehicles', ic:'i-car' },
    { id:'electronics', name:'Electronics', ic:'i-phone' },
    { id:'property', name:'Property', ic:'i-home' },
    { id:'services', name:'Services', ic:'i-brief' }
  ];

  /* ===== Jobs ===== */
  S.DATA.JOBS = [
    { id:'j1', title:'Frontend Developer', company:'TechNova', pay:'NPR 25K–40K', loc:'Kathmandu', type:'Full-time', logo:'TN', c:'#1b5cff', tags:['React','Remote-friendly'] },
    { id:'j2', title:'Graphic Designer', company:'PixelKathmandu', pay:'NPR 20K–35K', loc:'Lalitpur', type:'Part-time', logo:'PK', c:'#8b3fe4', tags:['Figma','Branding'] },
    { id:'j3', title:'IT Support Specialist', company:'HimalTech', pay:'NPR 15K–25K', loc:'Pokhara', type:'Full-time', logo:'HT', c:'#00a86b', tags:['Hardware','Windows'] },
    { id:'j4', title:'Flutter Developer', company:'Sage Labs', pay:'NPR 30K–50K', loc:'Remote', type:'Full-time', logo:'SL', c:'#e0335c', tags:['Flutter','Dart'] }
  ];

  /* ===== Learning ===== */
  S.DATA.COURSES = [
    { id:'c1', title:'Complete Flutter Development', meta:'12 modules · Beginner', prog:40, emoji:'📱', g:'linear-gradient(135deg,#1b5cff,#0b2f7a)' },
    { id:'c2', title:'Digital Marketing', meta:'8 modules · Intermediate', prog:0, emoji:'📈', g:'linear-gradient(135deg,#8b3fe4,#2a1060)' },
    { id:'c3', title:'English for Professionals', meta:'10 modules · All levels', prog:15, emoji:'🗣️', g:'linear-gradient(135deg,#00a86b,#073a28)' },
    { id:'c4', title:'UI/UX Design Fundamentals', meta:'6 modules · Beginner', prog:0, emoji:'🎨', g:'linear-gradient(135deg,#e0335c,#4a0a1e)' }
  ];

  /* ===== Community ===== */
  S.DATA.GROUPS = [
    { id:'g1', name:'Tech Nepal', meta:'12.5K members · 2 new posts', emoji:'💻', c:'linear-gradient(135deg,#1b5cff,#0b2f7a)' },
    { id:'g2', name:'Freelancers Hub', meta:'8.2K members · 3 new posts', emoji:'🤝', c:'linear-gradient(135deg,#8b3fe4,#2a1060)' },
    { id:'g3', name:'Study & Career', meta:'5.6K members · 1 new post', emoji:'📚', c:'linear-gradient(135deg,#00a86b,#073a28)' },
    { id:'g4', name:'Nepal Startup', meta:'4.3K members · 5 new posts', emoji:'🚀', c:'linear-gradient(135deg,#e0335c,#4a0a1e)' }
  ];

  /* ===== Files ===== */
  S.DATA.FILES = [
    { id:'f1', name:'Resume.pdf', size:'2.4 MB', kind:'pdf', when:'2 days ago' },
    { id:'f2', name:'Project_Proposal.docx', size:'1.2 MB', kind:'doc', when:'1 day ago' },
    { id:'f3', name:'Images', size:'128 items', kind:'img', when:'Today' },
    { id:'f4', name:'Videos', size:'12 items', kind:'vid', when:'Yesterday' }
  ];

  /* ===== AI Studio tools ===== */
  S.DATA.TOOLS = [
    { id:'image', name:'Image Generation', sub:'5 Spark', ic:'i-image', g:'linear-gradient(135deg,#1b5cff,#0b2f7a)', live:true },
    { id:'video', name:'Video Generation', sub:'Dynamic (length, density, complexity)', ic:'i-video', g:'linear-gradient(135deg,#8b3fe4,#2a1060)', live:true },
    { id:'code',  name:'Code Generation', sub:'Coming soon', ic:'i-code', g:'linear-gradient(135deg,#00a86b,#073a28)', live:false }
  ];

  /* ===== Spark usage (board) ===== */
  S.DATA.SPARK_USAGE = [
    { k:'Image Generation', v:'5 Spark' },
    { k:'Video Generation', v:'Dynamic (length, density, complexity)' },
    { k:'Marketplace Fees', v:'8% → 1% (based on volume)' },
    { k:'Transaction Fee', v:'≈ 0.3% (based on volume)' }
  ];

  /* ===== SAGE LOGO STATES & ANIMATIONS (9 states, board 2) ===== */
  S.DATA.LOGO_STATES = [
    { id:'idle',      name:'IDLE',      sub:'Calm & Ready',          c:'#4fa8ff', c2:'#8fd4ff' },
    { id:'searching', name:'SEARCHING', sub:'Collecting Sources',    c:'#00b4ff', c2:'#6fd2ff' },
    { id:'analyzing', name:'ANALYZING', sub:'Processing Info',       c:'#a855f7', c2:'#d0a6ff' },
    { id:'verifying', name:'VERIFYING', sub:'Checking Accuracy',     c:'#22d3ee', c2:'#8ef0ff' },
    { id:'success',   name:'SUCCESS',   sub:'Task Completed',        c:'#34d399', c2:'#8ff5c8' },
    { id:'failure',   name:'FAILURE',   sub:'Research Failed',       c:'#ff6b6b', c2:'#ff9f6b' },
    { id:'recovery',  name:'RECOVERY',  sub:'Rebuilding Systems',    c:'#d0b3ff', c2:'#70d3fc' },
    { id:'earning',   name:'EARNING',   sub:'Money Earned',          c:'#f5a623', c2:'#ffd97a' },    { id:'premium',   name:'PREMIUM',   sub:'Unlocking Features',     c:'#9d7bff', c2:'#c9b3ff' },
    { id:'listening', name:'LISTENING', sub:'Awaiting Your Words',    c:'#1f9dff', c2:'#7fe9ff' },
    { id:'thinking',  name:'THINKING',  sub:'Reasoning In Depth',     c:'#14b8ff', c2:'#a06bff' }
  ];

  /* ===== AGENT WORKSPACE (boards 5-8: mission control, marketplace, workflow, integrations) ===== */
  S.DATA.AGENTS = [
    { id:'aris',  name:'Arc Research',    cat:'Research',    emoji:'🔮', c:'#2f86ff', tag:'Popular',
      desc:'Web-scale research with cited sources and structured briefs.', price:0.004, rating:4.9, runs:'18.2k', tags:['Deep search','Citations'] },
    { id:'lex',   name:'LegalEase',       cat:'Legal',       emoji:'⚖️', c:'#9d7bff', tag:'Verified',
      desc:'Contract review, clause extraction and plain-language summaries.', price:0.012, rating:4.8, runs:'9.4k', tags:['Contracts','NDA review'] },
    { id:'neuro', name:'NeuroMind',       cat:'Analytics',   emoji:'🧠', c:'#22d3ee', tag:'',
      desc:'Turns raw data into dashboards, forecasts and clear decisions.', price:0.018, rating:4.7, runs:'12.1k', tags:['Forecasting','BI'] },
    { id:'forge', name:'CodeForge',       cat:'Development', emoji:'⚒️', c:'#f5a623', tag:'Verified',
      desc:'Writes, reviews and refactors code across 40+ languages.', price:0.02, rating:4.9, runs:'27.6k', tags:['Code review','Refactor'] },
    { id:'urban', name:'UrbanCraft',      cat:'Automation',  emoji:'🏙️', c:'#34d399', tag:'',
      desc:'Automates busywork: filing, syncing, scheduling, chasing.', price:0.008, rating:4.6, runs:'7.9k', tags:['RPA','Sync'] },
    { id:'shield',name:'SecureScan',      cat:'Security',    emoji:'🛡️', c:'#ff6b6b', tag:'Popular',
      desc:'Vulnerability scanning, leak checks and hardening plans.', price:0.014, rating:4.8, runs:'11.3k', tags:['Pentest','OSINT'] },
    { id:'data',  name:'DataStream',      cat:'Analytics',   emoji:'📊', c:'#4fa8ff', tag:'',
      desc:'Live data pipelines, cleaning and automated reporting.', price:0.011, rating:4.5, runs:'6.2k', tags:['ETL','Reports'] },
    { id:'fin',   name:'Finlight',        cat:'Finance',     emoji:'📈', c:'#ffd97a', tag:'Verified',
      desc:'Market briefs, portfolio notes and risk alerts in real time.', price:0.016, rating:4.7, runs:'14.8k', tags:['Markets','Risk'] },
    { id:'harmony',name:'HarmonyArts',    cat:'Writing',     emoji:'🖌️', c:'#ff9f6b', tag:'',
      desc:'Brand-safe copy, long-form articles and tone matching.', price:0.006, rating:4.6, runs:'21.0k', tags:['Copywriting','SEO'] },
    { id:'flow',  name:'FlowOps',         cat:'Automation',  emoji:'🔁', c:'#22d3ee', tag:'',
      desc:'Cross-app orchestration with retries, guards and audit logs.', price:0.009, rating:4.7, runs:'8.7k', tags:['Orchestration','Retries'] },
    { id:'pulse', name:'NewsSignal',       cat:'Support',    emoji:'🎧', c:'#8ff5c8', tag:'Popular',
      desc:'Watches your feeds, triages tickets and drafts replies.', price:0.005, rating:4.5, runs:'16.4k', tags:['Triage','Replies'] },
    { id:'poly',  name:'Polyglot',        cat:'Language',    emoji:'🌐', c:'#c9b3ff', tag:'',
      desc:'Nuanced translation across 90+ languages, idiom aware.', price:0.007, rating:4.8, runs:'19.9k', tags:['Translate','Locate'] }
  ];
  S.DATA.AGENT_CATS = ['All','Research','Development','Analytics','Writing','Support','Sales','Legal','Automation','Finance','Healthcare','Language','Security'];

  S.DATA.AGENT_RUNS = [
    { id:'run-3841', agent:'Arc Research',  emoji:'🔮', status:'running',   task:'Nepal fintech market scan',   progress:62, started:'2m ago', cost:0.11, steps:['Fetching sources','Reading pages','Cross-checking','Drafting brief'] },
    { id:'run-3840', agent:'CodeForge',     emoji:'⚒️', status:'running',   task:'Refactor payments module',   progress:34, started:'6m ago', cost:0.22, steps:['Parsing repo','Mapping deps','Patch plan','Applying'] },
    { id:'run-3839', agent:'Finlight',      emoji:'📈', status:'queued',    task:'Morning market brief',       progress:0,  started:'—',      cost:0.00, steps:['Load watchlist','Fetch quotes','Summarize'] },
    { id:'run-3836', agent:'SecureScan',    emoji:'🛡️', status:'done',      task:'Perimeter vulnerability scan',progress:100,started:'1h ago', cost:0.34, steps:['Port sweep','CVE match','Report'] },
    { id:'run-3834', agent:'HarmonyArts',   emoji:'🖌️', status:'done',      task:'Landing page copy v3',       progress:100,started:'3h ago', cost:0.09, steps:['Brief','Draft','Tone pass'] }
  ];
  S.DATA.APPROVALS = [
    { id:'ap-9',  agent:'CodeForge',  emoji:'⚒️', act:'Push commit to main',            risk:'high',   when:'2m ago', meta:'payments/charge.js · +42 −17' },
    { id:'ap-8',  agent:'SecureScan', emoji:'🛡️', act:'Block IP 203.0.113.44',           risk:'medium', when:'14m ago', meta:'Rate-limit policy · auto 30m' },
    { id:'ap-7',  agent:'Finlight',   emoji:'📈', act:'Rebalance portfolio 12%',        risk:'high',   when:'40m ago', meta:'NPR 84,000 → ETF basket' },
    { id:'ap-6',  agent:'HarmonyArts',emoji:'🖌️', act:'Publish article to blog',        risk:'low',    when:'1h ago',  meta:'“Freelancing in Nepal 2026”' }
  ];
  S.DATA.FLEET = [
    { n:'Research Cluster',  agents:['🔮','📊','📈'], health:98, load:64, state:'healthy' },
    { n:'Build Cluster',     agents:['⚒️','🔁'],       health:95, load:41, state:'healthy' },
    { n:'Growth Cluster',    agents:['🖌️','🎧','🌐'], health:91, load:78, state:'degraded' }
  ];

  /* integrations catalog — fields are stored as env-style vars; secrets stay in this browser */
  S.DATA.INTEGRATIONS = [
    { id:'openai',  name:'OpenAI',    ic:'i-sparkles', c:'#10a37f', test:'openai',
      hint:'Create an API key at platform.openai.com/api-keys', portal:'platform.openai.com/api-keys',
      fields:[{ k:'OPENAI_API_KEY', secret:true, ph:'sk-…' }] },
    { id:'telegram',name:'Telegram',  ic:'i-send',    c:'#2aabee', test:'telegram',
      hint:'Create a bot via @BotFather, then paste the token', portal:'t.me/BotFather',
      fields:[{ k:'TELEGRAM_BOT_TOKEN', secret:true, ph:'123456:ABC-DEF…' }] },
    { id:'discord', name:'Discord',   ic:'i-users',   c:'#5865f2', test:'discord',
      hint:'Create a bot in the Developer Portal → Bot → Token', portal:'discord.com/developers/applications',
      fields:[{ k:'DISCORD_BOT_TOKEN', secret:true, ph:'MTA…' }] },
    { id:'supabase',name:'Supabase',  ic:'i-layers',  c:'#3ecf8e', test:'supabase',
      hint:'Project Settings → API → URL + anon key', portal:'supabase.com/dashboard/account/tokens',
      fields:[{ k:'SUPABASE_URL', ph:'https://xxx.supabase.co' }, { k:'SUPABASE_ANON_KEY', secret:true, ph:'eyJ…' }] },
    { id:'github',  name:'GitHub',    ic:'i-code',    c:'#e6edf3', test:'github',
      hint:'Settings → Developer settings → Personal access token', portal:'github.com/settings/tokens',
      fields:[{ k:'GITHUB_TOKEN', secret:true, ph:'ghp_…' }] },
    { id:'webhook', name:'Custom Webhook', ic:'i-link', c:'#4fa8ff', test:'http',
      hint:'Any HTTPS endpoint agents can call (n8n, Make, your API)', portal:'',
      fields:[{ k:'WEBHOOK_URL', ph:'https://hooks.example.com/…' }, { k:'WEBHOOK_SECRET', secret:true, ph:'optional signing secret' }] }
  ];

  /* ===== RESEARCH STATE MACHINE (board 4) ===== */
  S.DATA.RS = [
    { id:'idle',        label:'Idle',        cap:'Calm. Ready. Always on.',
      title:'', sub:'Your Personal AI Mentor &\nExecution Partner', c:'#ebeaf0', pct:0, stats:[] },
    { id:'researching', label:'Researching', cap:'Sources, data, real-time info.',
      title:'Researching…', sub:'Scanning trusted sources for the best information', c:'#00b4ff', pct:62,
      stats:[ ['Sources Found','14'], ['Sources Verified','9'], ['Analyzing','6'] ] },
    { id:'analyzing',   label:'Analyzing',   cap:'Processing. Comparing. Thinking.',
      title:'Analyzing…', sub:'Comparing information from multiple sources for accuracy and relevance', c:'#a855f7', pct:78,
      stats:[ ['Cross-checking facts','12'], ['Finding contradictions','3'], ['Extracting key points','8'] ] },
    { id:'verifying',   label:'Verifying',   cap:'Checking. Validating. Ensuring accuracy.',
      title:'Verifying…', sub:'Confirming sources and validating information', c:'#22d3ee', pct:86,
      stats:[ ['Fact-checking','12/12'], ['Source verification','9/12'], ['Bias detection','4/4'] ] },
    { id:'success',     label:'Success',     cap:'Complete. Accurate. Ready.',
      title:'Research Complete', sub:'Here\'s what I found for you.', c:'#34d399', pct:100, stats:[] }
  ];
  S.DATA.RS_CHIPS = ['Google','YouTube','Wikipedia','Reddit','GitHub','X','+ More'];
  S.DATA.RS_NAV = ['Home','Research','Memory','Tools'];

  /* Source panel (during research) */
  S.DATA.LIVE_SOURCES = [
    { n:'Google',       t:'Web Search',      pages:7, used:5, c:'#4285f4', g:'G',  verified:true },
    { n:'YouTube',      t:'Videos',          pages:3, used:2, c:'#ff0000', g:'▶',  verified:true },
    { n:'Wikipedia',    t:'General knowledge',pages:4, used:3, c:'#f1f3f4', g:'W',  verified:true, dark:true },
    { n:'Reddit',       t:'Discussions',     pages:2, used:1, c:'#ff4500', g:'●',  verified:true },
    { n:'GitHub',       t:'Technical Docs',  pages:1, used:1, c:'#24292f', g:'GH', verified:true },
    { n:'X (Twitter)',  t:'Latest Updates',  pages:2, used:1, c:'#000000', g:'X',  verified:true }
  ];
  S.DATA.SOURCE_PAGES = [
    { n:'techcrunch.com', s:'Latest AI trends in 2025…', ok:true,  g:'TC', c:'#0aad0a' },
    { n:'wikipedia.org',  s:'Artificial intelligence…',  ok:true,  g:'W',  c:'#f1f3f4', dark:true },
    { n:'forbes.com',    s:'The future of AI assistants…', ok:true, g:'F', c:'#00b3e6' },
    { n:'reddit.com',    s:'r/ChatGPT | User experiences…', ok:true, g:'●', c:'#ff4500' },
    { n:'youtube.com',   s:'AI tools in 2025 - Full Guide…', ok:true, g:'▶', c:'#ff0000' },
    { n:'medium.com',    s:'The evolution of personal AI…',  ok:false, g:'M', c:'#000000' }
  ];

  /* Failure Sequence (10–30 seconds) */
  S.DATA.FAIL_SEQ = [
    { n:1, name:'Glitch',     t:'0–4s',   d:'System detects an issue.',   c:'#ff6b6b', st:'failure' },
    { n:2, name:'Smoke',      t:'4–8s',   d:'Searching for recovery…',    c:'#ff8f6b', st:'failure' },
    { n:3, name:'Crack',      t:'8–12s',  d:'Partial system failure.',    c:'#ff6b6b', st:'failure' },
    { n:4, name:'Recovery',   t:'12–18s', d:'Rebuilding connection…',     c:'#a855f7', st:'recovery' },
    { n:5, name:'Reconnect',  t:'18–25s', d:'Reconnecting sources…',      c:'#70d3fc', st:'recovery' },
    { n:6, name:'Stabilized', t:'25–30s', d:'Back online!',               c:'#34d399', st:'success' }
  ];
  /* Recovery Sequence: purple → light sky blue → green */
  S.DATA.REC_SEQ = [
    { name:'Failure',     sub:'System unstable',   c:'#ff6b6b' },
    { name:'Rebuilding',  sub:'Reconnecting…',     c:'#a855f7' },
    { name:'Restoring',   sub:'Data syncing…',     c:'#4fa8ff' },
    { name:'Stabilizing', sub:'Almost there…',     c:'#22d3ee' },
    { name:'Success',     sub:'Operation complete',c:'#34d399' }
  ];
  /* Color Palette (Meaningful. Consistent.) */
  S.DATA.PALETTE = [
    { n:'Idle / Neutral',                c:'#ebeaf0' },
    { n:'Researching (Blue)',            c:'#00b4ff' },
    { n:'Analyzing (Purple)',            c:'#a855f7' },
    { n:'Verifying (Cyan)',              c:'#22d3ee' },
    { n:'Recovery (Purple → Sky Blue)',  c:'#ddb4fc', c2:'#70d3fc' },
    { n:'Success (Green)',               c:'#34d399' },
    { n:'Warning (Amber)',               c:'#f59e0b' },
    { n:'Failure (Red/Orange)',          c:'#ff6b6b' }
  ];
  S.DATA.RS_ACTIONS = ['Deep Research','Summarize','Create','More'];

  /* ===== EARNING ANIMATION — 7 stages (board 3) ===== */
  S.DATA.EARN_STAGES = [
    { n:1, name:'RECOGNITION',       t:'0–2s',   ms:2000, d:'SAGE detects a successful transaction / payment received.',       chip:'Analyzing payment details…' },
    { n:2, name:'ENERGY BURST',      t:'2–4s',   ms:2000, d:'Energy rings expand, preparing for the value transfer.',           chip:'Processing…' },
    { n:3, name:'VALUE PARTICLES',   t:'4–7s',   ms:3000, d:'Value particles flow into SAGE and transform into wealth energy.', chip:'Receiving funds…' },
    { n:4, name:'CORE TRANSFORMATION',t:'7s',    ms:3000, d:'SAGE core brightens with golden energy.',                          chip:'Finalizing…' },
    { n:5, name:'AMOUNT REVEAL',     t:'10–13s', ms:3000, d:'Amount is counted up with smooth animation.',                      chip:'Payment received!' },
    { n:6, name:'CELEBRATION',       t:'13–15s', ms:2000, d:'A subtle golden wave confirms your earnings.',                    chip:'You\'re doing great!' },
    { n:7, name:'STABILIZE',         t:'15–17s', ms:2000, d:'SAGE returns to normal state, ready for your next command.',       chip:'Earning complete.' }
  ];
  S.DATA.EARN_TIERS = [
    { id:'small',     name:'SMALL EARNING',       range:'NPR 500 – 2,000',     amount:1250,  c:'#22d3ee', c2:'#8ef0ff',
      d:'Quick pulse + light particles. (No full transformation)',        use:'Perfect for small tasks, commissions, or tips.' },
    { id:'medium',    name:'MEDIUM EARNING',      range:'NPR 2,001 – 10,000',  amount:5000,  c:'#8b5cf6', c2:'#c9b3ff',
      d:'Full animation sequence (with golden particles)',                use:'For client payments, sales, or project income.' },
    { id:'major',     name:'MAJOR MILESTONE',     range:'NPR 10,001 – 100,000',amount:25000, c:'#f5a623', c2:'#ffd97a',
      d:'Extended cinematic effect with light beams and particles',       use:'Big project, long-term client, or multiple payments.' },
    { id:'legendary', name:'LEGENDARY MILESTONE', range:'NPR 100,000+',        amount:100000,c:'#ffd76a', c2:'#fff0b8',
      d:'Epic animation with 3D elements, particles and sound boost',     use:'Rare. Life changing. A new chapter.' }
  ];
  S.DATA.EARN_SUMMARY = {
    title:'Money Earned', amount:5000, when:'Today · 10:24 AM',
    from:'Client: Digital Marketing Project', pid:'#DBM-7824',
    points:['Project completed','Client payment received','Added to your balance']
  };
  S.tierFor = function (amount) {
    if (amount >= 100000) return S.DATA.EARN_TIERS[3];
    if (amount >= 10001) return S.DATA.EARN_TIERS[2];
    if (amount >= 2001) return S.DATA.EARN_TIERS[1];
    return S.DATA.EARN_TIERS[0];
  };

  /* ===== WALLET / PREMIUM / DASHBOARD (board 2) ===== */
  S.DATA.WALLET_TX = [
    { n:'Client Payment',  when:'Today · 10:24 AM',      v:5000,  ic:'i-case' },
    { n:'Premium Feature', when:'Yesterday · 05:21 PM',  v:-2000, ic:'i-crown' },
    { n:'Research Credits',when:'Sep 18 · 11:12 AM',     v:-500,  ic:'i-search' },
    { n:'Subscription',    when:'Sep 15 · 09:10 AM',     v:-1000, ic:'i-lock' }
  ];
  S.DATA.PREMIUM_FEATURES = ['Advanced Research','Unlimited Access','Custom AI Models','Priority Processing','API Access','Exclusive Tools'];
  S.DATA.LIVE_ACTIVITY = [
    { n:'Google',    s:12, when:'2m', c:'#4285f4', g:'G'  },
    { n:'YouTube',   s:8,  when:'3m', c:'#ff0000', g:'▶'  },
    { n:'Wikipedia', s:6,  when:'4m', c:'#f1f3f4', g:'W', dark:true },
    { n:'Reddit',    s:5,  when:'5m', c:'#ff4500', g:'●'  },
    { n:'GitHub',    s:3,  when:'6m', c:'#24292f', g:'GH' }
  ];
  S.DATA.RECENT = [
    { n:'Best AI video tools (free)', when:'2 hours ago', ic:'i-video' },
    { n:'GROE brand strategy',        when:'5 hours ago', ic:'i-sparkles' },
    { n:'Nepal market analysis',      when:'7 hours ago', ic:'i-trend' },
    { n:'Content plan - Dhun Barsa',  when:'1 day ago',   ic:'i-bookmark' }
  ];
  S.DATA.DESK_NAV = [
    { id:'home',     name:'Home',     ic:'i-home' },
    { id:'agents',   name:'Agents',   ic:'i-hex' },
    { id:'chat',     name:'Chat',     ic:'i-chat' },
    { id:'research', name:'Research', ic:'i-search' },
    { id:'aistudio', name:'Tools',    ic:'i-grid' },
    { id:'memory',   name:'Memory',   ic:'i-layers' },
    { id:'files',    name:'Files',    ic:'i-folder' },
    { id:'wallet',   name:'Wallet',   ic:'i-wallet' },
    { id:'settings', name:'Settings', ic:'i-gear' }
  ];
  S.DATA.MEMORY = [
    { k:'You are based in', v:'Kathmandu, Nepal', ic:'i-pin' },
    { k:'Learning path', v:'Complete Flutter Development (40%)', ic:'i-book' },
    { k:'Current focus', v:'Freelancing & client work', ic:'i-target' },
    { k:'Preferred language', v:'English · नेपाली', ic:'i-globe' },
    { k:'Saved research', v:'Nepal market analysis · 12 sources', ic:'i-search' },
    { k:'Last goal', v:'Reach Stage 1 MID intensity', ic:'i-diamond' }
  ];
  S.DATA.TAGLINE = ['THINK','RESEARCH','CREATE','EXECUTE','EARN'];

  /* ===== Chat brain ===== */
  S.DATA.CHAT_QS = [
    'Best place to visit in Nepal?',
    'How do I start freelancing?',
    'What skill should I learn in 2026?',
    'Explain SAGE Evolution to me'
  ];
  S.DATA.SOURCES = [
    { n:'Nepal Tourism Board', u:'www.ntb.gov.np' },
    { n:'Lonely Planet', u:'www.lonelyplanet.com' },
    { n:'Wikipedia', u:'www.wikipedia.org' }
  ];
  S.DATA.RESEARCH_STEPS = [
    'Searching reliable sources…',
    'Reading and analyzing content…',
    'Comparing information…',
    'Preparing final answer…'
  ];
  S.answerFor = function (q) {
    const t = q.toLowerCase();
    if (/visit|place|nepal|trek|travel|pokhara/.test(t)) return {
      research: true,
      text: 'Nepal offers many amazing places! Here are some top destinations:',
      list: ['Poona Hill — Stunning sunrise views', 'Panchasaur — Lakeside peace', 'Lumbini — Birthplace of Buddha', 'Kathmandu — History & temples'],
      extra: 'Would you like a detailed travel plan or a budget-friendly option?',
      actions: ['Show me affordable hotels in Pokhara', 'Create a travel plan', 'Find travel guides']
    };
    if (/skill|learn|2026|course/.test(t)) return {
      text: 'Top skills with demand in Nepal right now:',
      list: ['Flutter / Mobile Development', 'UI/UX Design', 'Digital Marketing', 'AI & Automation workflows'],
      extra: 'Start with Complete Flutter Development — 12 modules, beginner friendly.',
      actions: ['Open Learning']
    };
    if (/freelanc|money|\bearn|\bjob|\bwork/.test(t)) return {
      text: 'Here\'s the fastest path to freelancing with SAGE:',
      list: ['Pick one skill from Learning (Flutter or Design)', 'Complete a course + earn a Certificate', 'Build 2 portfolio files in Files', 'Apply via the Jobs app + list a service on Marketplace'],
      extra: 'Every completed step raises your Evolution — money alone never does.',
      actions: ['Open Learning', 'Browse Jobs']
    };
    if (/evolution|stage|spark|rank/.test(t)) return {
      text: 'SAGE Evolution is your lifetime achievement layer:',
      list: ['13 ranks — Bronze → Californium Overlord', 'Each rank has Low / Mid / High intensity', 'Driven by skill & achievement, never by withdrawals', 'Spark is separate — it\'s the platform economy'],
      extra: 'The blue + black SAGE identity never disappears — only accent layers evolve.',
      actions: ['Open Evolution']
    };
    return {
      text: 'I can help with that. I\'m your mentor and execution partner — I can research topics, plan your learning, find jobs, and track your Evolution.',
      extra: 'Try asking about visiting Nepal, freelancing, or which skill to learn next.',
      actions: ['Open Learning', 'Browse Jobs']
    };
  };

})(window.SAGE);

```

### `js/components.js`

<!-- Shared components: logo, orb, icons, earning/fail/transition FX | 27435 bytes -->

```js
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
      if (!opts.noCredit) S.creditEarning(amount, opts.source || 'Client Payment');
      S.save();
      if (S.currentRoute() === 'earn' || S.currentRoute() === 'wallet' || S.currentRoute() === 'home') S.render();
      S.toast('Payment received ✓ ' + S.npr(amount) + ' · ' + tier.name.toLowerCase());
      const lvl = S.addProgress(full ? 6 : 3, 'Payment received');
      if (lvl) S.handleLevelUp(lvl);
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
        <div class="earn-amount show" id="earnAmt"><span>+${S.npr(0)}</span><em>EARNED</em></div>
        <div class="earn-desc">${S.esc(tier.d)}</div>
        <div class="earn-chip">Payment received!</div>
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
      if (!skip) S.toast('Back online! · Research recovered');
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
        <div class="grow"><b>Couldn't complete the research.</b><div class="tiny muted">Network or source access interrupted.</div></div>
        <div class="fail-btns"><button class="btn xs primary" data-act="fail-retry">Retry</button><button class="btn xs soft" data-act="fail-retry">Try another approach</button></div>
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

```

### `js/ai.js`

<!-- AI engine: built-in answer system + optional live LLM | 41427 bytes -->

```js
/* SAGE ONE — AI engine
   Built-in answer system (default, offline) + optional live LLM via a user supplied key.
   Answer shape: { title, intro, blocks[], sources[], followups[], confidence, engine } */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  /* ---------- config (kept out of app state; key never leaves the device) ---------- */
  const CFG_KEY = 'sage-ai-cfg-v1';
  const DEF = { mode: 'builtin', provider: 'openai', key: '', model: 'gpt-4o-mini', base: 'https://api.openai.com/v1' };
  let cfg = Object.assign({}, DEF);
  try { const raw = localStorage.getItem(CFG_KEY); if (raw) cfg = Object.assign(cfg, JSON.parse(raw)); } catch (e) {}

  const AI = S.AI = {};
  AI.cfg = function () { return cfg; };
  AI.setCfg = function (patch) {
    cfg = Object.assign(cfg, patch);
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
  };
  AI.isLive = function () { return cfg.mode === 'live' && !!cfg.key; };

  /* ---------- helpers ---------- */
  const list = (a) => a.map(x => ({ t: 'ul', v: [x] }));
  function steps(a) { return { t: 'ol', v: a }; }
  function head(v) { return { t: 'h', v: v }; }
  function note(v) { return { t: 'note', v: v }; }
  function kv(pairs) { return { t: 'kv', v: pairs.map(p => ({ k: p[0], v: p[1] })) }; }

  /* ---------- knowledge base ---------- */
  const KB = [
    {
      id: 'skills', research: true,
      re: /\b(skills?|learn(ing)?|course|upskill|2026|in demand|what should i (learn|study)|which skill|new skill)\b/,
      kw: ['skill', 'learn', '2026', 'course', 'in demand', 'upskill', 'what to learn'],
      build: () => ({
        title: 'Top skills to learn in 2026',
        intro: 'In 2026 the highest-leverage skills sit where AI meets execution — the people who can build with AI, sell with content, and be trusted with money. Pick ONE lane below and go deep: breadth without proof does not get hired.',
        blocks: [
          head('Fastest to earn money (0–6 months)'),
          { t: 'ul', v: [
            'AI automation & agent workflows — build tools that cut a real business cost. Sellable in weeks, not years.',
            'Short-form video + content systems — every brand needs Reels and TikToks that actually convert.',
            'Performance marketing (Meta + Google ads) — it is measured in revenue, so it is easy to prove.'
          ] },
          head('Highest long-term ceiling (6–18 months)'),
          { t: 'ul', v: [
            'AI engineering — LLM apps, retrieval, evals and agents. The hardest role to hire for right now.',
            'Data engineering & analytics — most companies have AI tools but no clean data to feed them.',
            'Cloud + DevOps — unglamorous, always in demand, and it pays well remotely.'
          ] },
          head('Best fit for the Nepal market'),
          { t: 'ul', v: [
            'Flutter / mobile development — local startups and diaspora clients both buy it.',
            'UI/UX design — low startup cost, high leverage, and it pairs with every other skill here.',
            'Bookkeeping & financial ops for overseas clients — recurring income, timezone friendly.'
          ] },
          head('How to choose in 60 seconds'),
          steps([
            'Which list made you lean in? That is your lane — interest beats hype every time.',
            'Can you picture doing it for 12 months once it gets boring? If not, take the next one.',
            'Commit to 30 days, not forever. You can always switch after one sprint.'
          ]),
          note('Rule of thumb: do not collect certificates. Ship 3 real projects, publish them, and charge — that is what actually gets you hired in 2026.')
        ],
        sources: [
          { n: 'WEF Future of Jobs Report', u: 'weforum.org/reports/future-of-jobs' },
          { n: 'LinkedIn Workplace Learning Report', u: 'learning.linkedin.com/resources/workplace-learning-report' },
          { n: 'Coursera Job Skills Report', u: 'coursera.org/skills-reports' }
        ],
        followups: ['Build me a 30-day learning plan', 'Which skill fits my current background?', 'Show me courses in Learning'],
        confidence: 0.93
      })
    },
    {
      id: 'travel', research: true,
      re: /\b(nepal|visit|travel|trek|pokhara|lumbini|kathmandu|tourist|place to|holiday|trip)\b/,
      kw: ['nepal', 'visit', 'travel', 'pokhara', 'trek', 'lumbini', 'kathmandu', 'place'],
      build: () => ({
        title: 'Best places to visit in Nepal',
        intro: 'Nepal packs eight of the world fourteen highest peaks, a living Himalayan culture, and a subtropical lowland — all within a few hours of Kathmandu. Here is how to choose based on how much time you have.',
        blocks: [
          head('If you have 3–4 days'),
          { t: 'ul', v: [
            'Pokhara — Phewa Tal, Sarangkot sunrise, and the World Peace Pagoda. The easiest trip with the biggest payoff.',
            'Kathmandu Valley — Bhaktapur, Patan and Swayambhunath. Best if you like history and craft over altitude.',
            'Nagarkot or Dhulikhel — a short escape for a Himalaya horizon without a trek.'
          ] },
          head('If you have 7–14 days'),
          { t: 'ul', v: [
            'Annapurna Base Camp or Poon Hill — tea-house trekking, well trodden, good for a first multi-day trek.',
            'Lumbini — the birthplace of Buddha, quiet and under-visited. Pair it with Chitwan for wildlife.',
            'Chitwan or Bardia — jungle safaris, one-horned rhino and (in Bardia) tigers.'
          ] },
          head('Practical notes'),
          steps([
            'Best season: October–November for clear peaks, March–April for rhododendron and warmer trails.',
            'Fly Kathmandu–Pokhara instead of the 6–7 hour road if your days are limited.',
            'Carry cash outside Kathmandu — card acceptance stops at the district town.'
          ]),
          note('Tell me your dates and budget and I will turn this into a day-by-day plan.')
        ],
        sources: [
          { n: 'Nepal Tourism Board', u: 'ntb.gov.np' },
          { n: 'Lonely Planet — Nepal', u: 'lonelyplanet.com/nepal' },
          { n: 'Visit Nepal', u: 'visitnepal.com' }
        ],
        followups: ['Create a 7-day Nepal travel plan', 'Show me affordable hotels in Pokhara', 'What is the best trek for beginners?'],
        confidence: 0.92
      })
    },
    {
      id: 'freelance', research: true,
      re: /\b(freelanc\w*|upwork|fiverr|side hustle|client work|charge for|make money online|income)\b/,
      kw: ['freelance', 'upwork', 'fiverr', 'client', 'side hustle', 'income'],
      build: () => ({
        title: 'How to start freelancing (and get your first client)',
        intro: 'Most people fail at freelancing at step one: they join a platform before they have something to sell. Flip it — pick one narrow service, prove it three times, then go looking for buyers.',
        blocks: [
          head('The path that actually works'),
          steps([
            'Pick one service, not five. "Flutter app fixes" beats "all development work".',
            'Build 3 proof pieces — even if they are unpaid or for your own app. Show, do not claim.',
            'Package a price: a fixed starter offer beats an hourly rate for first-time freelancers.',
            'Go where buyers already are — Upwork, Fiverr, LinkedIn, or Kathmandu-based agencies first.',
            'Deliver early, ask for a testimonial, and turn every project into a case study.'
          ]),
          head('What to charge in your first 90 days'),
          { t: 'ul', v: [
            'Start at roughly 60–70% of your target rate so you buy reviews fast.',
            'Raise prices after every 3 completed jobs — momentum matters more than negotiation.',
            'Always take a 50% advance; it filters out non-serious clients.'
          ] },
          note('Every completed project raises your Evolution. Money never does — skill and demonstrated results are what move your rank.')
        ],
        sources: [
          { n: 'Upwork Freelance Guide', u: 'upwork.com/resources' },
          { n: 'Fiverr Learn', u: 'learn.fiverr.com' },
          { n: 'SAGE Learning', u: 'app · Learning' }
        ],
        followups: ['Open Learning', 'Browse Jobs', 'Help me write my profile bio'],
        confidence: 0.9
      })
    },
    {
      id: 'evolution',
      re: /\b(evolution|rank|stage|spark|bronze|silver|gold|diamond|sovereign|overlord|level up|progress)\b/,
      kw: ['evolution', 'rank', 'stage', 'spark', 'level'],
      build: () => ({
        title: 'How SAGE Evolution works',
        intro: 'Evolution is your lifetime achievement layer. It tracks what you can actually do — not what you can afford — so it only ever moves forward. Spark is the separate platform currency you spend.',
        blocks: [
          kv([['Ranks', '13 — Bronze → Californium Overlord'], ['Intensity', 'Low → Mid → High per rank'], ['Driver', 'Skill & achievement'], ['Never reduced by', 'Withdrawals or spending']]),
          head('The two progression paths'),
          { t: 'ul', v: [
            'Skill upgrade — knowledge, practice, evidence, capability. This changes your visual identity (theme + accents).',
            'Money upgrade — earning and system capability. This unlocks features and access only.'
          ] },
          head('The flow'),
          { t: 'ul', v: ['Learn → Practice → Evidence → Skill → Opportunity → Work & Earn → Lifetime Achievement → Evolution'] },
          note('The UI stays the same as you rank up — only visual layers evolve, and the SAGE blue + black identity never disappears.')
        ],
        sources: [{ n: 'SAGE ONE · Unified 13 Evolution System', u: 'app · Evolution' }],
        followups: ['Open Evolution', 'Show me the transition animation', 'How do I earn skill points?'],
        confidence: 0.95
      })
    },
    {
      id: 'ai', research: true,
      re: /\b(a\.?i\.?|artificial intelligence|llm|chatgpt|gpt|prompt(ing)?|machine learning|neural|agent|automation)\b/,
      kw: ['ai', 'artificial intelligence', 'llm', 'prompt', 'machine learning', 'agent', 'automation'],
      build: () => ({
        title: 'Working with AI in 2026',
        intro: 'The useful mental model is not "AI replaces you" — it is that AI collapses the cost of the first draft. People who win with it are the ones who can judge the output and steer it.',
        blocks: [
          head('Where AI genuinely saves time'),
          { t: 'ul', v: [
            'Drafting and rewriting — emails, proposals, JDs, product copy.',
            'Research synthesis — turning 12 sources into a one-page brief.',
            'Code — scaffolding, tests, refactors, and explaining unfamiliar codebases.',
            'Repetition — anything with a clear input → output rule can be automated.'
          ] },
          head('How to prompt well'),
          steps([
            'Give role + context + constraint + format. "You are a hiring manager. Rewrite this JD for a junior Flutter dev. Max 120 words. Bullet list."',
            'Show one good example — examples beat adjectives.',
            'Ask for the answer in the shape you need (table, JSON, checklist) so you can use it directly.',
            'Iterate on the worst line, not the whole thing — partial rewrites are cheaper and better.'
          ]),
          note('Where AI is weak: current events, exact figures without sources, and anything needing local judgement. Verify those before you ship.')
        ],
        sources: [
          { n: 'Stanford HAI AI Index', u: 'hai.stanford.edu/ai-index' },
          { n: 'Google AI Guides', u: 'ai.google/guides' }
        ],
        followups: ['Write me a prompt template', 'Show me AI Studio', 'How do I automate a repeated task?'],
        confidence: 0.9
      })
    },
    {
      id: 'dev', research: true,
      re: /\b(coding|programming|javascript|typescript|python|flutter|react|app development|software|developer|code|web dev|backend)\b/,
      kw: ['code', 'coding', 'programming', 'javascript', 'python', 'flutter', 'react', 'developer', 'software'],
      build: () => ({
        title: 'Where to start with programming',
        intro: 'Do not choose a language first — choose a thing you want to exist. Motivation survives syntax; syntax does not survive boredom.',
        blocks: [
          head('Pick by what you want to build'),
          { t: 'ul', v: [
            'Mobile apps → Flutter (Dart) — one codebase, strong freelance demand.',
            'Websites & dashboards → JavaScript + React, then Node for the backend.',
            'Data, scripts, AI → Python — shortest path to something useful.',
            'Automation and internal tools → Python or TypeScript + a small database.'
          ] },
          head('The first 8 weeks'),
          steps([
            'Week 1–2: variables, functions, arrays, loops. Nothing else.',
            'Week 3–4: build a CLI or a page that does one real thing for you.',
            'Week 5–6: add a second data source — an API or a file.',
            'Week 7–8: ship it, put it on GitHub, write 5 lines about what it does.'
          ]),
          note('One project you finished teaches more than ten tutorials you watched. Ship ugly, then improve.')
        ],
        sources: [{ n: 'MDN Web Docs', u: 'developer.mozilla.org' }, { n: 'Flutter Docs', u: 'docs.flutter.dev' }],
        followups: ['Open Learning', 'Build me a 30-day learning plan', 'What should I build first?'],
        confidence: 0.9
      })
    },
    {
      id: 'marketing', research: true,
      re: /\b(marketing|seo|social media|instagram|tiktok|reels|ads?|growth|audience|brand(ing)?|content strategy)\b/,
      kw: ['marketing', 'seo', 'instagram', 'social media', 'ads', 'growth', 'brand'],
      build: () => ({
        title: 'A marketing plan that actually moves numbers',
        intro: 'Most marketing fails because it optimises for reach instead of a single next step. Fix the offer and the call to action first — the channels matter much less.',
        blocks: [
          head('The order that works'),
          steps([
            'Define one offer and one audience. "Social media for Kathmandu restaurants", not "marketing for everyone".',
            'Write the outcome, not the feature — what changes for the customer in 30 days?',
            'Pick ONE channel and post where your buyers already scroll.',
            'Measure saves, replies and site clicks — not likes.',
            'Turn every result into a case study and run it again.'
          ]),
          head('Fastest wins'),
          { t: 'ul', v: [
            'Local SEO — Google Business Profile with real photos and replies to every review.',
            'Short-form video — one hook, one idea, under 20 seconds, three times a week.',
            'Email/SMS list — the only audience you actually own.'
          ] },
          note('Track everything in one sheet: spend, leads, closed. If a channel cannot be traced to rupees after 30 days, cut it.')
        ],
        sources: [{ n: 'Google Digital Garage', u: 'learndigital.withgoogle.com' }, { n: 'Meta Business Help', u: 'business.help.facebook.com' }],
        followups: ['Create a 30-day content plan', 'Write me 10 hooks for my niche', 'Show me the Marketplace'],
        confidence: 0.88
      })
    },
    {
      id: 'jobs', research: true, p: 1,
      re: /\b(job|hiring|resume|cv|interview|apply|vacancy|recruit|get hired|career)\b/,
      kw: ['job', 'resume', 'cv', 'interview', 'hire', 'vacancy', 'career'],
      build: () => ({
        title: 'Getting hired faster',
        intro: 'Recruiters give a CV about seven seconds before deciding. You are not being judged on everything you have done — only on whether the top third matches the role.',
        blocks: [
          head('Fix the CV first'),
          steps([
            'Lead with a 2-line summary that names the role and your strongest proof.',
            'Rewrite duties as results — "cut load time from 4.2s to 1.1s" beats "responsible for performance".',
            'Add links: GitHub, portfolio, live apps. Proof outranks adjectives.',
            'One page until you have 8+ years of experience.'
          ]),
          head('Where to apply in Nepal'),
          { t: 'ul', v: [
            'SAGE Jobs — matched to your skills and Evolution.',
            'Company career pages directly — higher hit rate than job boards.',
            'LinkedIn with a specific message to the hiring manager, not "I am interested".'
          ] },
          note('For every 10 applications, track responses in a sheet. If nobody replies, the CV is the problem — not the market.')
        ],
        sources: [{ n: 'SAGE Jobs', u: 'app · Jobs' }, { n: 'LinkedIn Careers', u: 'linkedin.com/jobs' }],
        followups: ['Browse Jobs', 'Review my resume', 'Prepare me for an interview'],
        confidence: 0.9
      })
    },
    {
      id: 'study', research: true,
      re: /\b(study abroad|scholarship|visa|masters?|degree|abroad|university| australia| usa| europe| canada)\b/,
      kw: ['scholarship', 'study abroad', 'visa', 'masters', 'degree', 'university'],
      build: () => ({
        title: 'Studying abroad from Nepal',
        intro: 'The real competition is not marks — it is a coherent story: why this course, why this country, and what you will do after. Build that first, then the paperwork becomes easy.',
        blocks: [
          head('What actually decides it'),
          { t: 'ul', v: [
            'Statement of purpose — specific, honest, and tied to one career direction.',
            'English test — IELTS/PTE timelines move faster than you expect; book early.',
            'Funds evidence — plan the bank balance and sponsorship papers before offers arrive.',
            'Scholarship deadlines — most open 8–12 months before intake.'
          ] },
          head('Typical route'),
          steps([
            'Shortlist 3 countries by post-study work rights and total cost, not rankings.',
            'Take the English test and start applications 10 months out.',
            'Apply to scholarships in the same window as admissions.',
            'Prepare the visa interview around one clear study-and-return plan.'
          ]),
          note('Keep a single tracker: university, deadline, documents, status, cost. Most rejections come from missed dates, not merit.')
        ],
        sources: [{ n: 'University Grants Commission Nepal', u: 'ugc.gov.np' }, { n: 'British Council Nepal', u: 'britishcouncil.org.np' }],
        followups: ['Help me write my statement of purpose', 'Which country fits my budget?', 'Create an application timeline'],
        confidence: 0.87
      })
    },
    {
      id: 'business', research: true,
      re: /\b(business|startup|start a|company|entrepreneur|register|llc|pvt ltd|sell online|shop)\b/,
      kw: ['business', 'startup', 'start a', 'company', 'entrepreneur', 'register'],
      build: () => ({
        title: 'Starting a business in Nepal',
        intro: 'Validate before you incorporate. Registration is cheap and fast now — a business with no customers is the expensive part.',
        blocks: [
          head('Order of operations'),
          steps([
            'Sell manually to 5 people first — WhatsApp and a payment number are enough.',
            'Write down what they bought and why; that becomes your positioning.',
            'Register (Pvt Ltd or sole proprietorship) once revenue is repeatable.',
            'Open a business current account and separate your money immediately.',
            'Add one system: invoicing, inventory, or a simple CRM.'
          ]),
          head('Costs worth knowing'),
          kv([['Registration', 'OCR company registration, online'], ['Payments', 'eSewa / Khalti / FonePay merchant'], ['First year focus', 'Retention over reach']]),
          note('Do not spend the first six months on a logo and an office. Spend them on the tenth paying customer.')
        ],
        sources: [{ n: 'Office of the Company Registrar', u: 'ocr.gov.np' }, { n: 'Inland Revenue Department', u: 'ird.gov.np' }],
        followups: ['Create a lean business plan', 'What should I charge?', 'Show me the Marketplace'],
        confidence: 0.86
      })
    },
    {
      id: 'money',
      re: /\b(earn|earning|withdraw|payment|wallet|passive income|balance|npr|rupees|income sources)\b/,
      kw: ['earn', 'withdraw', 'wallet', 'payment', 'income', 'balance'],
      build: () => ({
        title: 'Ways to earn with SAGE',
        intro: 'Your earning routes split into marketplace work, client projects, referral income and content rewards. Money improves your access — it never changes your rank.',
        blocks: [
          head('Where the money comes from'),
          { t: 'ul', v: [
            'Marketplace — sell a product or service, the largest share of most earnings.',
            'Jobs & client projects — highest value per hour, slower to start.',
            'Content rewards — smaller, recurring, and it compounds with your audience.',
            'Referrals — one-time, but free once your network is warm.'
          ] },
          head('Getting paid out'),
          steps([
            'Complete KYC (face + NID) — withdrawals are blocked without it.',
            'Pick a partner: eSewa, Khalti, FonePay or bank transfer.',
            'Watch the fee tier — the percentage drops as the amount rises.'
          ]),
          note('Key rule: withdrawing never reduces Evolution. It is a lifetime achievement, separate from Spark.')
        ],
        sources: [{ n: 'SAGE Wallet', u: 'app · Wallet' }, { n: 'Transaction & Fees', u: 'app · Fees' }],
        followups: ['Open Wallet', 'Show me the earning tiers', 'How do I withdraw to bank?'],
        confidence: 0.9
      })
    },
    {
      id: 'health',
      re: /\b(health|fitness|sleep|diet|exercise|workout|weight|stress|mental health|meditat|energy)\b/,
      kw: ['health', 'fitness', 'sleep', 'diet', 'exercise', 'stress', 'weight'],
      build: () => ({
        title: 'Feeling better with four boring habits',
        intro: 'Almost every low-energy, low-focus week traces back to the same four inputs. Fix those before you buy anything.',
        blocks: [
          head('The four that matter'),
          { t: 'ul', v: [
            'Sleep — same wake time seven days a week beats a perfect bedtime.',
            'Movement — 30 minutes of brisk walking, most days. Consistency outperforms intensity.',
            'Protein and plants — one palm of protein and something green at each meal.',
            'Daylight in the morning — 10 minutes outside resets your clock faster than caffeine.'
          ] },
          head('If focus is the problem'),
          steps([
            'One task per 90-minute block, phone in another room.',
            'Write tomorrow\'s single most important task before you close the laptop.',
            'Stop caffeine after 2pm — it is the most common hidden sleep thief.'
          ]),
          note('This is general wellbeing guidance, not medical advice. If something persists, see a clinician.')
        ],
        sources: [{ n: 'WHO Physical Activity Guidelines', u: 'who.int/news-room/fact-sheets' }],
        followups: ['Build me a weekly routine', 'How do I fix my sleep schedule?', 'Create a beginner workout plan'],
        confidence: 0.8
      })
    },
    {
      id: 'invest',
      re: /\b(invest(ing|ment)?|share market|stock|mutual fund|bank (rate|interest)|savings|fixed deposit|ipo)\b/,
      kw: ['invest', 'investment', 'share', 'stock', 'mutual fund', 'saving'],
      build: () => ({
        title: 'Investing basics',
        intro: 'Order matters more than product: emergency fund first, then debt, then long-horizon investing. The best return early on is usually just a higher income.',
        blocks: [
          head('The sequence'),
          steps([
            'Emergency fund covering 3–6 months of expenses in something instantly accessible.',
            'Clear high-interest debt — it beats any realistic market return.',
            'Then invest regularly and boringly — amount and consistency beat timing.',
            'Only then consider individual shares or concentrated bets.'
          ]),
          head('What to look at'),
          { t: 'ul', v: [
            'Fee drag — a 1% annual fee can eat a quarter of a lifetime balance.',
            'Horizon — money you need in 2 years does not belong in equities.',
            'Diversification — one employer\'s shares plus one index is not diversification.'
          ] },
          note('General information only, not financial advice. Check current rates and tax with a licensed adviser before committing.')
        ],
        sources: [{ n: 'Nepal Stock Exchange', u: 'nepalstock.com' }, { n: 'Securities Board of Nepal', u: 'sebon.gov.np' }],
        followups: ['Compare saving options', 'How much should I save each month?', 'Explain mutual funds simply'],
        confidence: 0.8
      })
    },
    {
      id: 'writing',
      re: /\b(write|writing|essay|email|cover letter|blog|post|caption|copywriting|grammar)\b/,
      kw: ['write', 'writing', 'essay', 'email', 'cover letter', 'blog', 'caption'],
      build: () => ({
        title: 'Writing that gets read',
        intro: 'Good writing is mostly structure. Get the order right and the sentences take care of themselves.',
        blocks: [
          head('The structure'),
          steps([
            'Start with the single thing the reader should do — write that last, put it first.',
            'One idea per paragraph, and the first line carries all the weight.',
            'Cut every sentence that does not change the reader\'s next action.',
            'Read it aloud once — anything you stumble over, rewrite.'
          ]),
          head('Fast formulas'),
          { t: 'ul', v: [
            'Email: context in one line → request → deadline → easy out.',
            'Post: hook → tension → shift → takeaway → question.',
            'Cover letter: why them → proof you can do it → the specific role → close.'
          ] },
          note('Paste your draft into chat and I will rewrite it — tell me the audience and the outcome you want.')
        ],
        sources: [{ n: 'SAGE Chat', u: 'app · Chat' }],
        followups: ['Rewrite my email', 'Write a cover letter for me', 'Give me 10 post hooks'],
        confidence: 0.88
      })
    },
    {
      id: 'identity',
      re: /\b(who are you|what can you do|about you|your name|what are you|introduce yourself|help me)\b/,
      kw: ['who are you', 'what can you do', 'about you', 'your name'],
      build: () => ({
        title: 'Hi — I am SAGE',
        intro: 'I am your personal AI mentor and execution partner, built in Nepal. I do not just answer — I route you into the part of the app that gets the job done.',
        blocks: [
          head('What I can do right now'),
          { t: 'ul', v: [
            'Research a topic and show you the sources behind it.',
            'Plan your learning, career, business or travel.',
            'Track your Evolution, wallet and skill progress.',
            'Run deep research, analysis and content creation flows.'
          ] },
          kv([['Ranks', '13-stage Evolution'], ['Currency', 'Spark (separate from Evolution)'], ['Languages', 'English · नेपाली']]),
          note('Try: "What skill should I learn in 2026?" or "Best place to visit in Nepal?"')
        ],
        sources: [{ n: 'SAGE ONE', u: 'app · Home' }],
        followups: ['Explain SAGE Evolution to me', 'What skill should I learn in 2026?', 'How do I start freelancing?'],
        confidence: 0.99
      })
    },
    {
      id: 'greeting',
      re: /^\s*(?:hi|hello|hey|namaste|yo|hola|good (?:morning|evening|afternoon)|how are you)\b|^\s*(?:thanks|thank you|ok|okay|yes|no|cool|great|fine)\b[\s!.?]*$/i,
      kw: ['hello', 'hi', 'namaste', 'hey', 'how are you'],
      build: (q) => ({
        title: /^(hi|hello|hey|namaste|yo|hola)/i.test(q) ? 'Namaste 🙏' : 'Happy to help',
        intro: 'Good to see you. I am ready when you are — ask me anything, or pick one of these to get moving.',
        blocks: [note('I work best with specifics: the more context you give, the more useful the answer.')],
        sources: [],
        followups: ['What skill should I learn in 2026?', 'Best place to visit in Nepal?', 'How do I start freelancing?'],
        confidence: 0.99
      })
    }
  ];

  /* ---------- non-knowledge handlers ---------- */
  function mathOut(exprText, val) {
    const shown = Math.round(val * 1e10) / 1e10;
    return {
      title: '= ' + Number(shown).toLocaleString('en-US'),
      intro: 'Here is the step-by-step: ' + exprText + ' = ' + shown + '.',
      blocks: [kv([['Expression', exprText], ['Result', String(shown)], ['Exact', String(val)]])],
      sources: [],
      followups: ['Show me the steps in detail', 'Convert this to NPR', 'Another calculation'],
      confidence: 1
    };
  }

  function tryMath(q) {
    const raw = q.replace(/[=?]|what is|calculate|solve/gi, ' ').replace(/\s+/g, ' ').trim();
    /* "15% of 4000" — the guard below rejects letters, so handle it first */
    const pct = raw.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+([\d,]+(?:\.\d+)?)$/i);
    if (pct) {
      const val = (parseFloat(pct[1]) / 100) * parseFloat(pct[2].replace(/,/g, ''));
      if (isFinite(val)) return mathOut(pct[1] + '% of ' + pct[2], val);
    }
    if (!/[0-9]/.test(raw) || !/[+\-*/^%]/.test(raw)) return null;
    if (!/^[0-9+\-*/(). %^]+$/.test(raw)) return null;
    let expr = raw.replace(/\^/g, '**');
    let val;
    try { val = Function('"use strict";return (' + expr + ')')(); } catch (e) { return null; }
    if (typeof val !== 'number' || !isFinite(val)) return null;
    return mathOut(raw, val);
  }

  function tryClock(q) {
    if (!/\b(time|date|today|day is it|what day)\b/i.test(q)) return null;
    const d = new Date();
    const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const day = d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      title: t,
      intro: 'It is ' + t + ' on ' + day + ' — your local device time.',
      blocks: [kv([['Time', t], ['Date', day], ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone]])],
      sources: [],
      followups: ['Plan my day', 'Set a study schedule', 'How many hours until tonight?'],
      confidence: 1
    };
  }

  function tryWeather(q) {
    if (!/\b(weather|rain|temperature|forecast|is it going to)\b/i.test(q)) return null;
    return {
      title: 'Weather — I need a live source',
      intro: 'I do not have a live weather feed wired in, so I will not guess at a number you might act on. Here is how to get it instantly, and what is typical.',
      blocks: [
        head('Get it now'),
        { t: 'ul', v: ['Search "weather in Pokhara" — the answer box is enough.', 'Open your phone\'s built-in weather app.', 'desibroadcast / local TV for valley alerts during monsoon.'] },
        head('General pattern (Nepal)'),
        { t: 'ul', v: ['Monsoon Jun–Sep: humid, heavy rain, landslides on hill roads.', 'Post-monsoon Oct–Nov: clearest skies, best trekking.', 'Winter Dec–Feb: cold mornings, dry and clear.', 'Pre-monsoon Mar–May: warm, hazy, rhododendron season.'] }
      ],
      sources: [{ n: 'Department of Hydrology & Meteorology', u: 'dhm.gov.np' }],
      followups: ['Best time to visit Nepal?', 'Plan a trek for October', 'What should I pack?'],
      confidence: 0.7
    };
  }

  /* ---------- generic reasoner (fallback) ---------- */
  function generic(q) {
    const t = q.trim().replace(/\s+/g, ' ');
    const lower = t.toLowerCase();
    let kind = 'a question';
    if (/^why\b/.test(lower)) kind = 'a "why" question — so the answer is about causes and trade-offs';
    else if (/^how\b/.test(lower)) kind = 'a "how" question — so the answer is a sequence of steps';
    else if (/^(what|which|where|who)\b/.test(lower)) kind = 'a definitional question — so the answer is a clear explanation plus options';
    else if (/^(can|should|would|is|do|does|will)\b/.test(lower)) kind = 'a yes/no question — so the answer needs a direct verdict first, then reasoning';
    else if (/\?$/.test(t)) kind = 'an open question';
    return {
      title: 'Let me break that down',
      intro: 'You are asking ' + kind + '. Here is how I would approach "' + t.replace(/\s+/g, ' ').slice(0, 90) + (t.length > 90 ? '…' : '') + '":',
      blocks: [
        head('1. Sharpen the question'),
        { t: 'ul', v: [
          'Name the outcome you want and by when — "better" becomes a number.',
          'Say who this is for and what you have already tried.',
          'Add your constraint (budget, time, skill) so the advice is actually usable.'
        ] },
        head('2. The working answer'),
        { t: 'ul', v: [
          'Start from the smallest version that can be wrong quickly, then improve it.',
          'Prefer the option you can reverse — speed of correction beats perfection.',
          'Define what "done" looks like before you begin, so you can stop.'
        ] },
        head('3. Make it specific'),
        note('Give me two lines of context — your goal, your constraints, and where you are starting from — and I will turn this into a concrete, numbered plan instead of general advice.')
      ],
      sources: [],
      followups: ['Research this deeply', 'Build me a step-by-step plan', 'What should I do first?'],
      confidence: 0.55
    };
  }

  /* ---------- classification ---------- */
  function classify(q) {
    const raw = q.toLowerCase();
    const t = ' ' + raw.replace(/[^a-z0-9\s/+-]/g, ' ').replace(/\s+/g, ' ') + ' ';
    let best = null, bestScore = 0, bestRank = 0;
    for (const k of KB) {
      let s = 0;
      if (k.re && k.re.test(raw)) s += 3;
      for (const w of (k.kw || [])) if (t.indexOf(' ' + w) !== -1 || t.indexOf(w + ' ') !== -1) s += 1;
      /* p breaks ties between overlapping topics (e.g. "a job in Kathmandu" → jobs, not travel) */
      const rank = s + (k.p || 0);
      if (s && rank > bestRank) { bestRank = rank; bestScore = s; best = k; }
    }
    return bestScore >= 2 ? best : null;
  }

  AI.topicOf = function (q) { const k = classify(q); return k ? k.id : null; };
  AI.isResearch = function (q) { const k = classify(q); return !!(k && k.research); };

  AI.builtin = function (q) {
    const m = tryMath(q) || tryClock(q) || tryWeather(q);
    if (m) { m.engine = 'builtin'; m.topic = 'utility'; return m; }
    const k = classify(q);
    const ans = (k ? k.build(q) : generic(q));
    ans.engine = 'builtin';
    ans.topic = k ? k.id : 'general';
    return ans;
  };

  /* ---------- live model ---------- */
  const SYS = 'You are SAGE, a warm, precise AI mentor and execution partner built in Nepal. ' +
    'Answer the user directly and usefully. Format strictly as plain text:\n' +
    'LINE 1: a short title in **double asterisks**\n' +
    'LINE 2: blank\n' +
    'A paragraph of 40-90 words.\n' +
    'Then optional sections: a line starting with "## " as a heading, then lines starting with "- " as bullets.\n' +
    'Optionally a line "STEPS:" then numbered lines "1. ".\n' +
    'End with "SOURCES:" then one "Name | url" per line, then "FOLLOWUPS:" then one suggested question per line.\n' +
    'No markdown other than described. No code fences.';

  AI.askLive = function (q) {
    const base = (cfg.base || '').replace(/\/+$/, '');
    if (cfg.provider === 'gemini') {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(cfg.model || 'gemini-1.5-flash') + ':generateContent?key=' + encodeURIComponent(cfg.key);
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: SYS }] }, contents: [{ role: 'user', parts: [{ text: q }] }] })
      }).then(r => r.json()).then(j => {
        const p = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
        if (!p || !p[0] || !p[0].text) throw new Error('empty response');
        return p[0].text;
      });
    }
    return fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: JSON.stringify({ model: cfg.model, messages: [{ role: 'system', content: SYS }, { role: 'user', content: q }] })
    }).then(r => r.json()).then(j => {
      const txt = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!txt) throw new Error((j && j.error && j.error.message) || 'empty response');
      return txt;
    });
  };

  AI.parseLive = function (text) {
    const lines = String(text).replace(/\r/g, '').split('\n');
    let title = '', intro = '', inSrc = false, inFup = false, cur = null;
    const blocks = [], sources = [], followups = [];
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) { cur = null; continue; }
      if (/^SOURCES?:/i.test(line)) { inSrc = true; inFup = false; continue; }
      if (/^FOLLOW-?UPS?:/i.test(line)) { inFup = true; inSrc = false; continue; }
      if (inSrc) { const p = line.replace(/^-\s*/, '').split('|'); if (p.length > 1) sources.push({ n: p[0].trim(), u: p.slice(1).join('|').trim() }); else sources.push({ n: p[0].trim(), u: '' }); continue; }
      if (inFup) { followups.push(line.replace(/^-\s*/, '')); continue; }
      if (!title) { title = line.replace(/\*\*/g, ''); continue; }
      if (/^##\s*/.test(line)) { cur = { t: 'h', v: line.replace(/^##\s*/, '') }; blocks.push(cur); continue; }
      if (/^-\s*/.test(line)) {
        const item = line.replace(/^-\s*/, '');
        const last = blocks[blocks.length - 1];
        if (last && last.t === 'ul') last.v.push(item);
        else { cur = { t: 'ul', v: [item] }; blocks.push(cur); }
        continue;
      }
      if (/^\d+[.)]\s*/.test(line)) {
        const item = line.replace(/^\d+[.)]\s*/, '');
        const last = blocks[blocks.length - 1];
        if (last && last.t === 'ol') last.v.push(item);
        else { cur = { t: 'ol', v: [item] }; blocks.push(cur); }
        continue;
      }
      if (!intro) { intro = line; continue; }
      const last = blocks[blocks.length - 1];
      if (last && last.t === 'note') last.v += ' ' + line;
      else { cur = { t: 'note', v: line }; blocks.push(cur); }
    }
    if (!title) title = 'SAGE';
    if (!intro) intro = 'Here is what I found.';
    if (!followups.length) followups.push('Tell me more about this', 'Give me a step-by-step plan');
    return { title, intro, blocks, sources, followups, confidence: 0.9, engine: 'live', topic: 'live' };
  };

  AI.answer = function (q) {
    if (AI.isLive()) {
      return AI.askLive(q)
        .then(txt => AI.parseLive(txt))
        .catch(err => {
          S.toast('Live AI unavailable (' + (err && err.message ? err.message : 'error') + ') — using built-in engine');
          return AI.builtin(q);
        });
    }
    return Promise.resolve(AI.builtin(q));
  };

  /* ---------- rendering ---------- */
  AI.blockHTML = function (b) {
    if (b.t === 'h') return '<div class="ai-h">' + S.esc(b.v) + '</div>';
    if (b.t === 'ul') return '<ul class="ai-ul">' + b.v.map(x => '<li>' + S.esc(x) + '</li>').join('') + '</ul>';
    if (b.t === 'ol') return '<ol class="ai-ol">' + b.v.map(x => '<li>' + S.esc(x) + '</li>').join('') + '</ol>';
    if (b.t === 'note') return '<div class="ai-note">' + S.esc(b.v) + '</div>';
    if (b.t === 'kv') return '<div class="ai-kv">' + b.v.map(x => '<div><span>' + S.esc(x.k) + '</span><b>' + S.esc(x.v) + '</b></div>').join('') + '</div>';
    return '';
  };
  AI.tailHTML = function (ans) {
    let h = '';
    if (ans.sources && ans.sources.length) {
      h += '<div class="ai-srcs"><div class="ai-h">Sources</div>' + ans.sources.map(s =>
        '<div class="src">' + S.icon('i-link') + '<div><b>' + S.esc(s.n) + '</b>' +
        (s.u ? '<div class="tiny muted">' + S.esc(s.u) + '</div>' : '') + '</div></div>').join('') + '</div>';
    }
    if (ans.confidence != null) {
      h += '<div class="ai-conf"><span>Confidence</span><i><b style="width:' + Math.round(ans.confidence * 100) + '%"></b></i><em>' + Math.round(ans.confidence * 100) + '%</em></div>';
    }
    return h;
  };
  AI.fuHTML = function (ans) {
    if (!ans.followups || !ans.followups.length) return '';
    return '<div class="ai-fu"><div class="tiny muted">Continue</div>' + ans.followups.map(f =>
      '<button class="qp" data-act="chat-quick" data-arg="' + S.esc(f) + '">' + S.esc(f) + '</button>').join('') + '</div>';
  };
  AI.badge = function (ans) {
    const live = ans.engine === 'live';
    return '<div class="ai-badge' + (live ? ' live' : '') + '">' + (live ? '⚡ Live model' : '◈ SAGE engine') + '</div>';
  };

})(window.SAGE);

```

### `js/screens-onboarding.js`

<!-- Screens: splash, welcome, language, auth, KYC, profile-create | 8470 bytes -->

```js
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

```

### `js/screens-home.js`

<!-- Screens: home, chat (streaming AI, orb states) | 19900 bytes -->

```js
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
    { id: 'logostates', name: 'Logo States', sub: '9 animations', ic: 'i-orbit', g: 'linear-gradient(135deg,#2e86ff,#0b1b3f)' },
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
        <button class="hh-mic" data-act="chat">${S.icon('i-mic')}</button>
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

```

### `js/screens-apps.js`

<!-- Screens: apps, marketplace, jobs, learning, community, files, sell, listing/course detail | 21013 bytes -->

```js
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

```

### `js/screens-system.js`

<!-- Screens: wallet, earn, spark, evolution, premium, fees, settings, aistudio, logostates | 29091 bytes -->

```js
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

```

### `js/screens-lab.js`

<!-- Screens: research, memory, aisettings | 20069 bytes -->

```js
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
      ${S.topNav('Logo States & Animations', 'Nine moods of your execution partner')}
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
        S.toast('Research complete ✓ 12 sources · 7 verified');
        const lvl = S.addProgress(8, 'Research completed');
        if (lvl) S.handleLevelUp(lvl); else S.render(true);
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
        <p>Across 7 relevant pages, 5 were used in the answer; 2 were rejected for low credibility.</p>
        <div class="tiny muted">Preview generated from verified sources only.</div></div>`;
    } else {
      body = `<div class="src-detail-rows">
        ${[['Domain', src.n], ['Type', src.t], ['Pages fetched', src.pages], ['Used in answer', src.used], ['Rejected', src.pages - src.used], ['Status', 'Verified']]
          .map(r => `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--stroke)"><span class="small muted">${r[0]}</span><b class="small">${r[1]}</b></div>`).join('')}
      </div>`;
    }
    return `
      <div class="src-head">
        <span class="src-badge lg" style="background:${src.c};color:${src.dark ? '#111' : '#fff'}">${src.g}</span>
        <div class="grow"><b>${S.esc(src.n)}</b><div class="tiny muted">${S.esc(src.t)}</div></div>
        <span class="pill green">✓ Verified</span>
      </div>
      <div class="src-stats">
        <div><b>7</b><span>relevant pages</span></div>
        <div><b>5</b><span>used in answer</span></div>
        <div><b>2</b><span>rejected</span></div>
      </div>
      <div class="src-tabs">${tabs.map(t => `<button class="${rsDetailTab === t ? 'on' : ''}" data-act="src-tab" data-arg="${t}">${t}</button>`).join('')}</div>
      ${body}`;
  }

  let rsDetailSrc = 'Google';
  S.srcDetail = function (name) {
    rsDetailSrc = name || rsDetailSrc;
    S.sheet(`<h3>Source Detail View</h3><div class="sub">Transparency. Trust. Real data.</div>${sourceDetailHTML(rsDetailSrc)}`);
  };
  S.srcTab = function (t) { rsDetailTab = t; S.srcDetail(); };

  R.research = {
    view: () => {
      const st = S.DATA.RS[rsIdx];
      const playing = rsPlaying;
      return `
      <div class="row between mb8" style="min-height:44px">
        <div><h2 class="screen-title">Research Lab</h2><div class="tiny muted">Idle → Researching → Analyzing → Verifying → Success</div></div>
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
        ${st.title ? `<div class="rs-title">${S.esc(st.title)}</div>` : `<div class="rs-title brand">SAGE</div>`}
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
          <div class="grow"><b class="small">Top Sources</b><div class="tiny muted">12 sources · 7 verified</div></div>
          ${S.icon('i-arrow-r')}
        </div>
        <div class="rs-checks">
          ${['Accurate & relevant information', 'Key points summarized', 'Sources provided'].map(c => `<div><span class="ck">✓</span>${c}</div>`).join('')}
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
        <button class="btn primary sm" style="flex:1" data-act="rs-play">${playing ? '■ Stop' : '▶ Start Research'}</button>
        <button class="btn soft sm" style="flex:1" data-act="rs-fail">⚡ Simulate Failure</button>
      </div>

      <!-- Source panel -->
      <div class="sect-label">Source Panel <span class="tiny">during research · shows where SAGE gets information</span></div>
      <div class="card src-panel">
        <div class="sp-head"><span style="color:var(--electric-2)">‹</span><b class="small">Live Sources</b><span class="tiny muted">12 sources · 7 verified</span></div>
        ${S.DATA.LIVE_SOURCES.map(s => `
        <div class="sp-row" data-act="src-detail" data-arg="${s.n}">
          <span class="src-badge" style="background:${s.c};color:${s.dark ? '#111' : '#fff'}">${s.g}</span>
          <div class="grow"><b class="small">${S.esc(s.n)}</b><div class="tiny muted">${S.esc(s.t)} · ${s.pages} page${s.pages > 1 ? 's' : ''} · ${s.used} used</div></div>
          <span class="pill green">✓ Verified</span>
        </div>`).join('')}
        <div class="sp-row more" data-act="src-all"><span class="src-badge ghost">+</span><div class="grow"><b class="small">More Sources</b></div>${S.icon('i-arrow-r')}</div>
      </div>

      <!-- Source detail (inline) -->
      <div class="sect-label">Source Detail View <span class="tiny">transparency · trust · real data</span></div>
      <div class="card src-detail">${sourceDetailHTML('Google')}</div>

      <!-- Failure sequence -->
      <div class="sect-label">Failure Sequence <span class="tiny">10–30 seconds · visual drama, clear message, easy recovery</span></div>
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
        <div class="grow"><b class="small">Couldn't complete the research.</b><div class="tiny muted">Network or source access interrupted.</div></div>
        <div class="fl-btns">
          <button class="btn xs primary" data-act="rs-fail">Retry</button>
          <button class="btn xs soft" data-act="rs-fail">Try another approach</button>
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
        <span class="pill gold">${st.premium ? 'PREMIUM' : 'BASIC'}</span>
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

```

### `js/screens-agents.js`

<!-- Screens: agent workspace — mission control, agent-market, workflow, integrations | 35235 bytes -->

```js
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

      <div class="sect-label">Agent team · live runs</div>
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
```

### `js/app.js`

<!-- App controller: router, tabbar, desktop mode, action dispatcher | 26864 bytes -->

```js
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
      case 'rs-fail':
      case 'fail-retry': {
        S.closeSheet();
        if (S.currentRoute() !== 'research') S.go('research');
        S.playFailure({ onDone: () => { S.rsJump(4); if (S.currentRoute() === 'research') S.render(true); } });
        break;
      }
      case 'logo-preview': S.previewState(arg); break;
      case 'src-detail': S.srcDetail(arg); break;
      case 'src-tab': S.srcTab(arg); break;
      case 'src-all': S.toast('12 sources · 7 verified · 2 rejected'); break;

      /* --- earning animation (board 3) --- */
      case 'sim-earn': S.closeSheet(); S.playEarning(5000, { source: 'Client Payment' }); break;
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
      case 'gen-image': {
        if (st.spark < 5) { S.toast('Not enough Spark — buy more first'); S.go('spark'); break; }
        const prompt = ((S.$('#gen-prompt') || {}).value || '').trim();
        S.addSpark(-5, 'Image generated');
        S.drawGenerated(prompt);
        st.ownedFiles.push({ name: 'AI_Image_' + (st.ownedFiles.length + 1) + '.png', size: '2.1 MB', when: 'Just now' });
        S.save();
        S.toast('Image generated · −5 Spark');
        const lvl = S.addProgress(4, 'AI image created');
        if (lvl) S.handleLevelUp(lvl);
        break;
      }
      case 'gen-video': {
        const secs = S.$('#vlen') ? +S.$('#vlen').value : 8;
        const cost = 25 + Math.max(0, secs - 4) * 2;
        if (st.spark < cost) { S.toast('Not enough Spark — need ' + cost); S.go('spark'); break; }
        S.addSpark(-cost, 'Video rendered');
        st.ownedFiles.push({ name: 'AI_Video_' + secs + 's.mp4', size: (secs * 1.4).toFixed(1) + ' MB', when: 'Just now' });
        st.earnings.content += 15; st.lifetimeEarned += 15; S.save();
        S.toast('Video rendered ✓ −' + cost + ' Spark · +NPR 15 content reward');
        const lvl = S.addProgress(8, 'AI video rendered');
        if (lvl) S.handleLevelUp(lvl);
        S.go('files');
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
        S.toast(arg === 'live' ? 'Live model selected — add your key below' : 'Built-in SAGE engine active');
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
        S.toast(k ? 'Connection saved ✓ — chat is live' : 'Saved — add an API key to go live');
        break;
      }
      case 'ai-test': {
        if (!S.AI.isLive()) { S.toast('Enter an API key first'); break; }
        S.toast('Testing connection…');
        S.AI.askLive('Reply with exactly: OK')
          .then(t => S.toast('✓ Connected — ' + String(t).trim().slice(0, 40)))
          .catch(e => S.toast('✗ ' + (e && e.message ? e.message : 'connection failed')));
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

```

---

## 8. Binary assets

Referenced by `index.html` / CSS but not inlined here (they are images, not text):

- `img/sage-mark.png` — favicon / app mark
- `img/sage-lockup.png` — brand lockup
- `img/contact.png` — contact graphic

Fonts load from Google Fonts (`Poppins`, `Inter`, `Noto Sans Devanagari`) with system fallbacks;
the app runs fine offline without them.

---

## 9. How to run

This document contains the full source. To run the app, write each §7 section back to its
listed path (`index.html`, `css/styles.css`, `js/*.js`) and serve the folder over HTTP, e.g.:

```bash
python3 -m http.server 8099
# then open http://127.0.0.1:8099/index.html
```

Open in a fresh browser profile to see onboarding (`splash`), or click **Skip** to jump
straight into the app. State persists in `localStorage` per origin.
