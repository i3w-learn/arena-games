# i3w Implementation Plan: Agentic-First, Portable, Flexible

> Based on analysis of "Beyond Flashy Games: The Experimental Spirit of i3w" — targeting teens 13-19 with educational gaming across Physics, JEE/NEET revision, and gamified learning.

---

## 1. Core Game Engine: Dual-Engine Strategy

Instead of one monolithic engine (and specifically avoiding Unity), use **two complementary engines** matched to your tracks:

| Track | Engine | Why |
|-------|--------|-----|
| **Mini Games** (web-first, quick hits) | **Phaser 4** (TypeScript) | 94% AI first-attempt code success rate. Browser-native. 200KB gzipped. Perfect for rapid agentic iteration |
| **Wrapper + Super-Wrapper** (app store, richer games) | **Godot 4.6** (GDScript + GDExtension) | Full 2D+3D. Native mobile export. MIT license. No royalties. `godot-mcp` enables agentic workflows directly in the editor |

### Why two engines?

- Phaser can't do 3D (physics simulations and zombie survival game need it)
- Godot's web export has friction (CORS headers, mobile web inconsistency) — Phaser is web-native
- Both are MIT licensed, zero royalties, zero vendor lock-in

### Why not Unity?

- Proprietary license with runtime fees
- Binary scene formats resist AI code generation
- C# has lower LLM training data coverage than TypeScript
- Heavy editor doesn't compose with agentic CLI workflows

---

## 2. The Agentic Development Stack

Maximum AI leverage per developer hour:

| Layer | Tool | Role |
|-------|------|------|
| **Primary coding agent** | **Claude Code** (Opus) | Multi-agent orchestration. Run 3-5 instances in parallel on different game subsystems. Uses `CLAUDE.md` for project memory across sessions |
| **IDE agent** | **Cursor 2.0** | Visual editing, multi-file refactoring, background agents. Use alongside Claude Code |
| **Rapid prototyping** | **Bolt.new** | Browser-based full-stack apps from prompts. Great for game jam MVPs and testing ideas fast |
| **Game engine MCP** | **godot-mcp** | Connects Claude Code directly to Godot for agentic level design, script generation, scene building |
| **Asset MCP** | **Ludo.ai** (MCP integration, Jan 2026) | Coding agent can request sprites, sounds, and music mid-workflow. All-in-one asset pipeline |

### Workflow in practice

```
Claude Code (orchestrator)
├── Instance 1: Game logic + physics (Phaser/Godot)
├── Instance 2: UI + frontend (React/Next.js)
├── Instance 3: Backend + database (Supabase)
├── Instance 4: Content generation (MCQ pipeline)
└── Instance 5: Asset requests via Ludo.ai MCP
```

### Key workflow patterns

- **Parallel agent execution**: Run 3-5 Claude instances on different subtasks simultaneously
- **CLAUDE.md / .cursorrules**: Living instruction files that teach the AI your coding standards, architecture decisions, and common mistakes to avoid
- **Verification loops**: Give agents the ability to run tests, check UI, and iterate until code works — 2-3x quality improvement
- **Router approach to LLMs**: Powerful models (Claude Opus, GPT-4o) for complex game logic; cheaper models (Haiku) for boilerplate

---

## 3. Product-by-Product Tech Mapping

### A. Interactive Physics (Grades 6-8)

| Component | Technology | Notes |
|-----------|-----------|-------|
| Physics simulation | **Matter.js** (2D) + **Three.js + Cannon-es** (3D) | Inspired by PhET Colorado's gold-standard educational sims |
| Rendering | **Phaser 4** (2D mini-games) | Browser-native, instant results for students |
| Adaptive learning | **ts-fsrs** (spaced repetition) | Open-source, TypeScript-native, 21 tunable weights |
| Question generation | **GPT-4o / Gemini** via RAG over NCERT content | 85-97.5% expert agreement on generated MCQs |
| Deployment | **Web (PWA)** → **Capacitor** for app stores | PWA-first for India's data-conscious market, Capacitor wrapper for stores |

### B. Combat + JEE/NEET Revision Game

| Component | Technology | Notes |
|-----------|-----------|-------|
| Game engine | **Godot 4.6** | Needs combat mechanics, 2D sprites, possibly light 3D |
| MCQ engine | **LLM + RAG** over JEE/NEET PYQ banks | Use `mcq_generator` patterns. Bloom's taxonomy alignment for difficulty levels |
| Adaptive difficulty | **IRT (Item Response Theory)** + **ts-fsrs** | IRT models question difficulty + student ability simultaneously — standard in competitive exam prep |
| NPC/opponent AI | Custom behavior trees in GDScript | For combat NPCs. LLM-powered hints/explanations via API calls |
| TTS narration | **Google Cloud TTS** (primary) + **Ai Awaaz** (Hindi + regional) | Multi-language support critical for Indian market |
| App distribution | **Godot native export** (Android/iOS direct) | No WebView wrapper needed — native performance |

### C. "Train Your Brain" Zombie Survival

| Component | Technology | Notes |
|-----------|-----------|-------|
| Game engine | **Godot 4.6** | 2D top-down or side-scroller with light 3D elements |
| Art style | **PixelLab** (pixel art sprites) + **Scenario** (consistent style) | AI-generated sprite sheets, tileable textures, character animations |
| Music | **Wondera** (adaptive soundtracks) | Music adapts to gameplay state — tense during zombie waves, calm during study phases |
| Sound effects | **SFX Engine** (free) + **ElevenLabs** (voice) | AI-generated zombie SFX, narration for educational segments |
| Learning integration | **ts-fsrs** + custom "knowledge = power" mechanic | Correct answers = weapon upgrades, health, ammo. Wrong answers = zombie horde gets stronger |

---

## 4. Cross-Platform Deployment Strategy

```
                    Your Codebase
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         Phaser Games  Godot Games  Shared Backend
         (TypeScript)  (GDScript)   (Supabase)
              │          │
      ┌───────┤    ┌─────┤
      ▼       ▼    ▼     ▼
    Web/PWA  Cap.  iOS  Android
    (Vercel) (App  (native export)
              Store)
```

| Channel | Method | Monetization |
|---------|--------|-------------|
| **Web (Mini Games)** | Vercel + PWA | Free-to-play, ad-supported, funnel to paid |
| **Google Play** | Capacitor (Phaser games) or Godot native export | RevenueCat for IAP/subscriptions |
| **Apple App Store** | Capacitor (Phaser games) or Godot native export | RevenueCat for IAP/subscriptions |
| **Direct web** | PWA install prompt | Stripe/Razorpay (bypass 30% store cut) |

### Why Capacitor (not React Native, not Tauri)?

- All TypeScript — same language as Phaser games
- RevenueCat plugin is mature (IAP + subscriptions)
- Proven App Store acceptance
- Offline-first (bundles assets locally)
- Tauri lacks IAP support; React Native adds unnecessary complexity

---

## 5. Backend Infrastructure

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Database + Auth + Realtime** | **Supabase** | PostgreSQL, social auth, real-time leaderboards via WebSockets, edge functions. Open-source (self-host escape hatch) |
| **AI APIs** | **OpenAI GPT-4o** + **Google Gemini** | MCQ generation, adaptive hints, content creation. Use both for redundancy |
| **TTS** | **Google Cloud TTS** + **Ai Awaaz** | Hindi + 10 Indian languages. 4M chars/month free tier |
| **Asset pipeline** | **Ludo.ai** (MCP) + **PixelLab** | Sprites, sounds, music — AI-generated, agentic-workflow-integrated |
| **CI/CD** | **GitHub Actions** + **Vercel** (web) + **Fastlane** (mobile) | Automated testing, preview deploys, store submissions |
| **Analytics** | **PostHog** (open-source) or **Mixpanel** | Learning analytics, retention, engagement |

### Why Supabase over Firebase?

Firebase would work, but it's a Google lock-in trap. Supabase gives you the same features (auth, real-time, storage, edge functions) with PostgreSQL underneath and the ability to self-host if you scale. For an India-focused edtech startup, that exit option matters.

---

## 6. The AI Content Pipeline

This is where i3w gets its moat. Most competitors hand-author all questions. You generate at scale:

```
Textbook Content (NCERT, JEE/NEET PYQs)
            │
            ▼
   RAG Pipeline (LangChain + vector DB)
            │
            ▼
   LLM Generation (GPT-4o / Gemini)
   ├── MCQs aligned to Bloom's Taxonomy
   ├── Distractors validated for plausibility
   ├── Difficulty tagged (K1-K6)
   └── Explanations for each answer
            │
            ▼
   Quality Gate (automated + human review)
            │
            ▼
   ts-fsrs (spaced repetition scheduling)
   + IRT (adaptive difficulty calibration)
            │
            ▼
   Game Integration (questions appear in-game
   as combat challenges, survival puzzles, etc.)
```

### Key tools

- **`mcq_generator`** (open-source, GitHub): 20+ exam rules, EN/Hindi translation, caching
- **ts-fsrs** (npm): TypeScript spaced repetition with 21 tunable weights, `desired_retention` parameter
- **RAG over NCERT**: Ground question generation in actual syllabus, reducing hallucination
- **Bloom's Taxonomy classifier**: Use Gemini-1.5-Pro to classify and generate at K1-K6 cognitive levels

---

## 7. AI Asset Creation Tools

### Visual Art & Sprites

| Tool | Best For | Key Features |
|------|----------|--------------|
| **PixelLab** | Pixel art / retro games | Character animations from text prompts, sprite rotations, tilesets, Aseprite plugin |
| **Scenario** | Consistent art style | Learns and maintains specific styles, tileable textures, sprite sheets |
| **Ludo.ai** | All-in-one game assets | Sprites, icons, UI, textures, backgrounds, sound effects, music, voices; MCP integration |
| **Recraft** | Scalable asset generation | Exports for Unity, Unreal, Godot |

### Music & Sound

| Tool | Best For | Key Features |
|------|----------|--------------|
| **Wondera** | Adaptive game soundtracks | Multi-agent architecture, adapts to gameplay states |
| **Mubert** | Real-time adaptive music | API integration for dynamic in-game music |
| **SFX Engine** | Sound effects | Free, unlimited AI-generated sound effects |
| **ElevenLabs** | Voice acting & SFX | Hyper-realistic AI voices, Hindi support |
| **AudioCraft** (Meta) | Open-source audio | Custom audio generation, self-hostable |

---

## 8. Adaptive Learning & Educational AI

### Spaced Repetition: FSRS

The best open-source algorithm for educational games is **FSRS** (Free Spaced Repetition Scheduler):

- Three core variables: Difficulty, Stability, Retrievability
- 21 tunable model weights
- `desired_retention` parameter (0 to 1)
- TypeScript implementation: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)

### Adaptive Difficulty

- **Bayesian Knowledge Tracing (BKT)**: Estimates probability a student has "learned" a concept
- **Item Response Theory (IRT)**: Models question difficulty and student ability — standard in JEE/NEET
- **Dynamic difficulty adjustment**: Maintain the "flow" zone between boredom and frustration

### Text-to-Speech for Indian Languages

| Service | Hindi | Regional Languages | Best Feature |
|---------|-------|-------------------|-------------|
| **Google Cloud TTS** | Yes | 380+ voices, 75+ languages | 4M chars/month free, WaveNet quality |
| **Ai Awaaz** | Yes | 140+ Indian language voices | Emotion-based TTS (cheerful, angry, whisper) |
| **ElevenLabs** | Yes | Multilingual | Voice cloning, highest quality |
| **Narration Box** | 7 accents | Multiple | Adjustable rate and style |

---

## 9. Phased Rollout

### Phase 1: Foundation (Months 1-3)

- [ ] Set up monorepo with Phaser 4 + Supabase + Capacitor
- [ ] Build first Mini Game (physics simulation with Matter.js)
- [ ] Deploy as PWA on Vercel
- [ ] Set up Claude Code `CLAUDE.md` with project standards
- [ ] Establish AI content pipeline (RAG + MCQ generation)

### Phase 2: Wrapper Games (Months 3-6)

- [ ] Build JEE/NEET Combat game in Godot 4.6
- [ ] Integrate ts-fsrs adaptive learning engine
- [ ] Add Google Cloud TTS for Hindi narration
- [ ] Wrap Phaser mini-games with Capacitor → Play Store
- [ ] Native Godot export → Play Store + App Store

### Phase 3: Super-Wrapper (Months 6-9)

- [ ] Build "Train Your Brain" zombie survival in Godot
- [ ] Integrate Wondera for adaptive music
- [ ] AI asset pipeline via Ludo.ai MCP
- [ ] Cross-platform leaderboards via Supabase real-time
- [ ] Expand to Southeast Asian markets

### Phase 4: Scale (Months 9-12)

- [ ] Scale MCQ generation to cover full JEE/NEET syllabus
- [ ] Add multiplayer via Supabase broadcast/presence
- [ ] A/B test monetization (subscriptions vs. IAP)
- [ ] Regional language expansion (Tamil, Telugu, Kannada, Bengali)

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Godot GDScript has lower AI code-gen accuracy | Use `godot-mcp` + `godot-dodo` fine-tuned models. Keep complex logic in TypeScript shared modules where possible |
| App Store rejection (Apple Guideline 4.2) | Capacitor + native UI elements (tab bar, push notifications, offline handling). Don't ship "lazy wrappers" |
| LLM-generated questions have errors | Mandatory quality gate: automated distractor check + periodic human review batches |
| India's low-bandwidth environments | PWA-first (200KB install). Offline caching via Service Workers. Google Cloud TTS low-latency streaming |
| Single-engine lock-in | Dual-engine strategy: Phaser handles web, Godot handles native. Shared backend (Supabase) is engine-agnostic |
| Vendor lock-in on backend | Supabase is open-source and self-hostable. All AI APIs use multiple providers for redundancy |

---

## 11. Full Stack Summary

```
┌─────────────────────────────────────────────────┐
│                 AGENTIC LAYER                    │
│  Claude Code + Cursor + godot-mcp + Ludo.ai MCP │
├─────────────────────────────────────────────────┤
│                 GAME ENGINES                     │
│     Phaser 4 (web/mini)  │  Godot 4.6 (native)  │
├─────────────────────────────────────────────────┤
│                 AI CONTENT                        │
│  GPT-4o/Gemini + RAG + ts-fsrs + IRT + TTS      │
├─────────────────────────────────────────────────┤
│                 BACKEND                           │
│  Supabase (auth, DB, real-time, edge functions)  │
├─────────────────────────────────────────────────┤
│                 DEPLOYMENT                        │
│  Vercel (web) + Capacitor (stores) + Godot native│
├─────────────────────────────────────────────────┤
│                 ASSETS                            │
│  PixelLab + Scenario + Wondera + SFX Engine      │
└─────────────────────────────────────────────────┘
```

Every layer is **MIT/open-source or API-based** (no vendor lock-in), **TypeScript or GDScript** (maximum LLM training data coverage), and **agentic-workflow-compatible** (MCP integrations, CLI-composable, text-based formats).

---

## Key Sources

### Game Engines
- [Phaser.io](https://phaser.io/) — MIT, 36K GitHub stars, 94% AI code-gen success
- [Godot Engine](https://godotengine.org/) — MIT, 107K GitHub stars, full 2D+3D
- [PixiJS](https://pixijs.com/) — MIT, 46K stars, rendering library (not full engine)
- [godot-mcp](https://github.com/) — MCP bridge for agentic Godot workflows
- [godot-dodo](https://github.com/minosvasilias/godot-dodo) — Fine-tuned LLMs for GDScript

### Agentic Development
- [Claude Code](https://code.claude.com/) — Multi-agent orchestration, verification loops
- [Cursor](https://cursor.com/) — 1M+ DAU, multi-agent IDE, background agents
- [Bolt.new](https://bolt.new/) — Full-stack apps from prompts
- [Ludo.ai](https://ludo.ai/) — All-in-one game assets with MCP integration (Jan 2026)

### Educational AI
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) — TypeScript spaced repetition
- [mcq_generator](https://github.com/csv610/mcq_generator) — LLM-powered MCQ generation
- [PhET Simulations](https://phet.colorado.edu/) — Gold-standard educational physics sims
- [Matter.js](https://brm.io/matter-js/) — 2D physics engine for web

### Backend & Deployment
- [Supabase](https://supabase.com/) — Open-source Firebase alternative
- [Capacitor](https://capacitorjs.com/) — Web-to-native wrapper with RevenueCat IAP
- [Vercel](https://vercel.com/) — Zero-config web deployment
- [RevenueCat](https://www.revenuecat.com/) — Cross-platform IAP/subscription management

### Asset Creation
- [PixelLab](https://www.pixellab.ai/) — AI pixel art and sprite generation
- [Scenario](https://www.scenario.com/) — Consistent-style game asset generation
- [Wondera](https://www.wondera.ai/) — Adaptive AI game soundtracks
- [SFX Engine](https://sfxengine.com/) — Free AI sound effects
- [ElevenLabs](https://elevenlabs.io/) — AI voice and narration
- [Google Cloud TTS](https://cloud.google.com/text-to-speech) — Multilingual TTS with Hindi support
- [Ai Awaaz](https://aiawaaz.io/) — 140+ Indian language voices
