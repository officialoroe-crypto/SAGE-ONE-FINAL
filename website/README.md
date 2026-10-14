# SAGE ONE Workspace

The Freebuff-exported SAGE ONE workspace is now the primary website and web workspace. It replaces the former marketing-only landing page; the existing Flutter app remains available under `/app/`, and the FastAPI backend remains the canonical backend.

## Local preview

From the repository root, serve `website/` with a static HTTP server, for example:

```sh
python -m http.server 8080 --directory website
```

Then open `http://127.0.0.1:8080`.

## Live connections currently implemented in code

- Owner Google sign-in through the existing `/identity/config` and `/identity/google` endpoints.
- Live chat through `POST /chat`.
- Explicit queue-last-request action through `POST /command`.
- Google ID token is kept in page memory only, not browser storage.
- Prototype balances and fictional earnings start at zero; fake payment, KYC, generation, and other simulated actions are blocked where wired.

## Deployment

The GitHub Pages workflow publishes this website at `/sage-one/` and the existing Flutter app at `/sage-one/app/`. It syntax-checks the website JavaScript, then runs Flutter analysis/tests and builds the app. A successful source/CI build does not by itself prove live login, API behavior, task completion, or third-party integrations.

## Product rule

This is the new foundation to improve—not a finished product. Every screen, animation, control, data flow, permission, API, and external integration must be audited and tested. Mark a feature complete only after evidence from the actual running app. Never present simulated money, fake research, fake generated media, or unexecuted actions as real.
