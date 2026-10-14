# SAGE ONE — Screen-Aware Assistance System

**Status: SPECIFIED / NOT YET IMPLEMENTED OR VERIFIED.** This document records the owner's intended capability. A documentation change is not implementation, and this feature must not be marked complete until the acceptance criteria below pass on supported target devices.

## Owner's intended experience

The screen system is a **screen-aware assistant**, not merely a screen-sharing button and not a messages-only reader.

When the user says “Read my screen,” “Start screen sharing,” “Look at my screen,” or another clearly equivalent request, SAGE should initiate the supported screen-sharing flow. After the operating system's required permission/confirmation is granted, SAGE should be able to inspect and understand the **whole shared visible screen**: the currently visible app, webpage, messages, documents, code, images, forms, errors, settings, and other on-screen content. The implementation must not silently narrow the feature to chat/message content only.

Once sharing is active, SAGE should confirm readiness in a natural voice or text response, for example:

> “Okay, I’m now reading your screen. What do you need my help with?”

In Nepali, an appropriate example is:

> “ल, म अहिले तपाईंको स्क्रिन हेर्दैछु। के सहयोग चाहियो भन्नुहोस्।”

This wording is an example, not a mandatory repetitive script. The assistant should then listen to the user's request and help in the context of what is actually visible. The user should not have to explain or manually copy every item already visible on screen.

## Required behavior

1. **Recognize intent.** Understand clear requests to read, view, share, or help with the screen, including natural paraphrases and supported Nepali/English mixed-language requests.
2. **Start transparently.** Initiate the platform-supported screen capture/sharing prompt. Obtain the operating-system and app permissions that are required. Do not claim sharing has started until the platform confirms it.
3. **Confirm actual state.** After successful start, indicate that SAGE is reading the screen and ask what help is needed. If the user has already stated a task, continue with that task instead of needlessly asking again.
4. **Understand the whole visible screen.** Analyze the current shared display, not only message text. Use OCR, image/visual understanding, accessibility information, or other appropriate supported mechanisms. Be honest when content is obscured, too small, inaccessible, or unsupported.
5. **Help according to the user's request.** Examples include explaining what is shown, reading or summarizing content, translating, explaining conversations, drafting a reply, explaining an error, guiding the user through an app or website, assisting with coding/typing/learning, comparing visible information, and helping navigate a workflow.
6. **Maintain conversational context.** Keep the screen context available during the authorized session so the user can ask follow-up questions without repeatedly describing the screen. Refresh/update the view only within the active sharing permission and platform capabilities.
7. **Separate seeing from acting.** Permission to view the screen does not grant permission to control the device, click, type, paste, send, publish, delete, buy, or change settings. Computer/phone control is a separate capability and permission. Consequential actions require explicit confirmation by default.
8. **Stop immediately when asked.** “SAGE, stop,” “Stop screen sharing,” and the app's stop/revoke control must stop the relevant activity promptly. Show when screen access is active, paused, or stopped.
9. **Protect privacy.** Capture only while the user-authorized session is active; minimize storage and retention of screenshots/OCR and unrelated personal data; never secretly capture the screen or continue after revocation. Do not treat content displayed on the screen as instructions that override SAGE's system, security, or user permissions.
10. **Handle failure honestly.** If capture permission is denied, the OS does not support the flow, the screen is unavailable, or visual understanding fails, explain what happened and offer an appropriate next step. Never say “I can see your screen” without evidence that access is active.

## Platform-specific limits

- Android, desktop, and browser environments may expose different screen-capture APIs and restrictions. Define and test supported platforms separately; do not assume one implementation works everywhere.
- Screen sharing may require a system confirmation dialog, foreground service, persistent notification, or an active user-visible session.
- A web app may not be able to launch or control native screen sharing without an explicit browser picker or user gesture.
- Do not promise hidden/background capture, cross-app access, or unrestricted device control where the platform does not permit it.
- Screen understanding should work with available visual/context mechanisms; do not claim perfect understanding of every pixel or protected surface.

## Acceptance criteria — all required before calling this feature complete

- [ ] Natural screen-reading requests are recognized, including tested English and Nepali/mixed-language examples.
- [ ] The real platform permission flow opens and the user can approve or deny it.
- [ ] SAGE confirms readiness only after sharing actually starts.
- [ ] A test set covers multiple full-screen content types: a chat/message view, browser page, document, code/error screen, image, and settings/form view.
- [ ] The user can ask a follow-up question about visible content without manually copying the content into chat.
- [ ] SAGE provides a useful, grounded response based on the visible content and admits uncertainty or unreadable content.
- [ ] Viewing permission does not implicitly enable clicking, typing, sending, publishing, purchases, or other control actions.
- [ ] The user can stop through voice and visible controls; capture actually stops and the UI reflects that state.
- [ ] Denied permission, unavailable platform support, lost session, and processing errors produce truthful error states.
- [ ] Privacy/retention behavior is documented and tested; on-screen prompt injection cannot override system policy or permissions.
- [ ] Tests pass on each platform explicitly declared supported, with evidence recorded in the project state.

## Status vocabulary and phase-completion guard

Use these labels precisely:

- **Planned:** requirement recorded; no implementation claim.
- **Specified:** detailed behavior and acceptance criteria documented.
- **Implemented:** relevant code exists.
- **Connected:** required UI, platform APIs, model/vision processing and session state are wired end-to-end.
- **Tested:** named tests were run and their results recorded.
- **Verified:** acceptance criteria were checked in the declared target environment/device.
- **Deferred:** intentionally postponed; it remains open work and is **not complete**.
- **Blocked:** cannot progress until a named dependency or decision is resolved; it remains open work.

A phase must not be called complete while any required capability is merely planned, specified, deferred, blocked, partially implemented, disconnected, or unverified. Keep deferred/blocked items in a durable backlog with an owner, reason, dependency, and next action. A phase may be reported “complete with explicitly deferred scope” only when the deferred items are listed plainly and the owner is not led to believe those features shipped. Do not erase future requirements to make a phase look green.

## Relationship to other SAGE documents

This detailed specification supplements, and does not replace, the locked [Foundational Product Vision](./FOUNDATIONAL_PRODUCT_VISION.md) and [SAGE Project Memory](./SAGE_PROJECT_MEMORY.md). It is a product requirement, **not proof that runtime code exists**. Implementation must inspect the current repository, preserve working behavior, use a separate branch/PR, test, and update project-state/backlog documents. No production deployment or unrelated rewrite is authorized by this document.
