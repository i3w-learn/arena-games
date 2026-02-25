Since your team member is already highly fluent in Claude Code and agentic orchestration, their 20% time (about 1 day a week) shouldn't be spent writing boilerplate. Instead, they should act as an **"Agent Manager,"** setting up the boundaries, writing the `.cursorrules` or `CLAUDE.md`, and letting parallel instances of Claude Sonnet 4.6 or o3-mini do the heavy lifting in the background.

Here are four high-ROI, strictly bounded 20% projects that de-risk your biggest technical unknowns. 

---

### 1. The "One-Click Phaser Factory" (De-risking Track 1)
**The Concept:** Create a fully automated pipeline where Claude Code is instructed to generate a single, functional Phaser 4 / Matter.js physics mini-game from a single prompt, deployed automatically to Vercel. 
*   **The 20% Effort:** The dev spends their time writing the ultimate `CLAUDE.md` constraint file for Phaser 4 and setting up the CI/CD pipeline, not coding the game. They run Claude Code, say *"Build a gravity-inversion puzzle,"* and review the output.
*   **Maximum ROI:** Validates if Track 1 (Mini Games) can actually be built at scale with zero bloat. If successful, you have an internal tool to churn out web-based physics simulations instantly.
*   **Strict Boundaries:** 
    *   *In bounds:* A gray-box physics simulation.
    *   *Out of bounds:* Adding graphics, sound, menus, or monetization. Primitive shapes only.

### 2. The "Infinite Syllabus" RAG Pipeline (De-risking Content)
**The Concept:** The hardest part of the "Combat + JEE/NEET" game isn't the combat; it's the quality of the MCQs. Have the dev build a headless Node/TypeScript script that ingests a single NCERT Physics chapter PDF, uses `o3-mini` to extract concepts, and outputs a JSON array of K1-K6 Bloom's Taxonomy questions with validated distractors.
*   **The 20% Effort:** Writing the extraction prompts, setting up Supabase `pgvector`, and tuning the OpenAI `o3-mini` reasoning parameters to prevent hallucinations.
*   **Maximum ROI:** You immediately gain the "Content Moat." You can generate 1,000 flawless, syllabus-accurate questions before the game engine is even booted up.
*   **Strict Boundaries:**
    *   *In bounds:* One single PDF chapter to JSON array.
    *   *Out of bounds:* Any frontend UI, game integration, or adaptive learning (`ts-fsrs`). Just the static generator.

### 3. The "Godot-MCP Reality Check" (De-risking Track 2 & 3)
**The Concept:** You are betting heavily on Godot 4.6.1 + `godot-mcp` for your agentic workflow. This is a brilliant but bleeding-edge bet. Use this 20% time purely as a technical spike to prove the agent-to-engine connection works.
*   **The 20% Effort:** The dev sets up Claude Code locally, connects the Godot MCP, and attempts to get the AI to generate a 1-room scene with a controllable 2D character (using GDScript) entirely via CLI prompts. 
*   **Maximum ROI:** Proves whether your core thesis for Wrapper Games is viable right now, or if it requires more human intervention than expected.
*   **Strict Boundaries:**
    *   *In bounds:* Getting a square to move in Godot via AI commands without opening the Godot Editor manually.
    *   *Out of bounds:* Designing the zombie game, adding physics interactions, or making it look good.

### 4. The "Brain Training API" Headless Simulator (De-risking the Core Loop)
**The Concept:** Build the backend logic for the "Zombie Survival + ts-fsrs" game without any visuals. A simulated "student script" interacts with a Supabase Edge Function, answering questions right/wrong. The backend calculates the FSRS spaced-repetition weights and returns "Zombie Horde Strength" and "Player Ammo."
*   **The 20% Effort:** Wiring up the `ts-fsrs` npm package inside a Supabase Edge Function and writing a basic test script to simulate 100 days of gameplay.
*   **Maximum ROI:** Proves that the "educational progression = game progression" math actually works and is fun/balanced before spending a dime on pixel art.
*   **Strict Boundaries:**
    *   *In bounds:* Console logs showing "Day 5: Player answered wrong. Retention dropped to 82%. Zombie speed increased."
    *   *Out of bounds:* Any Godot integration, Phaser integration, or actual user accounts.

---

### How to Enforce the 20% Model for an Agentic Dev

To ensure this doesn't bleed into their main work, set these operational rules:

1.  **Asynchronous Execution:** Because they are fluent in Claude Code, their 20% time shouldn't be a single 8-hour block. It should be 30 minutes of prompting/orchestrating at the end of the day, leaving the agents to run, test, and fail in loops overnight. The next morning, they review the logs/PRs over coffee.
2.  **No "Fixing" AI Code:** If Claude Code spits out a broken Godot script, the dev is *not* allowed to open the file and fix the logic manually. Their job is to fix the `CLAUDE.md` instructions or the prompt, and run the agent again. This forces the creation of a repeatable, systemic process rather than a one-off hack.
3.  **The "Friday Demo" Constraint:** At the end of every week, they must record a 3-minute Loom video of the CLI or the output. If it's just a JSON file of 50 generated physics questions, that's a perfect demo.

**Recommendation:** Start with **Project #2 (The Infinite Syllabus)**. It requires zero game engine context switching, relies entirely on their LLM fluency, and generates massive, tangible value for the company even if the games take another 6 months to build.
