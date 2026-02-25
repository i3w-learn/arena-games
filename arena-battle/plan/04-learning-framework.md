# Learning Framework: Fundamentals-Driven Development

> Inspired by Vince Lombardi's philosophy: master the fundamentals, and the plays run themselves. This framework uses the i3w game projects as a vehicle for building transferable software architecture skills — not game development skills.

---

## Team Context

| Role | Experience | Strengths | Growth Target |
|------|-----------|-----------|---------------|
| **Backend Engineer** | 2 years | Agentic development, backend systems | Software architecture patterns, systems thinking |
| **Tech Lead** | 8 years | Cloud Infra, LLM-driven development, agentic workflows | Architecture for AI-native systems, mentoring through interface design |

Both are fluent in agentic development. The goal is not "how to use the tools" but **what to build and why** — developing architectural intuition that transfers beyond this project.

---

## The Shared Fundamental: State Machines

Games are the purest expression of state machines in software. A game is always in a state (menu → playing → paused → game over), transitions between states have rules, and bugs happen when states get confused.

This is the single most transferable concept in computer science, and most developers learn it abstractly. Building a game forces you to feel it.

**How it transfers:**

- **Backend Engineer →** Order processing, payment flows, and user lifecycles are all state machines. The pattern they build for "player alive → answered wrong → weakened → zombie attacks" is the same pattern behind every workflow engine.
- **Tech Lead →** The MCQ pipeline stages (ingest → chunk → embed → generate → validate) are a state machine. The quality gate is a state transition with guard conditions.

**The drill:** Before either person writes any game code, whiteboard the state diagram for a single mini-game on paper. Every state, every transition, every edge case. This is the equivalent of "Gentlemen, this is a football."

---

## Backend Engineer: Three Architectural Fundamentals

Game development is one of the few contexts where architectural mistakes are immediately visible. A bad API might survive for months before someone notices the coupling. A bad game architecture stutters on screen in frame 1. That tight feedback loop is what makes it an effective teacher.

### 1. Separation of State from Presentation

The game loop enforces this: game state (player health, score, zombie positions) lives in one place. Rendering reads that state and draws it. Input modifies state through defined channels. If you cheat and put logic in the renderer, the game breaks in obvious ways.

**Why it transfers:** This is the same principle as keeping business logic out of API controllers, keeping database queries out of route handlers, separating domain models from DTOs. In backend work, you can get away with violating it for months. In a game, you can't.

**The drill:** Structure the Phaser mini-game with three explicit folders: `state/`, `systems/`, `rendering/`. The rule — files in `rendering/` never modify game state. Files in `state/` never reference Phaser's display objects. If Claude Code generates code that violates this, the engineer's job is to fix the architecture constraint (the CLAUDE.md), not the code by hand.

### 2. Event-Driven Communication

Games use events everywhere: "player collided with zombie" → "reduce health" → "update UI" → "play sound." The publisher doesn't know who's listening. Subscribers don't know who published.

**Why it transfers:** This is pub/sub, message queues, webhooks, event sourcing. Every microservices architecture runs on this pattern. Building it in a game where you can see the events happening (zombie dies, score updates, sound plays) builds intuition that no backend architecture diagram can.

**The drill:** Implement a simple event bus in the mini-game. Every game action flows through it. When they later build Supabase real-time features, they'll recognize the pattern immediately.

### 3. Performance Budgets

Every game runs a loop: read input → update state → render output, 60 times per second. You have 16ms per frame. What do you prioritize? What do you defer? What do you skip if you're running behind?

**Why it transfers:** This is the same skill as designing systems with SLAs — API latency budgets, batch processing windows, graceful degradation. If the physics simulation is too heavy, reduce fidelity. Same as: if the database is slow, serve cached data.

**The drill:** Build the Phaser mini-game with a visible FPS counter and a performance budget. When adding features, the rule is: if it drops below 55 FPS, optimize before adding more. This teaches thinking in budgets — a skill they'll carry back to every API they design.

---

## Tech Lead: Two Architecture-Expanding Fundamentals

Eight years of Cloud Infra means they already think in systems. But infra systems are typically stateless request handlers backed by durable stores. The MCQ pipeline and game context force a different mode of architectural thinking.

### 1. Designing for Subjective Quality at Scale

Infra has clear correctness criteria: the request succeeded or it didn't, the deployment is healthy or it's not. The MCQ pipeline introduces graded quality — a question can be technically valid but pedagogically useless.

**Why it transfers:** Every LLM-powered system they'll build in their career will face this problem. "Did the model generate a good response?" is the defining architectural challenge of AI-native software. The MCQ pipeline is a bounded, low-risk context to practice building systematic quality evaluation.

**The drill:** Build the quality rubric as a data structure before building the pipeline. Define what a "quality score" means for an MCQ:

- Bloom's taxonomy level accuracy
- Distractor plausibility (no obviously wrong options)
- Reading level appropriateness for target grade
- Syllabus alignment with NCERT chapter

Then design the pipeline architecture around that rubric — where does automated checking happen, where does human review sit, how do you handle the gray zone between "clearly good" and "clearly bad"?

**The Lombardi move:** Before generating 1,000 MCQs, hand-write 10. Then have the LLM generate 10 more. Put all 20 in front of a student and watch them work through it. Build the rubric that distinguishes "good struggle" from "bad question" — then automate that rubric into the pipeline.

### 2. Architecting for Composition (The Mentor Multiplier)

The Tech Lead's real architectural challenge isn't the pipeline — it's designing the project so the backend engineer can work on game components independently without needing the Tech Lead's context. This is interface design: defining clean boundaries between the content pipeline and the game.

**Why it transfers:** This is exactly the skill senior architects need — designing system boundaries so that teams with different expertise levels can work in parallel without stepping on each other. The game forces it because the two domains (game engine and content pipeline) are genuinely different.

**The drill:** The Tech Lead defines two contracts:

1. **The MCQ contract** (TypeScript interface): question text, options array, correct answer index, difficulty rating, Bloom's level, explanation text.
2. **The API contract** (Supabase edge function): given a player's FSRS state, return the next appropriate question.

The backend engineer consumes these contracts in the game without ever needing to understand how generation works. If the contract is well-designed, both can work independently. If it's not, they'll feel the friction immediately — and that friction is the lesson.

---

## The Weekly Cadence

Lombardi's Packers practiced the same plays every day. Repetition, not variety. The key is reflection — that's where learning compounds.

| Day | Backend Engineer | Tech Lead |
|-----|-----------------|-----------|
| **Monday** | Review last week's architecture decisions. Did the separation hold? Where did state leak into rendering? | Review MCQ quality scores from last batch. Where did the rubric fail to catch bad questions? |
| **Tuesday–Thursday** | Build with Claude Code, enforcing architectural constraints. When generated code violates the rules, fix the CLAUDE.md — not the code. | Pipeline iteration + refine contracts. When the engineer hits friction at the interface boundary, that's a signal to improve the contract. |
| **Friday** | 3-minute Loom: show the state diagram, point to where the architecture held and where it broke. | 3-minute Loom: show 5 generated MCQs, walk through quality scores, explain one rubric change. |

The Friday Loom is the Lombardi film session. It forces reflection, which is where the learning actually happens.

---

## Operational Rules for Agentic Development as Learning

Because both are fluent in Claude Code, there's a risk of shipping fast without building intuition. These rules prevent that:

1. **No manual fixing of AI code.** If Claude Code generates a broken game script, the engineer is not allowed to open the file and fix the logic by hand. Their job is to fix the CLAUDE.md instructions or the prompt, and run the agent again. This forces creation of repeatable, systemic processes rather than one-off hacks.

2. **Whiteboard before terminal.** Every new game feature or pipeline stage starts as a hand-drawn diagram (state machine, data flow, component boundary). Only after the diagram is reviewed do they prompt the agent.

3. **Architecture violations are bugs.** If rendering code modifies game state, that's a bug — same priority as a crash. If a pipeline stage bypasses the quality gate, that's a bug. Treat architectural discipline the way Lombardi treated fundamentals: non-negotiable.

---

## What Success Looks Like

After this project, regardless of whether the game ships:

**The Backend Engineer** can look at any system — a payment flow, an order pipeline, a real-time dashboard — and immediately see the state machine, identify where state and presentation should separate, and design event-driven communication between components. They've internalized patterns that would otherwise take 2-3 more years of backend-only work.

**The Tech Lead** can architect LLM-powered systems with systematic quality evaluation, design contracts that let junior engineers work independently, and evaluate subjective AI outputs with the same rigor they apply to infrastructure health checks. They've expanded from "does it work?" to "is it good?" — the architectural frontier of AI-native software.

Both have practiced the discipline of constraining AI agents through architecture rather than manual intervention — a meta-skill that compounds across every future project.
