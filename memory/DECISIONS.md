# OWNER DECISIONS

This file records explicit durable decisions that affect future work.

## 2026-09-27 — Shared memory contract

Decision:
Build one memory/instruction contract that can be read by both ChatGPT-compatible workflows and SAGE ONE.

Requirements:
- It must describe how the AI should work with the owner.
- SAGE ONE must support owner-scoped personal memory.
- Additional users, if added later, must receive separate user memory scopes.
- Owner preferences must not become global preferences for other users.
- Public GitHub should contain the contract/schema, not private raw conversation history.

## 2026-10-15 — Launch backlog queued (owner request, do not repeat)

Decision:
The owner requested the full security/legal/accessibility/UX/deploy workstream as a QUEUE,
implemented only after the current priority work. It is recorded once, canonically, in
`memory/BACKLOG_SECURITY_LEGAL_LAUNCH.md` (P0 deploy-security → P1 legal pages →
P2 accessibility/content → P3 UX polish → P4 repo hygiene). Do not ask the owner to
restate these items; read that file.

Constraints the owner stated:
- Goal: host the website online on a domain/server without getting hacked.
- Hide API keys; check env vars; protect admin routes; auth + per-user access only;
  sanitize forms; rate limiting; secure endpoints; security headers; debug off;
  update dependencies; remove unused; check exposed files; secure database; hash
  passwords properly; scan git history for leaked secrets; full security audit.
- Legal: privacy policy, terms, cookie policy (+ cookie-consent decision), refund
  policy, form consent, data minimization, analytics/embed inventory, Nepal DPDP
  (Privacy Act 2075) check, flag other risks. Owner's explicit priority: no fines.
- Accessibility/content: alt text, contrast, keyboard-friendly forms, clear button
  labels, no fake reviews, no unsupported claims, business details, image copyright.
- UX (verbatim): vertical scrolling, horizontal scrolling, broken links, mobile menu,
  favicon, page titles, meta descriptions, footer links, custom page photo, copyright
  year, compress images, broken buttons, success messages, error messages, remove
  placeholder text, remove unused navigation, fix mobile overflow, clickable logo,
  clickable phone number, clickable email, every page mobile + desktop optimized.
- Research rule: verify Nepal requirements before assuming foreign rules (cookie
  banner is NOT required for Nepal-only per 2026-10-15 research).
- Nothing deploys or publishes without explicit owner approval.
