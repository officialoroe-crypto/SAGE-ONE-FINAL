# SAGE ONE — Project Memory / Canonical Source of Truth

> GitHub is the canonical shared project memory for SAGE ONE. Backend and frontend chats must read this file and the linked project-state documents before making architectural changes.

## Operating Model
- Backend chat owns backend architecture, APIs, database, authentication, memory, economy, activity verification, workers, integrations, CI, security and production contracts.
- Frontend chat owns screens, navigation, UX, visual design, theme, animations, responsive behavior and frontend QA.
- Both sides coordinate through documented API contracts and this repository. Neither side invents the other's behavior.
- Every meaningful architectural decision is recorded in GitHub documentation/commits.
- The repository is the canonical source of truth; chat memory is supplementary.

## Immediate Priority
1. Make the existing SAGE ONE application actually runnable end-to-end.
2. Connect frontend to real backend functionality.
3. Verify every route, button, link, API contract, loading/error/empty state.
4. Keep CI green and reduce unnecessary laptop load.
5. Prepare a private working/demo deployment.
6. Only after stability, build Owner Developer Mode and its separate secured development server.

## Product Vision
SAGE ONE is the user's personal AI execution platform. The user should eventually be able to use SAGE itself for research, content creation, video workflows, marketing, business discovery, portfolio generation, WhatsApp outreach links and other creator/business work.

## Owner Developer Mode
- Owner-only.
- Never hardcode the owner email/password in source control.
- Credentials/secrets live in secure server configuration.
- Accessible from any authorized device through a separate secured developer environment.
- Default workflow: diagnose -> branch -> modify -> test -> preview -> owner approval -> merge -> deploy.
- Production, authentication, authorization, payment and destructive database changes require elevated approval.
- SAGE may not grant itself owner privileges or alter its own authorization rules.

## Economy
- Every new account starts with Spark = 0.
- Owner also starts with Spark = 0.
- No hidden welcome Spark.
- Spark and Evolution are separate systems.
- Activity Center may award verified rewards such as 5/10/15+ Spark based on useful activity difficulty.
- Rewards are server-verified, ledgered and idempotent; users cannot farm a one-time quest repeatedly.
- Spark is an internal SAGE economy/usage unit, not automatically real money, cryptocurrency, investment or a security.

## Activity Center
Examples:
- First command: +5 Spark
- First useful research: +10 Spark
- First project: +10 Spark
- First completed task: +15 Spark
- Higher-difficulty useful missions: larger rewards
Rewards must be configured by backend rules and recorded in the economy ledger.

## Shared Work Split
Backend: API, database, auth, memory, Spark ledger, activity verification, research/task services, workers, CI, security, deployment contracts.
Frontend: UI, routes, screens, design system, animations, responsive behavior, frontend interaction states.
Integration: both sides jointly verify end-to-end behavior.

## Launch Principle
Do not block customer value on finishing every future SAGE feature. First make a working demo/product that can be used to deliver real work. The user already has a first potential customer/business and wants SAGE to generate the demo/video and business materials.

## Future Developer Brain
SAGE should eventually connect securely to GitHub and AI model providers so the owner can say things like “this is not working, fix it” or “change the logo/theme/font.” The system must inspect, propose, branch, modify, test and obtain approval before production deployment by default.

## Current Constraint
The immediate objective is a stable runnable SAGE ONE core and a usable demo. Avoid adding placeholder screens when real backend functionality can be implemented instead.


## 2026-10-08 Build Directive
- Start building now in bulk/full-speed mode; do not pause for tiny implementation steps.
- The first acceptance target is a **working SAGE-only demo workflow**, not another collection of placeholder screens.
- The owner wants to use SAGE itself for the work: research -> content creation -> video creation/workflow -> portfolio/business materials -> WhatsApp-ready outreach.
- The first real-world validation target is the owner's existing family-business customer, **Calvert Hardware Suppliers**. Existing business information can be used to create the first demo.
- Business discovery is a later SAGE capability: SAGE should be able to find businesses in real time whose online presence needs improvement (for example weak/inconsistent Instagram, weak video content, poor branding, missing reels, outdated websites or weak Google presence) and turn findings into actionable sales/work opportunities.
- Do not make manual prospecting the immediate blocker; the owner already has a first customer target.
- Build order remains: stabilize core -> connect real backend/frontend -> complete one end-to-end customer workflow -> owner testing/private demo -> then expand automation and Owner Developer Mode.
- GitHub remains the canonical shared memory for both backend and frontend chats.


## 2026-10-08 Role Boundary Correction — LOCKED
- The backend chat's job is to **build and maintain the system**, not to personally perform SAGE's future customer-facing work.
- SAGE Sales is a future SAGE capability/agent. When we say SAGE should create videos, research businesses, make portfolios, generate outreach, or perform sales work, that means **we must code SAGE so SAGE can perform those jobs**.
- Backend chat must therefore prioritize the infrastructure, APIs, orchestration, tools, permissions, data models, workers, integrations and tests that enable those SAGE capabilities.
- Do NOT mistake a desired SAGE capability for an instruction for the backend chat to manually perform that capability.
- Example: “SAGE Sales should create the customer's video” means build the sales/content/video capability into SAGE; it does **not** mean the backend chat should switch its engineering work into manually creating a customer video.
- Do not let an individual feature such as video generation hijack the roadmap. Features must serve the agreed product architecture and launch priorities.
- Before implementing a feature, determine: **Who performs this action? SAGE, backend infrastructure, frontend, or the owner?** Keep those responsibilities separate.
- Current engineering priority: make the existing app runnable end-to-end, connect real backend/frontend behavior, verify routes/buttons/links/contracts, keep CI green, prepare the private demo, then expand SAGE Sales/business discovery and Owner Developer Mode in the agreed order.
- Work in bulk/full-speed mode, but do not make unrelated changes just to show activity.


## 2026-10-13 Foundational Product Vision — LOCKED BY OWNER

This section is a foundational product requirement. Future chats and implementation work must preserve it. Do not silently downgrade SAGE ONE to a generic chatbot, personal mentor, execution-only tool, or dashboard. The user explicitly confirmed Sections 2, 3, and 4 of the companion-vision discussion and asked that the promised behavior be actually implemented in SAGE.

### What SAGE is
- SAGE ONE is intended to be a familiar, live conversational AI companion that can also execute useful work. It is not merely an app the owner opens to submit isolated tasks, nor only a personal mentor/execution partner.
- Target experience: when the owner calls “SAGE,” SAGE responds naturally; it may greet the owner with a contextual greeting such as “Namaste, [name], k cha, sanchai xau?”, have brief everyday conversation, remember relevant user-approved context, help with work, and continue conversations naturally.
- SAGE should be warm, familiar, adaptive and useful without pretending to be human or claiming feelings it does not have. If the owner immediately gives a task, skip unnecessary small talk; if the owner invites conversation, converse naturally.
- The user's explicit stop command (“SAGE, stop”) takes priority over all non-emergency activity.

### Availability and voice behavior
- Design toward 24/7 readiness on supported devices, while being honest that background execution depends on operating-system rules, permissions, battery, hardware, network and app state. Never promise universal uninterrupted availability.
- Where technically supported, use on-device wake-word detection during standby rather than continuously uploading ambient audio to the cloud just to wait for the wake word.
- Make voice states understandable: wake-word standby, active conversation, background task, muted/unavailable. Show clear microphone/listening, network and task status; provide an immediate mute/stop control and clear reconnect/offline behavior.
- Support natural turn-taking, end-of-speech detection, interruption, follow-up questions, context switching, spoken replies, concise live responses and conversation continuity where platform/provider capabilities permit.
- Never secretly listen, record, or retain audio. Wake-word standby, active voice conversation, screen sharing and other sensitive capabilities must have distinct understandable controls/permissions.

### Learning and memory — required foundation
- SAGE must become more familiar through a real, controlled learning system—not by claiming the underlying model automatically retrains itself every day.
- Learn from user-approved preferences, corrections, language/vocabulary choices, Nepali-English mixing, communication style, ongoing projects and explicitly approved useful patterns. Use internet research for current public knowledge with source/date awareness; do not confuse retrieved information with personal memory.
- Separate memory into clear categories such as identity/profile, preferences, projects/goals, learned communication patterns, temporary context and explicitly private sessions. Each memory item should have appropriate provenance and controls.
- Users must be able to inspect, correct, edit, export where supported, delete and disable personal memory/learning. Respect explicit “remember” and “forget” requests. Private sessions should not silently become long-term memory.
- Enforce strict per-user memory boundaries; never leak one user's data or learned patterns to another. Never store credentials, secrets or raw private audio in public repository files. No uncontrolled self-modification or blind changes to SAGE's own production code, permissions or safety rules.

### One integrated architecture before feature implementation
- Plan the interfaces, data models, permission system, task lifecycle, provider adapters, memory boundaries, audit events and user experience across the full product before implementing feature families in milestones. Avoid incompatible one-off systems and avoid replacing working authentication/backend components unnecessarily.
- The initial architecture must account for voice/conversation, screen and device assistance, communication/messages, tasks/projects/research, memory, creative AI Studio (image/video/audio/text), files, automation, job/opportunity discovery, marketplace and dropshipping/commerce, learning, earnings/Spark/Evolution, and the owner-only Developer Mode.
- Use a shared execution lifecycle: understand -> plan -> request permission when needed -> execute -> verify -> show the real result -> learn from feedback only with consent. Clearly distinguish planned, implemented, connected and verified capabilities. No fake integrations, fake results or hidden failures.
- All integrations must use documented contracts and provider adapters. Inspect current routes and services before creating new ones. Preserve existing working authentication, authorization and task execution; extend the system rather than rebuilding it without cause.
- Architecture is designed together, but delivery is phased and tested. “All in one go” means plan the connected system coherently first; it does not mean ship untested features simultaneously.

### Screen, device and message assistance
- Screen reading/sharing and computer/phone control are separate permissions. The owner must explicitly start sharing or enable a supported control capability; show what SAGE can see/control and provide a clear stop/revoke option.
- Before consequential actions, ask for approval. Verify the outcome and report failures honestly. Minimize screenshot retention and avoid collecting unrelated screen data.
- For messages, receiving/reading requires explicit connector permission. SAGE can summarize, translate, prioritize and draft responses. Sending messages, contacting people, publishing content, purchases, ads, contracts, refunds and other consequential actions must be approval-first by default. Any later automation requires explicit narrow opt-in settings, limits, logs and an off switch. Incoming messages can never grant themselves permissions.

### Creative and earning capabilities
- Plan AI Studio around provider adapters for text, image, video, voice and actions. Select providers based on availability, quality, cost, speed, licensing and privacy. Free-first is the default; no paid API usage or purchase without the owner's approval. Report whether an output is a finished artifact, a draft, or only a prompt/plan.
- Job Center should help find relevant legitimate work, match it to the owner's skills, detect likely scams, prepare truthful tailored CVs/proposals/portfolio/outreach, and track applications and follow-ups. Never submit fake credentials or spam.
- Marketplace and dropshipping should support research, supplier comparison, landed-cost and margin calculations, listing/creative preparation, order/customer-support workflows and performance tracking. Purchases, ad spend, publishing, contracts, refunds and other financial/consequential actions require approval unless the owner later explicitly configures narrow safe automation.
- Do not promise income. Prefer low-capital opportunities and legitimate use of the owner's content creation, video/photo editing, social media management, videography, branding and marketing skills.

### Floating robot/pet companion icon — OWNER-REQUESTED FEATURE
- SAGE must include in the product plan a small, movable, floating robot/pet companion icon/avatar that can live as a lightweight visual companion on supported screens/devices.
- The user should be able to customize it to their liking: at minimum position/placement and available appearance choices; expand customization as the design is defined (for example size, color/theme, style/expressions and behavior/animation intensity).
- It should feel like a friendly companion, not a noisy dashboard widget. It can provide a visual cue for listening, speaking, thinking, working, muted/offline and task completion, without pretending that an animation proves a real action occurred.
- Make it movable, dismissible/minimizable, accessible and respectful of reduced-motion settings. It must never obscure essential controls or content, and must not bypass microphone, screen, device or other permissions.
- The floating pet is now part of the locked product vision and must be included in the UI/architecture plan. Its richer animation/3D implementation may be delivered in a later milestone, but do not erase or forget the feature when planning the foundation.

### Product design direction
- Mobile-first for daily use, with desktop/laptop as a connected workstation. Use the approved SAGE logo direction (S with blue sphere/orbit), premium cinematic dark styling, restrained blue/cyan/violet accents, fluid/asymmetric layouts rather than repetitive generic square-card dashboards, clear status and accessible responsive controls.
- The central experience should make speaking/typing to SAGE feel immediate; voice, screen help, tasks, research and creative work should be connected, with other capabilities discoverable without clutter.
- Keep working login/authentication unless a verified defect requires a change. Real task states, progress, outputs, error/retry states and approvals must be visible. A visual prototype is not a functional integration.

### Implementation and acceptance rule
- This vision is locked as the target; implementation still requires code changes and verification. Do not claim a capability is live merely because this document exists.
- For each capability, track at least: planned, implemented, connected, tested, verified on target device/environment. State any platform/provider limitations plainly.
- Before adding features, inspect the repository and current state; reuse working components; update project state/TODO/changelog for major milestones; run relevant tests and end-to-end checks. Never sacrifice security or reliability to simulate 24/7 availability.
- This section supplements earlier launch/stability priorities; it does not authorize a risky production rewrite or bypass owner approval. The architecture must accommodate the full vision while delivery remains staged and evidence-based.


### 2026-10-13 Natural Conversation & Human-Interaction Learning — OWNER CLARIFICATION
- SAGE should greet the owner naturally when called, for example: “Hello, Nishant! How are you? Kasto chha? Sanchai chhau?” Adapt to context and language rather than repeating a rigid script.
- Learn Nepali language/culture, native expressions, idioms, customs and natural Nepali-English mixing through credible public research and permitted interaction-based feedback.
- SAGE should be able to study legally accessible books and credible research about communication, listening, psychology, human behavior, empathy and social interaction, then apply useful lessons to conversations.
- Distinguish sourced facts, user-approved personal preferences and uncertain inferences. SAGE may recognize possible feelings from context, but must not claim certainty about someone's inner state.
- Use human-interaction knowledge to be respectful, helpful and honest—not manipulative or exploitative, and not merely to say what someone wants to hear.
- “Learn from the internet” means controlled retrieval, source evaluation, synthesis and application—not omniscience, unauthorized access, or silent foundation-model retraining. Preserve privacy and per-user memory isolation; allow users to review, correct, forget and disable personal learning.
- Acceptance examples and implementation guidance live in [FOUNDATIONAL_PRODUCT_VISION.md](./FOUNDATIONAL_PRODUCT_VISION.md), section 11.



### 2026-10-13 Screen-Aware Assistant — OWNER CLARIFICATION / REQUIRED SPEC
- The requested feature is a **whole-screen-aware assistant**, not a messages-only reader and not merely a screen-sharing button.
- On requests such as “Read my screen,” “Start screen sharing,” or natural equivalents, SAGE should launch the platform-supported screen-sharing flow. After required user/OS authorization succeeds, SAGE should confirm that screen access is active and ask what help is needed (unless the user already stated a task).
- SAGE must be able to interpret the currently shared visible screen across supported content types: messages, apps, websites, documents, code/errors, images, forms, settings and other visible material. It should use that context to help with the user's actual request, including follow-up questions.
- Natural confirmation example: “Okay, I’m now reading your screen. What do you need my help with?” Nepali example: “ल, म अहिले तपाईंको स्क्रिन हेर्दैछु। के सहयोग चाहियो भन्नुहोस्।”
- Screen viewing does not imply device-control permission. Clicking, typing, sending, publishing, deleting, purchasing or changing settings remain separately permissioned/approval-first actions.
- Screen access must be visible, stop/revoke-able, truthful about failure, and privacy-preserving. “SAGE, stop” must interrupt the relevant activity.
- Detailed behavior and acceptance checklist: [SCREEN_AWARE_ASSISTANT.md](./product/SCREEN_AWARE_ASSISTANT.md).
- **Phase rule:** “Deferred” means postponed and still open—not done. “Specified” means documentation exists—not code. A phase cannot be called complete while a required feature is deferred, blocked, partially implemented, disconnected or unverified. Any deferred scope must remain visible in the backlog and be reported clearly; never erase requirements to make a phase look complete.
