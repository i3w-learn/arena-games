# Arena Battle: What We're Building and Why

> A brief for leadership on the first i3w game.

---

## The One-Line Pitch

A mobile-friendly combat game where Grade 9+ students battle AI opponents by answering JEE/NEET questions — correct answers deal damage, wrong answers cost health. Students think they're gaming. They're actually revising.

---

## How This Connects to Our Vision

Arena Battle is a game with characters, combat, and progression, with educational content woven into the core mechanic rather than bolted on as an afterthought.

This is not a "wrappers over MCQs." The questions don't interrupt the game — they **are** the game. Every answer has a visible consequence on screen. That's the difference between what we're building and what every other EdTech game does.

### Strategic goals this addresses

| Goal from the Vision Doc | How Arena Battle Addresses It |
|---|---|
| Build games teens actually want to play | Combat gameplay with colorful characters and progression — not a quiz app |
| JEE/NEET revision embedded in gameplay | Questions drive the fight; students revise by playing |
| Content moat via AI-generated questions | Our pipeline generates thousands of syllabus-aligned questions at scale |
| Indian market focus | PWA (works on low-bandwidth connections), designed for WhatsApp sharing |
| Revenue path | Free tier with premium upgrade for unlimited play, topic selection, and performance analytics |

---

## What It Looks Like

**The battle screen:** Your character faces an AI-controlled opponent. A question appears at the bottom. The student picks an answer. If correct — their character attacks and the opponent takes damage. If wrong — the opponent strikes back. Five questions per round. Beat the opponent to win.

**When you lose:** You see the questions you got wrong, with clear explanations. Students are motivated to learn the material because they want to win the rematch.

**Progression:** Multiple opponents with increasing difficulty. The game adapts to what the student knows — if they're weak on Thermodynamics, they'll face tougher Thermodynamics questions until they master it.

**Competition (Phase 3):** Challenge a friend via WhatsApp link. Both play the same questions independently, then compare scores. Leaderboard tracks the best players.

---

## The Shipping Plan: Three Phases

We're not building the whole product at once. We ship in three phases, each one playable and testable, each one answering a specific question before we invest in the next.

### Phase 1: The Battle

**What ships:** A playable web game. One chapter of Physics. Your character vs. 2-3 opponents. Colorful 2D art, attack animations, health bars.

**What we learn:** Do students call this a "game" or a "quiz app"? Do they voluntarily play more than one round?

**How we test:** Put it in front of 5-10 real JEE/NEET students and watch them play.

### Phase 2: Progression

**What ships:** Multiple opponents with increasing difficulty. Adaptive question scheduling — the game gets smarter about what each student needs to practice. Multiple chapters of content. Hindi language support.

**What we learn:** Do students come back after a week? How many sessions per week?

**How we test:** Ship to 50-100 students via WhatsApp. Measure retention.

### Phase 3: Competition

**What ships:** Challenge-a-friend via shareable link. Leaderboards. Shareable result cards for Instagram and WhatsApp stories. Premium tier unlocked.

**What we learn:** Does competition drive sharing? Do users invite friends? Will they pay for premium?

**How we test:** Measure viral coefficient, premium conversion rate, and interest from coaching centers.

---

## The Team

Three people, each with a clear role from day one:

| Role | Responsibility | Key Output |
|------|---------------|------------|
| **Game Designer** (part-time) | Visual identity, character art, game feel, UI design. Uses AI art tools to generate assets at speed. | Characters, backgrounds, animations, and the visual standards that keep everything consistent |
| **Backend Engineer** | Builds the game itself — the battle screen, combat logic, and the web app students interact with. | A playable game on a shareable web link |
| **Tech Lead** | Builds the question engine — AI-powered pipeline that generates thousands of exam-quality questions from textbook content. | A growing library of validated, syllabus-aligned questions that no competitor can match |

Nobody waits. All three are productive from Phase 1.

---

## Why This Approach De-Risks the Bigger Vision

The original roadmap envisions multiple games, 3D experiences, and a cross-platform Super-Wrapper. That ambition is right — but building it all at once is risky. Arena Battle tests the **core thesis** cheaply and quickly:

1. **Will teens engage with education embedded in real gameplay?** Phase 1 answers this.
2. **Does our AI content pipeline produce questions good enough to build a game around?** Phase 1 answers this.
3. **Can a small team ship a real game using AI-powered development tools?** Phase 1 answers this.
4. **Will students retain and share?** Phases 2 and 3 answer this.

If Arena Battle works, we have validated data — not assumptions — to invest in the bigger vision. If something doesn't work, we'll know exactly which assumption failed and can adjust before committing more resources.

---

## What We're Not Building (Yet)

To keep the team focused and shipping fast:

- No 3D graphics or complex game engine
- No app store submission (web-only until metrics justify it)
- No multiple game modes or storylines
- No multi-language beyond English and Hindi

All of these are decisions we make *after* Arena Battle validates the core thesis. They're on the roadmap, not on the calendar.

---

## Revenue Model

**Phase 1-2:** Free. The goal is validation and retention data, not revenue.

**Phase 3 onward:**

| Tier | What Students Get | Price Point |
|------|------------------|-------------|
| **Free** | 5 battles per day, basic leaderboard | Free |
| **Premium** | Unlimited battles, topic selection, performance analytics, detailed explanations | Monthly subscription (pricing TBD based on market testing) |
| **Institutional** | Bulk access for coaching centers and schools, teacher dashboard, class-level analytics | B2B licensing |

The free tier is the growth engine. Premium converts engaged users. Institutional licensing is the long-term B2B play that coaching centers and schools will pay for once we demonstrate student outcomes.

---

## Milestones

| Phase | Milestone | What Leadership Sees |
|-------|-----------|---------------------|
| Phase 1 | Prototype | Placeholder characters fighting on screen, driven by real JEE questions |
| Phase 1 | Launch | Polished game with real art, playable by students via a web link |
| Phase 2 | First retention data | Do students come back? What do they say? |
| Phase 2 | Launch | Multiple opponents, adaptive difficulty, Hindi support |
| Phase 3 | Growth data | Are students sharing? How fast is the user base growing? |
| Phase 3 | Launch | Competition features, premium tier, shareable results |

At every milestone, we have something to show and something we've learned. No black-box development.

---

## The Bottom Line

Arena Battle is not the end goal — it's the **proof point**. A small team, building fast with AI-powered tools, shipping a real game that real students want to play. Everything we learn feeds directly into the bigger product roadmap.
