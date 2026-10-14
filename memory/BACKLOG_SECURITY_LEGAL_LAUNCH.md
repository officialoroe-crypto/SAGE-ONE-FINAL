# SAGE ONE — Owner-Requested Launch Backlog (SECURITY · LEGAL · A11Y · UX · DEPLOY)

Recorded: 2026-10-15 · Source: owner's explicit request. **This is the canonical queue.**
Rule: work through it in priority order; never mark an item done without repeatable evidence;
never deploy or publish anything without the owner's explicit approval (RULES.md).

Compact reusable prompt for executing this queue: see §7.

---

## P0 — Deploy safely (owner goal: go online on a domain/server without getting hacked)

- [ ] Choose hosting (static site + FastAPI core; Render is current API host) and a domain.
- [ ] Production environment hardening: explicit `SAGE_ENV=production`, debug/docs off
      (FastAPI `/docs`, `/redoc`, `/openapi.json` disabled in prod), verbose errors off.
- [ ] Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
      Permissions-Policy (static host + API proxy both).
- [ ] CORS: current `app/main.py` allows all methods/headers + localhost origins →
      restrict to exact production origin(s), exact methods, no credentials unless needed.
- [ ] Rate limiting on all API endpoints (esp. auth, chat, command).
- [ ] Input validation + length limits on every request model (chat has a draft; others pending).
- [ ] Admin/owner routes: Google-owner auth only (already owner-scoped) + explicit
      role/ownership checks per endpoint; users may only access their own resources.
- [ ] Database: require intentional durable DB config in prod (no silent SQLite fallback);
      backups + restore documented. Hash any password properly (argon2/bcrypt) if password
      auth is ever added — current auth is Google-identity based.
- [ ] Dependency audit: `requirements.txt` has broad ranges + pytest in runtime deps →
      split prod/dev, pin versions, run vulnerability + license scan, update safely.
- [ ] Remove unused/duplicate files; verify no exposed files (.env, .git, source maps,
      internal docs) are served by the static host.
- [ ] Env-var inventory kept current (sibling repo has a redacted inventory draft — reuse).
- [ ] Full security audit report with severity levels + evidence per finding.

## P1 — Legal pages & consent (owner must not face fines)

Nepal research summary (2026-10-15, see §4): core duties are **consent + purpose limitation**
under the Privacy Act 2075; max statutory fine **NPR 30,000** (+ up to 3 yrs). No data-protection
registration required. No cookie-banner mandate for a Nepal-only free service. E-Commerce Act 2081
listing/disclosure duties apply **only if selling**. Draft Personal Data Protection Policy–2082
pending — re-check before any public launch.

- [ ] Privacy Policy page (start from sibling repo `docs/legal-drafts/PRIVACY_POLICY_DRAFT.md`).
- [ ] Terms & Conditions page (draft exists: `TERMS_AND_CONDITIONS_DRAFT.md`).
- [ ] Cookie / browser-storage policy (draft: `COOKIE_POLICY_DRAFT.md`; must cover localStorage
      `sage-one-state-v1` + Google Fonts + Google Identity Services).
- [ ] Refund & Cancellation policy (draft exists; required before any paid feature).
- [ ] Form consent notices wired to real behavior + consent records (draft: `FORM_CONSENT_COPY_DRAFT.md`).
- [ ] Data minimization: only necessary fields; review onboarding/profile phone/address/age fields;
      define retention + deletion process; clear personal state on sign-out/reset.
- [ ] Analytics & third-party embed inventory: currently Google Fonts + Google sign-in only
      (no trackers found 2026-10-15). Decide self-host vs disclose; document each.
- [ ] Cookie consent decision: not legally required for Nepal-only per research, but the
      cookie/storage policy must exist; add a consent banner only if EU/UK users are targeted
      or analytics are added later.
- [ ] If ever selling online: E-Commerce Act 2081 duties — Dept. of Commerce listing,
      business identity/PAN-VAT display, price/cancellation/refund disclosures.
- [ ] Business details on site (operator name, contact, address) once verified.
- [ ] Legal review by qualified Nepal counsel before treating any page as final.

## P2 — Accessibility & content honesty

- [ ] Alt text / ARIA for all meaningful images and icon buttons (SVG orbs: aria-labels).
- [ ] WCAG AA color-contrast check across themes (dark/light/blue).
- [ ] Keyboard-friendly forms: label `for=` associations (scan found 17 labels, 0 `for=`),
      focus order, visible focus rings, Enter-to-submit.
- [ ] Clear button labels everywhere.
- [ ] Remove placeholder copy and "fake" demo content that reads as real
      (placeholder phone/email examples, `hooks.example.com`, `xxx.supabase.co`,
      simulated reviews/ratings/statistics) or clearly label as prototype.
- [ ] Remove unsupported claims (e.g. "99.2% confidence", "+12%", guarantees) unless backed.
- [ ] Check copyright/licensing of every image and font (Google Fonts OK with disclosure).
- [ ] Flag any other legal risks found during the above.

## P3 — UX / polish queue (owner's list, verbatim)

- [ ] Vertical scrolling works correctly on every page/section.
- [ ] Horizontal scroll sections where intended (no accidental horizontal overflow).
- [ ] Fix mobile overflow.
- [ ] Find & fix broken links; fix footer links.
- [ ] Mobile menu (hamburger) for narrow screens.
- [ ] Favicon.
- [ ] Fix page titles per screen.
- [ ] Meta descriptions (+ Open Graph "custom photo" for pages).
- [ ] Copyright year (auto via JS or current year).
- [ ] Compress images.
- [ ] Fix broken buttons.
- [ ] Success messages + error messages for every action.
- [ ] Remove placeholder text.
- [ ] Remove unused navigation entries.
- [ ] Logo clickable → home.
- [ ] Phone number clickable (`tel:`).
- [ ] Email clickable (`mailto:`).
- [ ] Every page optimized for mobile AND desktop (verify at 360px / 768px / 1440px).

## P4 — Repo hygiene (owner-requested checks; quick pass done 2026-10-15)

- [x] Git-history secret scan (quick pass, all commits, common key patterns incl.
      sk-/AIza-/ghp_/xox/PEM): **no live-looking secrets found**. Re-run with a full
      scanner (gitleaks/trufflehog) as part of the P0 audit.
- [x] No .env/credential/key files tracked in the repo.
- [ ] Keep `.gitignore` covering .env, *.pem, *.key, node_modules, build outputs.

---

## 4. Nepal legal research snapshot (2026-10-15, not legal advice)

- Governing law: **Privacy Act, 2075 (2018)** + Regulation 2020. No separate data-protection
  authority; no registration duty identified.
- Duties: consent to collect (s.12), use only for the stated purpose, restrict disclosure
  (s.26); sensitive categories (s.27: caste, politics, religion, health, sexual orientation,
  property) — do not solicit.
- Penalties: up to **NPR 30,000** fine and/or up to 3 years (s.29); compensation via District
  Court (s.31); most complaints within 3 months.
- No general erasure right for private apps identified, but purpose-limitation implies a
  retention schedule + working deletion process.
- No cross-border transfer regime identified — disclose overseas processing (Render, Google,
  AI providers) as transparency best practice.
- No general breach-notification deadline identified — have an incident plan anyway.
- **Cookie banner: not a Nepal requirement** (only GDPR/ePrivacy if EU/UK users targeted).
- If selling: **E-Commerce Act, 2081 (2025)** — Dept. of Commerce listing, business/price/
  refund disclosures. Pending: draft Personal Data Protection Policy–2082 (consultation
  2025-07-25) and IT & Cyber Security Bill 2082 — re-check before launch.
- Sources: DLA Piper Nepal overview; ADB Privacy Act summary; Farsight/Neupane legal
  analyses; Equity Law e-commerce guide; US State Dept 2026 Nepal investment statement.

## 5. Existing resources to reuse (do not rewrite from scratch)

- Sibling repo `officialoroe-crypto/sage-one` already has (commit e83e686, 2026-10-14):
  `docs/legal-drafts/` (Privacy, Terms, Cookie, Refund, Form-Consent drafts),
  `docs/SECURITY_PRIVACY_ACCESSIBILITY_LAUNCH_CHECKLIST.md` (real code-inspection findings:
  CORS looseness, missing headers, missing input bounds, SQLite fallback, localStorage
  retention, 17 labels/0 for=, broad requirements.txt),
  `docs/SECURITY_ENVIRONMENT_VARIABLE_INVENTORY.md` (redacted).
- CI smoke evidence exists there too (Actions runs 38617788443 / 38617788746) — read-only
  health checks + 16 Playwright tests (mocked API; not production proof).

## 6. Risks flagged 2026-10-15

1. **Repo divergence (highest process risk):** `sage-one` main is actively developed in
   parallel (Chat History/Activity Center in `app/main.py` + `website/js/*`, voice command
   safety #257, self-repair/QA automation). Its `backend.js` is 358L vs our 182L,
   `screens-home.js` 495L vs 387L, `app.js` differs by ~299 lines; it does **not** have
   `website/js/voice.js`. Two repos evolving the same files will conflict. Decide one
   canonical repo and port changes deliberately.
2. Public repo (`public`) — keep secrets and personal data out permanently.
3. `sage-one-bot` repo exists with initial commit only — define its purpose before use.
4. Prototype screens (payments, KYC, marketplace) must stay clearly labeled until real
   integrations exist — misrepresenting availability is the actual consumer-law risk.
5. Re-check Nepal draft DPDP policy before launch.

## 7. Compact master prompt (paste anywhere to run this queue)

> SAGE ONE — SECURITY & COMPLIANCE LAUNCH PASS. Scope: `website/` static frontend +
> FastAPI core. Order: (1) SECURITY: env-var inventory with no secrets in repo/history;
> CORS restricted to explicit production origins; owner/admin auth + per-user ownership
> checks on every endpoint; input validation and length limits; rate limiting; security
> headers (CSP/HSTS/X-Frame/options); debug & API docs off in production; pin and update
> dependencies (split prod/dev); remove unused files and exposed paths; require durable DB
> config in prod; password hashing if password auth exists; full audit report with
> severity + evidence. (2) LEGAL: publish Privacy Policy, Terms, Cookie/Storage Policy,
> Refund Policy pages from the reviewed drafts; add form consent wired to real behavior;
> minimize collected data with retention/deletion defined; inventory analytics and embeds;
> Nepal Privacy Act 2075 = consent + purpose limitation (max fine NPR 30,000), cookie
> banner not required unless EU/UK users or analytics added; E-Commerce Act 2081 only if
> selling. (3) ACCESSIBILITY: alt/ARIA text, WCAG AA contrast, keyboard navigation,
> label-for associations, clear button labels. (4) CONTENT & UX: remove placeholders,
> fake reviews and unsupported claims; add business details; auto copyright year; favicon,
> per-page titles and meta descriptions; clickable logo/tel:/mailto:; success and error
> messages; compress images; fix broken links/buttons, footer links, mobile menu, mobile
> overflow; verify every page at 360px/768px/1440px. Rules: mark each item
> Specified/Implemented/Tested/Blocked with repeatable evidence; never claim PASS without
> evidence; never deploy or publish without the owner's explicit approval.
