# SAGE ONE Engineering Conversation — Start Here

Every new SAGE ONE engineering conversation must begin by checking the current source of truth, not trusting a prior chat's claim that work is finished.

1. Read [SAGE_PROJECT_MEMORY.md](./SAGE_PROJECT_MEMORY.md) and [FOUNDATIONAL_PRODUCT_VISION.md](./FOUNDATIONAL_PRODUCT_VISION.md).
2. Read [PRODUCT_COMPLETION_AND_VERIFICATION_RULES.md](./PRODUCT_COMPLETION_AND_VERIFICATION_RULES.md).
3. Read the relevant feature specification and current project-state/backlog/TODO.
4. Inspect the current branch, latest relevant PRs/commits, CI, deployment/build identity and known blockers using available tools.
5. Keep feature statuses distinct: **Planned → Specified → Implemented → Connected → Tested → Verified → Released**. **Deferred, Blocked and Failed remain open states.**
6. Never call a phase complete unless its required scope has evidence of passing acceptance criteria. If some scope is explicitly deferred, list it and do not imply it shipped.
7. At the end of major work, update canonical project state/backlog with what changed, exact evidence, tested artifact/environment, what remains unknown, and the next action.

## The most important principle

**Verify the actual latest product—not the plan, not a code-only claim, and not an old build.**

A document is not implementation. Code is not proof of connection. A passing unit test is not end-to-end proof. Green CI is not proof of physical-device behavior. A successful deployment is not proof that the intended latest commit is running. State what was actually checked and leave anything else unverified.

This rule applies even if the owner does not repeat it in every conversation. “Save this in SAGE memory” and “Run the latest-product verification gate” are useful reminders, not prerequisites.
