# SAGE ONE — Traceable Implementation Plan

> Maps the agreed product vision and master prompt onto the **actual code in this
> workspace**, using only evidence that was inspected in this session. Every capability
> carries a status, a file/line reference (or an explicit "no code"), the gap, and the
> next action. Nothing is marked working on the strength of a plan or a document.

---

## 0. Evidence base — what was actually inspected

**This workspace contains the static web prototype only.** Verified this session:

| Present | Absent (verified by directory listing + search) |
|---|---|
| `index.html` (13,293 B), `css/styles.css` (97,894 B), 11 JS modules (`core`, `data`, `components`, `ai`, 6× `screens-*`, `app`), `img/` × 3, `tools/make_logo.py`, generated `SAGE-ONE-SOURCE.md` | Git repository · `docs/` · `TODO.md` · PRs #237/#240 · Flutter app · Python/FastAPI backend · any database · any server code · CI · deployment config |

Consequences for this plan:

- The GitHub repo, its PRs, `SAGE_PROJECT_MEMORY.md`, and the Flutter/FastAPI stack
  **cannot be inspected from here** and are marked 🚫 **UNVERIFIABLE-HERE**. This plan
  does not claim anything about them.
- Everything below is assessed against **this codebase**, which is a browser-only,
  `localStorage`-persisted SPA with no backend. Its realistic ceiling is the
  **UI-prototype** rung of the vision's ladder — it cannot reach CONNECTED/VERIFIED for
  anything that requires a server, a real provider account, or a device permission.

**Status taxonomy** (vision §20 ladder, extended for prototype reality):

| Status | Meaning |
|---|---|
| ✅ VERIFIED-LOCAL | Real mechanism, works in the browser, tested this session |
| 🟠 PARTIAL | Real but limited (needs user-supplied key / single provider / etc.) |
| 🟡 UI-PROTOTYPE | Screen and flow exist; the behavior is simulated |
| ⛔ ABSENT | No code for this capability exists in this workspace |
| 🚫 UNVERIFIABLE-HERE | Belongs to the GitHub/backend/Flutter side; no evidence obtainable from this workspace |

---

## 1. Capability traceability table

### A. SAGE as companion (vision §1)

| Capability | Status | Local evidence | Gap | Next action |
|---|---|---|---|---|
| Text conversation + streaming | ✅ VERIFIED-LOCAL | `js/ai.js` built-in engine; time-based stream reveal `js/screens-home.js` (`startStream`) | No backend; answers are local-engine or user-key LLM | Keep; route through a command path shared with voice (P1) |
| Nepali / English UI | ✅ VERIFIED-LOCAL | `S.DATA.I18N` (en/ne) in `js/data.js`; `S.t()` in `js/core.js` | Speech support absent; mixed-language QA not done | Add ne/en coverage checks per screen (P1) |
| Live LLM (user key) | 🟠 PARTIAL | `js/ai.js:631,641` — real `fetch` to OpenAI-compatible `/chat/completions`, openai + gemini | Key lives in `localStorage` (`sage-ai-cfg-v1`); single provider family | Keep for prototype; keys must move server-side for any real build (P4 contract) |
| Voice STT / TTS / wake word | ⛔ ABSENT | **Zero** occurrences of `SpeechRecognition`, `speechSynthesis`, `mediaDevices`, `MediaRecorder` anywhere | Entire voice stack missing | P1: browser `speechSynthesis` + `webkitSpeechRecognition` prototype with honest unavailable states |
| "SAGE, stop" | ⛔ ABSENT | No voice session to interrupt | — | P1: `speechSynthesis.cancel()` + AbortController on the request path |
| Floating pet / orb states | 🟡 UI-PROTOTYPE | 11 CSS orb states incl. listening/thinking (`S.stateOrb`, `LOGO_STATES` in `data.js`) | Purely decorative; no link to real activity | Wire orb states to real task/voice events when P1 lands |
| Consent-based memory | ⛔ ABSENT | Chat capped at 30 messages (`chatPush` in `screens-home.js`); no memory model | No inspect/edit/delete memory system | P4 contract must define memory service; UI review screen later |

### B. SAGE as eyes & hands (vision §1A/§1D)

| Capability | Status | Local evidence | Gap | Next action |
|---|---|---|---|---|
| Screen help (read screen, understand, assist) | ⛔ ABSENT | No `getDisplayMedia` / `mediaDevices` usage anywhere | No capture, no OCR/vision, no session model. PR #240 is 🚫 UNVERIFIABLE-HERE and even there was doc-only | P2: browser `getDisplayMedia` → single frame → in-memory context → live-key vision call; honest stop/revoke indicator |
| Android MediaProjection screen help | 🚫 UNVERIFIABLE-HERE | No Flutter/Android code in this workspace | Requires the mobile repo + real device QA | Route to backend/mobile repo; do not claim |
| Device control (`computer.*` / `phone.*` / `file.*`) | ⛔ ABSENT | No permission model of any kind | — | P4 contract defines the permission vocabulary; enforcement is backend work |
| Permission & approval engine | ⛔ ABSENT | Dispatcher `S.act` (`js/app.js:153`) routes any click to any action; no risk tiers, no grants | Every action is callable; hiding buttons is the only "control" | P3 introduces the first real approval gate (message send); full engine = backend |

### C. SAGE as worker (vision §1B)

| Capability | Status | Local evidence | Gap | Next action |
|---|---|---|---|---|
| Research | 🟡 UI-PROTOTYPE | Staged progress simulation (`rsPlay`, `RESEARCH_STEPS` in `js/screens-lab.js`/`data.js`); source list is seeded data | No real search/fetch of sources; no citations from the web | Honest labeling (P0); real search needs a backend or provider key (P4) |
| AI Studio — image | 🟡 UI-PROTOTYPE ⚠️ | `gen-image` (`js/app.js:361`) charges 5 Spark then calls `S.drawGenerated` (`js/screens-apps.js:317`) — a **canvas gradient doodle** — and toasts "Image generated" | Claims a generated artifact that no model produced (violates vision §13 honesty rule) | P0: relabel as "demo artwork"; P-later: route to a real ImageProvider (ComfyUI adapter or user-key API) |
| AI Studio — video | 🟡 UI-PROTOTYPE ⚠️ | `gen-video` (`js/app.js:371`) charges 25+ Spark, pushes a **fake `.mp4` entry** into `ownedFiles`, pays "+NPR 15 content reward", toasts "Video rendered ✓" — **no artifact of any kind is produced** | Fabricated artifact + fabricated earnings (violates vision §13 and §15) | **P0 (highest priority): remove the false file entry and the fake reward** |
| Workflow builder | 🟡 UI-PROTOTYPE | Drag/drop canvas, SVG edges, node inspector, `wfRun` lights nodes on a timer (`js/screens-agents.js`) | Run executes nothing; no engine behind the graph | Keep as visual builder; execution belongs to the backend task engine (P4) |
| File management | 🟡 UI-PROTOTYPE | `FILES` catalog + local `ownedFiles` list; upload button shows a toast | No real storage; fake video entry pollutes the list (see above) | Fix with P0; real storage needs backend (P4) |
| Tasks / background jobs | 🟡 UI-PROTOTYPE | `AGENT_RUNS` ticker with progress simulation (`js/screens-agents.js`) | No durable worker, no persistence of run state beyond seed | P4 contract: task states + worker API |

### D. SAGE as earning assistant (vision §1C, §15)

| Capability | Status | Local evidence | Gap | Next action |
|---|---|---|---|---|
| Marketplace | 🟡 UI-PROTOTYPE | Seeded listings, filters, buy flow that moves demo Spark (`js/screens-apps.js`) | All inventory is fictional; payments are labels only ("fonepay" method, no processor) | P0: mark demo data clearly |
| Jobs & learning | 🟡 UI-PROTOTYPE | Seeded `JOBS`/`COURSES` catalogs, apply/enroll against local state | No real listings or providers | Keep as UX proof; data source needs backend |
| Sales engine (leads, audits, outreach) | ⛔ ABSENT | Nothing in this workspace | — | Needs backend research providers; **not buildable here** |
| Earnings analytics | 🟡 UI-PROTOTYPE ⚠️ | `creditEarning` ledger (`js/core.js:95`), but state **seeds** `lifetimeEarned: 24500` and four seeded earning buckets | Fabricated history presented as the user's own (violates vision §15/§16 honesty) | P0: reseed to zero or label as demo |

### E. Platform layer (vision §12, §16, §17)

| Capability | Status | Local evidence | Gap | Next action |
|---|---|---|---|---|
| Auth | 🟡 SIMULATED | `auth-continue` / `auth-google` (`js/app.js:224,234`) write a name and toast "OTP verified" | No real authentication of any kind | 🚫 Real auth = backend repo; here, label as demo |
| Spark | 🟡 LOCAL-ONLY ⚠️ | `DEFAULTS.spark = 2580` (`js/core.js:22`); balances move only in `localStorage` | Vision §16: new accounts start at **zero**; server-verified ledger absent | **P0: reseed to 0** (or document the deviation explicitly) |
| Evolution | ✅ VERIFIED-LOCAL | 13 stages × low/mid/high; progress only via `addProgress` (skill), never money (`js/core.js:69`) | Local only | Keep — this matches the vision's design |
| AI provider routing | 🟠 PARTIAL | openai/gemini toggle in AI settings (`ai-provider` case); integration probes for 6 services | No router, no health/cost/latency selection, no Image/Video/Voice providers | P4 contract defines the provider interfaces |
| Integration credentials | 🟠 REAL-PROBE ⚠️ | `TESTS` map makes **genuine network calls** (openai, telegram, discord, supabase, github, webhook) with honest 401s — verified live this session (`js/screens-agents.js:395,432`) | Keys stored in `localStorage` — acceptable for a local demo, violates vision §12 ("keys on the server") for any real build | Keep for prototype; P4 moves secrets server-side |
| Developer Mode | ⛔ ABSENT | — | — | Backend/GitHub-side; 🚫 UNVERIFIABLE-HERE |
| Offline / PWA | ⛔ ABSENT | No `serviceWorker` | — | Optional later batch |
| Audit logs | ⛔ ABSENT | — | — | P4 contract |

---

## 2. Blocking findings — the code violates the vision's own honesty rules

These are **proven with line numbers** and are the cheapest, highest-value fixes available,
because the master prompt's first principle is "never fabricate":

| # | Finding | Evidence | Fix |
|---|---|---|---|
| F1 | `gen-video` records a video file that was never produced and pays a fabricated NPR reward | `js/app.js:371-386` — `ownedFiles.push({name:'AI_Video_…mp4'})`, `earnings.content += 15`, toast "Video rendered ✓" | Remove the fake entry + reward; show "Video generation needs a configured provider" |
| F2 | `gen-image` claims "Image generated" for a random canvas gradient | `js/app.js:361-370` + `js/screens-apps.js:317-337` (`drawGenerated`) | Relabel "Demo artwork (no provider configured)" |
| F3 | New accounts seed with 2,580 Spark; vision §16 says start at zero | `js/core.js:22` | Reseed `spark: 0` (demo grant must be explicit, not silent) |
| F4 | State seeds `lifetimeEarned: 24500` + four earning buckets presented as user history | `js/core.js:23-24` | Reseed to zero or badge the wallet as demo data |
| F5 | Every API key lives in `localStorage` | `js/ai.js:9` (`sage-ai-cfg-v1`), `cfg()` in `js/screens-agents.js` | Acceptable only while the app is purely local; P4 contract requires server-held secrets |
| F6 | No risk tiers or approvals — any click executes any action | `S.act` dispatcher, `js/app.js:153-538` | First real gate arrives with P3 (message sending); full engine is backend work |

---

## 3. Prioritized batches — adapted to what is actually buildable here

The vision's §7 ordering assumes the backend repo. Adapted to **this workspace** (browser
only, user-supplied LLM key, no server), the highest-value buildable order is:

### P0 — Honesty & demo-data pass (½ day, no dependencies)
Fix F1–F4. Add a persistent "DEMO DATA" badge on wallet, marketplace, research sources,
agent runs, and files. Remove fabricated artifacts and rewards.
**Acceptance:** no UI claims an artifact that doesn't exist; new profile shows 0 Spark and
0 earnings; video generation shows an honest provider-needed state; all existing screens
still render; zero console errors (re-run the full route sweep used this session).

### P1 — Voice loop v1 (1–2 days, browser-only)
`speechSynthesis` TTS for the AI reply; `webkitSpeechRecognition` STT where available
(Chrome), with an explicit "voice unavailable in this browser" state elsewhere. Distinct
states: listening / thinking / speaking / unavailable. "SAGE, stop" cancels speech and
aborts an in-flight request. Nepali voice replies when the conversation is Nepali (locale
from `state.lang`).
**Acceptance:** speak → text appears in chat → answer streams → is spoken aloud; stop
cancels within 300 ms; Firefox/Safari show honest unavailability instead of dead buttons;
orb states reflect real voice states.

### P2 — Screen help v1 (2–3 days, browser-only)
`getDisplayMedia` permission flow (real browser prompt), capture one frame per question,
keep it **in memory only** (never `localStorage`), send to the configured live key as a
vision message (Gemini multimodal or OpenAI vision), render the answer with an
active-sharing indicator and a stop/revoke control that ends capture. If no key: honest
"configure a provider key in AI Settings" state — no fake analysis.
**Acceptance:** sharing only starts after the real permission grant; indicator visible
while active; stop ends the track (verified via `track.state`); frames never persisted;
denied permission produces a clear message; follow-up questions reuse the in-session frame.

### P3 — Messaging v1 via the webhook connector (2–3 days)
The only real sending channel available here is the **webhook integration** (already
proven live). Build: incoming-summary placeholder → draft → **approval screen showing
recipient + exact content** → send through the configured webhook → log the actual HTTP
result. Automation toggle OFF by default; no scraping, no platform connectors.
**Acceptance:** nothing is ever sent without the approval screen; the logged result is the
real HTTP status; disable switch immediately blocks sending.

### P4 — Backend contract handoff (documentation, 1 day)
Write `docs/API-CONTRACT.md` for the FastAPI repo: permissions vocabulary
(`computer.read`…), task states, provider interfaces (Text/Image/Video/Voice/Vision/
Action/Research), memory service, approval engine, audit events, secret handling.
**Acceptance:** every ⛔/🚫 row in §1 has a named endpoint/surface in the contract, so the
backend repo can implement against it.

### Explicitly NOT buildable in this workspace (route to the backend/mobile repos)
Flutter app · real auth + database · Android MediaProjection · scheduled workers ·
SMS/email/messaging-platform connectors · ComfyUI or any server-side provider hosting ·
Developer Mode against GitHub · server-side permission enforcement · the PR #237/#240
work (UNVERIFIABLE-HERE — re-verify from the repo before quoting their status anywhere).

---

## 4. Traceability going forward

This table is the living STATUS register. Per vision §20, each row already carries:
requirement → local evidence → status → gap → next action. When work lands, update the
row with the date, the batch, and the verification actually performed (route sweep, live
network test, permission-flow test) — never with an intention. If/when the GitHub repo is
accessible from an agent session, reconcile this plan against `TODO.md`, PR #237 and
PR #240 first, and record their real status before changing any capability's rung.

---

*Generated 2026-10-14 from an in-session audit of this workspace. Every file/line reference
was read during the session; no claim in this document rests on the vision text alone.*
