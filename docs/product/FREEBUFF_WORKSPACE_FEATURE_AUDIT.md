# Freebuff Workspace — Feature and Animation Audit

Status date: 2026-10-14
Scope: the imported Freebuff-created SAGE ONE web workspace now intended to replace the former marketing-only website.

This is an initial source-code inventory, not a claim that every listed screen was run in a browser. Status must be updated only after reproducible evidence is recorded.

## Status definitions

- **Connected in code / not verified:** an API call exists, but real runtime success has not been demonstrated.
- **Visual implementation / not tested:** the screen or animation exists in source; behavior, responsiveness, timing, accessibility, and console health still need testing.
- **Prototype / blocked:** the screen can be viewed, but the action is not allowed to pretend it completed a real operation.
- **Not implemented / needs discovery:** no verified implementation has been established yet.

## Screen inventory

| Area | Source module | Current assessment | Work required |
|---|---|---|---|
| Onboarding and sign-in | `screens-onboarding.js`, `backend.js` | Google owner sign-in connected in code; not runtime verified | Test OAuth origin, owner identity, errors, cancel/retry, session expiry and sign-out |
| Home / dashboard | `screens-home.js` | Visual implementation; some sample cards/actions remain | Replace fictional data with backend data or label examples; verify all links and responsive layout |
| Chat | `app.js`, `ai.js`, `backend.js` | Core chat connected in code; not runtime verified | Verify real response, session persistence, empty/error/timeout states, follow-up and task queue |
| Research Lab | `screens-lab.js`, `components.js` | Research UI is prototype; failure animation can be previewed without claiming research ran | Connect actual research/task API, source retrieval, citations, progress, retry/cancel, verified output and real error states |
| Marketplace / listings | `screens-apps.js` | Catalog UI; checkout is blocked until a real backend/payment flow exists | Real listings, owner-scoped persistence, validation, seller publishing, purchase consent and receipts |
| Jobs / opportunities | `screens-apps.js` | Catalog UI; applying is blocked until connected | Verified listings, source links, application persistence and actual submission status |
| Learning / courses | `screens-apps.js` | Course UI; enroll/completion actions are blocked until connected | Real course content, progress persistence and completion evidence |
| Community / events | `screens-apps.js` | UI present; sample interactions need audit | Real groups/events or clearly labelled local-only preview |
| Files / artifacts | `screens-apps.js` | UI present; upload/open interactions need audit | Actual upload/download, storage permissions, progress and file integrity |
| AI tools / image generation | `screens-apps.js`, `ai.js` | Real generation not connected; fake generation is blocked | Provider adapter on backend, supported provider, output file/artifact, job status, quota/cost disclosure and retry |
| Video studio | `screens-apps.js` | Real render not connected; fake render is blocked | Real render job, progress, cancellation, downloadable video and playback verification |
| Wallet / Spark / earnings | `screens-system.js`, `components.js` | Financial actions blocked; preview animation must not change balances | Real authorized ledger/provider, idempotency, audit log, reconciled balance, transaction history and consent |
| Evolution / level transitions | `screens-system.js`, `components.js`, `core.js` | Visual transitions exist; progression is currently local state | Test every stage/level transition and persistence; separate preview from verified progress |
| Profile / settings / language | `screens-system.js`, `core.js` | Local settings exist; account persistence needs backend connection | Per-user server persistence, export/delete, language behavior and isolation |
| Memory | `screens-lab.js`, backend memory APIs | UI/privacy copy needs audit; full sync not verified | Consent-first backend storage, inspect/edit/delete/export, disable control and owner/user isolation |
| Agents | `screens-agents.js` | Agent catalog/workflow UI; hiring/run actions are blocked until connected | Real agent catalog, approval gates, durable run records, tool permissions, logs and result verification |
| Workflows | `screens-agents.js` | Visual workflow builder; execution not verified | Persist graphs, validate nodes/edges, run through task worker, cancellation, retries, audit trail and actual outputs |
| Integrations | `screens-agents.js` | Connector UI; integration tests are blocked until backed by real adapters | OAuth/token vault, scopes, revoke, health checks, error handling and least-privilege access |
| Desktop/mobile views | `index.html`, `styles.css`, `app.js` | Responsive layouts and view toggle exist in source | Test narrow phones, tablets, desktop, keyboard, zoom, orientation, safe areas and touch targets |

## Animation inventory to verify

The source contains or references these animation families. Each must be exercised on desktop and mobile, including interruption, reduced motion, and failure paths.

- Cosmic backdrop: canvas stars, nebula layers, moon, mountain scene and parallax/motion.
- Brand/logo: S mark, orbiting sphere/coin, logo state previews and hover/press feedback.
- Navigation: onboarding transitions, phone/desktop mode toggle, tabs, side navigation, back navigation and route transitions.
- Chat: orb idle/thinking states, typing/streaming presentation, send/receive, empty/error state and recovery.
- Research: progress stages, source/result transitions, failure sequence, retry/close and cancellation.
- Earnings: seven-stage and short earning animation; **preview mode must never change balance, earnings, or evolution progress**.
- Evolution: stage/level previews, nine-step transition, color/theme shifts and progress changes.
- Agents/workflows: node selection, add/delete/disable, run state, progress and error feedback.
- Overlays: sheets, modals, toast notifications, success/error overlays, particles/bursts and skip controls.
- Media tools: upload, render/generation progress, cancellation, result reveal, failure and download once real backend jobs exist.

## Mandatory verification procedure

For each screen and each animation, record:

1. Screen/action and expected result.
2. Device/browser, viewport size, date, build/commit.
3. Actual click/touch/keyboard steps and observed output.
4. Console errors and failed network requests.
5. API request/response, authorization boundary and persistence evidence when applicable.
6. Animation timing, completion, interruption/skip, repeated use and reduced-motion behavior.
7. Failure/timeout/offline behavior and whether it falsely reports success.
8. Status: Planned, Specified, Implemented, Connected, Tested, Verified, Released, Deferred, Blocked or Failed.

A green CI run proves only the checks it ran. It does not prove live API, OAuth, payment, research, media generation, animation quality, or mobile behavior.

## External software and platforms

Use official APIs/SDKs, open-source components with compatible licenses, or user-authorized integrations. Do not copy proprietary code/assets, expose provider secrets in browser code, bypass platform controls, or claim a connector works before authentication and end-to-end verification.

## Current verified boundaries

- The imported workspace is staged as the primary website in this PR branch.
- Google owner identity, chat, and explicit task queue calls are connected in code, but live end-to-end behavior is not yet verified.
- Browser-side OpenAI/Gemini API calls and browser-stored provider-key configuration have been removed from the imported AI module; live inference is intended to go through SAGE Core.
- Payment and research animation previews are separated from real money/progress/research operations.
- Everything else must remain marked partial/prototype until its own test evidence exists.
