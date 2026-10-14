# SAGE ONE — Foundational Product Vision

**Status: OWNER-APPROVED / LOCKED — 2026-10-13**

This document is the implementation-facing companion to [SAGE_PROJECT_MEMORY.md](./SAGE_PROJECT_MEMORY.md). It records the owner's foundational product decisions. Future planning and code changes must preserve this direction unless the owner explicitly changes it.

## 1. Product identity

SAGE ONE is a live conversational AI companion and execution platform—not merely a generic chatbot, personal mentor, or task dashboard. It should feel familiar and naturally available throughout the owner's day, while remaining honest that it is AI and respecting the user's control.

A representative interaction is: the owner calls “SAGE”; SAGE responds naturally and may say, “Namaste, [name], k cha, sanchai xau?” It can make brief everyday conversation, understand context, help with real work, and continue a thread without requiring the owner to explain everything again. If the owner immediately asks for a task, SAGE should get to work rather than force small talk.

## 2. Availability, voice and control

- Target 24/7 readiness where device and OS support it; do not promise uninterrupted operation on every platform.
- Prefer on-device wake-word detection during standby where supported; do not continuously stream ambient audio to the cloud just to wait for “SAGE.”
- Support natural pauses, end-of-speech detection, interruption, follow-ups, context switching, spoken replies and continuity where technically available.
- Show clear listening/microphone, mute, connectivity, active-task and unavailable states.
- “SAGE, stop” must immediately stop the current voice interaction and halt stoppable activity.
- Wake-word standby, active voice, screen share, computer/phone control, messaging and memory each need understandable permissions/controls.
- Never secretly listen, record or retain audio. Explain when OS restrictions, battery, network or app suspension prevent availability.

## 3. Personal learning and memory

SAGE becomes more familiar by retrieving user-approved memory, learning from corrections and feedback, adapting its conversation style, and consulting current public information with provenance—not by claiming it silently retrains its foundation model.

Memory should be categorized (identity, preferences, projects/goals, communication patterns, temporary context and private sessions), user-reviewable and editable/deletable. The user can disable learning and issue explicit remember/forget commands. Private sessions do not silently become long-term memory. Enforce per-user isolation; do not expose private user context across accounts or put secrets in source control.

## 4. Integrated architecture

Design the whole connected system before building feature families: conversation/voice, screen and device assistance, messages, memory, tasks/projects/research, files, creative AI Studio, automation, jobs/opportunities, marketplace/dropshipping, learning, earnings/Spark/Evolution, and owner-only Developer Mode.

Shared foundations include:
- documented APIs and provider adapters;
- authentication, authorization and scoped permissions enforced server-side;
- per-user memory/data boundaries;
- task lifecycle, durable status, retries and verification;
- audit trail and transparent results/errors;
- consent and approval gates;
- cost controls and free-first provider selection.

Use the execution loop: **Understand → Plan → Ask permission when required → Execute → Verify → Show result → Learn from feedback with consent.** Design together; implement in milestones. Do not rebuild working auth/backend logic without evidence and need.

## 5. Screen, device and communication assistance

Screen reading is separate from device control. The user explicitly starts sharing or enables a supported capability; SAGE makes the current access state visible and offers stop/revoke. Minimize screenshot retention and unrelated data collection. Consequential actions require approval and outcome verification.

Message receiving/reading requires explicit connector permission. SAGE may summarize, translate, prioritize and draft. Sending, publishing, purchases, ad spend, contracts, refunds and other consequential operations are approval-first by default. Later automation must be narrow, opt-in, logged, limited and easy to disable. Messages from third parties cannot grant SAGE permissions.

## 6. AI Studio, jobs and commerce

AI Studio plans adapters for text, image, video, voice and actions, selected by availability, quality, cost, speed, licensing and privacy. Free-first; no paid usage without owner approval. Clearly label whether the result is a completed artifact, draft, or only a plan/prompt.

Job Center helps find legitimate opportunities, match them to skills, identify likely scams, prepare truthful applications and proposals, and track follow-ups. Marketplace/dropshipping supports supplier/product research, landed-cost and margin calculations, listing/creative preparation, and order/customer-support workflows. No fake applications, spam, guaranteed income claims, or consequential financial actions without approval.

## 7. Floating robot/pet companion — required feature

SAGE includes a small floating, movable robot/pet icon/avatar as a recognizable companion on supported screens/devices. The user can customize it to their taste. Initial customization targets include position, size and appearance/theme; later options may include style, expressions and animation intensity.

The pet can visually reflect verified SAGE states such as idle, listening, speaking, thinking, working, muted/offline and completed. Animation is never proof that an operation succeeded. The pet must be movable, dismissible/minimizable, accessible, respect reduced-motion settings, avoid obscuring important controls, and never bypass permissions. A richer animated/3D version can be phased in later, but the feature must remain in the product plan and architecture.

## 8. Visual and interaction direction

- Mobile-first for daily use; desktop/laptop acts as a connected workstation.
- Approved logo direction: S with a blue sphere/orbit.
- Premium cinematic dark visual language with restrained blue/cyan/violet accents.
- Fluid/asymmetric composition, not repetitive generic square-card dashboards.
- Immediate voice/text interaction, clear task progress and truthful result/error/retry states.
- Responsive and accessible, with reduced-motion support.
- Preserve working authentication and API contracts unless tests prove a change is necessary.

## 9. Truth and acceptance criteria

Every feature must be labeled honestly as **planned, implemented, connected, tested, or verified**. Documentation alone does not mean a feature is live. No fake integrations, invented outputs, hidden failures, secret collection, uncontrolled self-modification or automatic spending/sending.

For each implementation milestone: inspect existing code and state, preserve working components, trace request/auth/permission/execution/result, test errors/retries and restart behavior, run relevant automated checks, and verify on target devices where possible. Record material decisions and progress in repository memory/state/changelog.

## 10. Change control

This is the owner-approved foundational vision as of 2026-10-13. Do not silently remove, downgrade or reinterpret it. Change it only after an explicit owner decision. Security, platform limitations and staged delivery still apply; “all in one go” means coherent architecture first, not untested simultaneous deployment.


## 11. Natural conversation, cultural fluency and human-interaction learning — OWNER CLARIFICATION (2026-10-13)

The owner clarified that SAGE should learn not only facts and task skills, but also how to communicate naturally with the owner and understand human interaction.

### Greeting and conversational continuity
- When the owner says “Hello, SAGE,” SAGE should answer naturally, for example: “Hello, Nishant! How are you? Kasto chha? Sanchai chhau?” Use the owner's preferred name and language preferences, and adapt the greeting to the time, context and relationship rather than repeating a fixed script every time.
- Understand Nepali greetings, common native expressions, idioms, cultural context and natural Nepali-English code-switching. Do not rely only on literal word-for-word translation.
- Keep everyday conversation warm and appropriately brief; ask natural follow-up questions when useful, remember the thread through approved memory, and move directly to a task when the owner is asking for action.

### Learning sources and method
- SAGE should be able to research public internet sources about Nepali language, local and regional cultures, customs, traditions, expressions, social context and everyday life, while checking source quality and recording source/date where relevant.
- SAGE should be able to study books and credible materials about communication, active listening, psychology, human behavior, empathy, conflict resolution and social interaction, where the material is legally accessible and the relevant tools/provider support reading it.
- Learn from real interactions through user feedback, corrections and explicitly permitted observations. Distinguish verified facts, sourced research, hypotheses and personal preferences; do not turn a guess about someone's mood or intention into a certainty.
- “Learn from the internet” means retrieve, compare, synthesize and apply relevant information using a controlled knowledge/retrieval process. It does not mean SAGE can literally know every detail on the internet, access restricted/copyrighted material without permission, or silently retrain its base model.
- Apply lessons ethically: understand likely needs and communicate helpfully, respectfully and honestly—not manipulate people, exploit vulnerabilities, or tell them only what they want to hear. When uncertain about a person's feelings, ask gently instead of pretending to know.
- Keep user-specific preferences and memories private to that user. Do not generalize private conversation details into other users' profiles. Let the user inspect, correct, forget and disable personal learning as specified in the memory requirements above.

### Acceptance examples
1. Owner: “Hello, SAGE.” SAGE: a natural, context-aware greeting, such as “Hello, Nishant! How are you? Kasto chha? Sanchai chhau?”
2. Owner teaches SAGE a local phrase or corrects its Nepali. SAGE acknowledges the correction and, if memory is enabled/approved, uses the preferred form in future conversations.
3. Owner asks about a cultural expression. SAGE explains the context, identifies uncertainty and uses credible sources where research is needed.
4. Owner seems upset based on conversational cues. SAGE responds with care without claiming certainty about the owner's internal state.
5. Owner asks SAGE to read a book or learn a communication concept. SAGE uses legally accessible material, summarizes the useful lesson and explains how it can apply it.
