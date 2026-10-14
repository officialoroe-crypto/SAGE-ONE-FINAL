# Freebuff workspace → canonical SAGE ONE rebuild

Date: 2026-10-14
Source archive: user-uploaded export of the Freebuff-created SAGE ONE website/app
Source repository recorded in archive: `officialoroe-crypto/SAGE-ONE-FINAL`
Canonical target: `officialoroe-crypto/sage-one`

## Owner direction

The imported workspace replaces the former marketing-only website. The user wants this as the primary SAGE website and app experience, then wants its animations and every feature made genuinely functional. Do not stop at a frontend copy.

## Architecture

- `website/index.html`, `website/css/`, `website/js/`, and `website/img/` are the new web workspace.
- `frontend/` remains the existing Flutter app, published at `/sage-one/app/`.
- Existing FastAPI identity, chat, tasks, research, workflows, memory, and provider infrastructure remain the canonical backend. Do not delete or rewrite the backend as part of replacing the old marketing page.
- The imported workspace connects Google owner identity, chat, and explicit task queueing through the existing API.
- The former marketing-only landing page assets and temporary `website/workspace/` staging folder are removed by this branch.

## Connected code paths (not yet production-verified)

| User action | API | Proof still required |
|---|---|---|
| Load identity configuration | `GET /identity/config` | Live response and Google client configuration |
| Google owner sign-in | `POST /identity/google` | Real owner account returns `owner_mode: true` |
| Chat | `POST /chat` | Real response in browser and durable session behavior |
| Queue task | `POST /command` | Real task ID, worker execution, and visible final result |

## Rebuild / improvement work still required

1. **Run and inspect:** deploy preview, test phone/desktop layouts, inspect console/network, capture every route and transition.
2. **Animations:** inventory every animation, loading state, hover/press state, scene/canvas effect, modal transition, error/success animation, reduced-motion behavior, and mobile performance; fix broken or fake ones.
3. **Feature audit:** inventory every control and workflow by screen; distinguish working, partial, prototype, blocked, and broken.
4. **Real backend contracts:** connect each feature to existing API capabilities where appropriate; add missing backend endpoints, persistence, authorization, and tests instead of inventing fake success.
5. **Real providers:** image/video/voice/research and third-party services must use supported providers, keep secrets server-side, disclose limits/costs, and produce verifiable outputs. Never label a prompt or canvas mock as a generated file.
6. **Financial/identity safety:** no fictional balances or earnings; no fake KYC; no purchases/transfers/withdrawals until a real authorized ledger/provider and audit trail exist.
7. **End-to-end proof:** owner sign-in → chat → task queued → worker completed → actual result visible; test every remaining workflow separately.
8. **Release:** run JS syntax checks, Python tests, Flutter analyze/tests, Pages build, then live browser/mobile tests. Do not merge/release based on a plan alone.

## Verification state

- Workspace source is staged for replacement of the former website: **in this PR branch**.
- Owner identity/chat/task bridge: **implemented in code, not yet live E2E-verified**.
- Website and Flutter CI: **must pass for the final head commit**.
- Live deployment, all animations, every feature, real media/research, task-worker completion, persistent production database, and physical Android behavior: **not yet verified**.
