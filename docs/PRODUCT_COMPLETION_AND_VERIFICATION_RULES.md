# SAGE ONE — Product Completion & Release Verification Rules

**Status: OWNER-APPROVED RULESET — 2026-10-13**  
**Purpose:** Prevent features, phases, builds, or releases from being called complete based only on documentation, partial code, a green CI run, or an old deployment.

## 1. The core rule

**We verify the actual latest product, not the plan, the claim, or an outdated build.**

A requirement written in GitHub is not an implemented feature. Code existing in a branch is not proof that it works. A passing unit test is not proof of end-to-end behavior. A successful deployment is not proof that the latest intended feature is present or works on the target device.

Every status claim must have evidence appropriate to that status. If evidence is missing, the status stays unverified and the gap stays open.

## 2. Mandatory feature status vocabulary

Track each capability independently. Do not collapse these states into one “done” checkbox.

| Status | Meaning | Minimum evidence |
|---|---|---|
| **Planned** | The need is recorded, but detailed behavior may not yet be defined. | Requirement or backlog entry. |
| **Specified** | Expected behavior, boundaries and acceptance criteria are documented. | Link to a specification and its acceptance checklist. |
| **Implemented** | Relevant code exists in the identified commit/branch. | Code paths/files and commit or PR reference. |
| **Connected** | UI, API, services, storage, provider/platform APIs and state are wired as required for the feature. | Traced end-to-end path; no fake/mock-only substitute for a required real integration. |
| **Tested** | Relevant automated and/or manual tests were actually run. | Test command/suite, result, date/context and failures. |
| **Verified** | Acceptance criteria passed in the declared target environment/device/build. | Environment/build identity, test steps, observed outcome and remaining limitations. |
| **Released** | The verified change is included in the identified intended release/deployment. | Release/deployment identifier and commit/build mapping. |
| **Deferred** | Deliberately postponed. Still open; not complete. | Reason, owner/decision, dependency if any, and next action. |
| **Blocked** | Cannot currently progress because of a named issue/dependency. Still open. | Specific blocker, evidence, responsible party and next action. |
| **Failed** | A test or acceptance criterion did not pass. | Reproduction, failure evidence and follow-up item. |

A feature can be implemented but not connected; connected but not tested; tested in a simulator but not verified on a physical device; verified in staging but not released. Report the exact state.

## 3. Every feature needs a traceable verification record

For each meaningful capability, record:

- Feature name and user-visible outcome.
- Link to the canonical requirement/specification.
- Acceptance criteria and their individual pass/fail/not-tested states.
- Current status from the vocabulary above.
- Relevant source branch, PR, commit SHA and code paths.
- Frontend, backend, API, database, provider and permission dependencies.
- Automated test commands and actual results, including failures.
- Manual steps and observed result where automated coverage is insufficient.
- Target platform/device, OS/browser, app/build version and environment.
- For live deployments, deployment URL/environment, deployment identifier if available, and the commit/build actually running.
- Known limitations, deferred work, blockers and next action.
- Last verification date and who/what performed the check.

Do not invent evidence. If a field cannot be checked, say **unknown / not verified**.

## 4. Latest-product verification gate

Before saying “the latest product works,” “release complete,” or “phase complete,” establish which exact artifact is being evaluated.

1. **Identify the source of truth.** Check the current default branch, relevant PR/merge status, commit SHA, working-tree changes where accessible, and canonical project-state/backlog documents. Never assume a remembered branch or an earlier chat reflects the current repository.
2. **Identify the actual artifact.** Determine the deployed commit/build or the APK/AAB/web artifact being tested. A newer source commit does not prove a newer deployment exists.
3. **Check deployment freshness.** Confirm that the intended latest commit is present in the target environment. If deployment identity cannot be established, report deployment freshness as unverified.
4. **Run automated gates.** Execute relevant unit, integration, static-analysis, build, security/configuration and CI checks. Report the exact results; “CI green” applies only to the checks actually run.
5. **Run end-to-end paths.** Trace the user's real journey through UI → authentication/authorization → API → business logic/provider → persistence or result → UI. Check loading, empty, error, retry, cancellation, permission-denied, timeout and restart behavior where applicable.
6. **Test on declared targets.** Check the supported browsers, desktop/mobile platforms, and physical devices that the feature claims to support. Simulator results must not be described as physical-device verification.
7. **Audit the actual interface.** Check routes, buttons, links, forms, navigation, voice/screen states, accessibility, responsive layout and important visual states. A static visual prototype is not a connected product.
8. **Verify security and user control.** Check authorization boundaries, consent/permission prompts, stop/revoke controls, privacy/retention expectations and approval gates for consequential actions.
9. **Reconcile open work.** Compare the specification and backlog with the actual code/tests. List missing, deferred, blocked, failed, mocked, disconnected and unverified capabilities.
10. **Publish an honest verdict.** State the tested commit/build, environment/device, checks passed/failed/not run, open gaps, and whether the result is verified for the stated scope. Never generalize one passing test into “everything works.”

If a live environment or device cannot be accessed, complete the checks that are possible and explicitly list what remains unverified. Do not imply that a test was performed when it was not.

## 5. Phase and milestone exit rules

A phase cannot be labelled simply **Complete** while any required capability in its agreed scope is planned, specified-only, partially implemented, disconnected, untested, failed, deferred, blocked or unverified.

If the owner explicitly accepts a reduced scope, report it as **“Complete for the agreed limited scope; listed items remain open”**—not as full product completion. Keep those items in the backlog with their original requirements intact. A later phase must not erase them or silently redefine the original phase.

A green CI run is one evidence item, not a substitute for feature acceptance or target-device verification. Documentation-only PRs complete a documentation task, not the runtime feature they describe.

## 6. New-conversation / handoff rule

At the beginning of each new SAGE ONE engineering conversation, the assistant must:

1. Read [SAGE_PROJECT_MEMORY.md](./SAGE_PROJECT_MEMORY.md), this ruleset, the [Foundational Product Vision](./FOUNDATIONAL_PRODUCT_VISION.md), and the relevant feature specification.
2. Check the current repository state, current branch/default branch, latest relevant PRs/commits, project-state/backlog and known blockers using available tools before claiming current status.
3. Carry forward owner-approved requirements and unresolved items from prior chats. Treat chat summaries as pointers, not stronger evidence than the repository.
4. State what is actually verified versus merely documented, implemented, tested, deferred or unknown.
5. Before closing a task or phase, update the canonical backlog/project-state record with the outcome, evidence, remaining gaps and next action.
6. Never mark an entire phase complete merely because the current conversation's assigned coding task is finished.

The owner may say **“Save this in SAGE memory”** or **“Run the latest-product verification gate”** to reinforce this workflow. These phrases do not replace the automatic requirement to consult canonical project memory at the start of a new engineering conversation.

## 7. Final report template

Every major milestone/release report should include:

- **Scope:** what was supposed to change.
- **Source:** branch, PR, commit SHA.
- **Artifact tested:** build/release/deployment identifier and target environment.
- **Automated checks:** exact suites/commands and pass/fail/not-run.
- **End-to-end checks:** scenarios tested and outcomes.
- **Target verification:** devices/browsers/platforms actually checked.
- **Status by capability:** specified / implemented / connected / tested / verified / released / deferred / blocked / failed.
- **Open gaps:** each gap, why it remains open, and next action.
- **Verdict:** verified for the stated scope, partially verified, or not verified.

## 8. Non-negotiable honesty rule

Never claim access to a repository, device, deployment, log, or test result that was not actually inspected. Never say a capability is live because a specification exists. Never delete or downgrade an owner-approved requirement just to make a milestone appear green. When unsure, say what is unknown and how it can be verified.
