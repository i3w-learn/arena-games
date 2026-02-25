# Design Document: Arena Battle Prototype (Proof-of-Pipeline Sliver)

## 1. Project Goals & Philosophy

This project is a "Proof-of-Pipeline Sliver." It is a tiny, playable prototype (one battle, one opponent, 5 hardcoded questions) designed to prove two things:

1. **The Data-First Art Pipeline:** We can build a playable, visually distinct game using zero external raster art (PNG/JPG). All visuals are generated as SVGs (via Claude Code) and all sounds are generated via `jsfxr` parameter arrays. This proves we don't need a dedicated human artist to build MVP content.
2. **Developer Onboarding:** This is a safe sandbox for a backend developer to learn frontend tooling (Vite, TypeScript) and game development (Phaser 3). 

**The Human-AI Dynamic:**
Instead of three autonomous AI agents arguing over strict architectural contracts, this is a **human-led project aided by Claude Code**. 
* **The Human (You):** Focuses on learning the framework, wiring up the game loop, and writing readable, standard Phaser code.
* **Claude Code (AI):** Acts as your pair programmer. It will generate the boilerplate, write the SVG files, output the jsfxr sound parameters, and maintain project consistency. 

## 2. Game Design & The State Machine

One complete battle: Player vs. one AI opponent. Five hardcoded JEE Physics (Thermodynamics) questions. 
* **Fixed damage model:** 20 HP per hit, 100 HP total per character, 5 questions total.
* **Damage math:** 3 correct + 2 wrong → opponent at 40 HP, player at 60 HP. A draw is impossible.

### Flow / State Loop
1. **BATTLE_INTRO:** Show both characters and health bars at 100%. Play the battle start sound. Auto-transition after 1.5s to the question phase.
2. **QUESTION_DISPLAY:** Show question text + 4 answer buttons. Enable input.
3. **ANSWER_RESOLVE:**
    * **If Correct:** Player attacks opponent (Tween animation). Opponent HP -= 20. Update health bar. Play correct sound + attack sound.
    * **If Wrong:** Opponent attacks player. Player HP -= 20. Update health bar. Play wrong sound + attack sound. Show correct answer explanation for 1.5s.
4. **CHECK_END_CONDITIONS (in order):**
    * If opponent HP ≤ 0 → VICTORY
    * If player HP ≤ 0 → DEFEAT
    * If all 5 questions exhausted → Compare HP. Highest HP wins.
    * Else → Loop back to QUESTION_DISPLAY.

## 3. Architecture & Tech Stack

**Stack:** Phaser 3.88 (latest stable, NOT Phaser 4 beta), Vite, TypeScript (strict mode).

**Simplicity First (The Anti-Spaghetti Rule):**
We are avoiding complex pub/sub event buses and deeply nested generic types. The architecture should be standard Object-Oriented game development:
* **UI/Rendering:** Managed by Phaser `Scenes` (e.g., `BootScene`, `BattleScene`, `VictoryScene`, `DefeatScene`).
* **Game Logic:** Managed by a simple vanilla TypeScript class (e.g., `BattleSystem` or `GameState`) that the `BattleScene` instantiates and queries.
* **Animations:** Written directly in the Scene using standard Phaser Native Tweens (`this.tweens.add({...})`). 
* **Static Assets:** Vite handles the dev server. All SVGs and JSON data files live in the `public/assets/` folder so they can be loaded at runtime without Vite hashing their filenames.

## 4. Simple TypeScript Contracts

These are the core data structures. They are plain, readable interfaces. No discriminated unions or generics.

```typescript
// src/types.ts

export interface MCQ {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface CharacterState {
  name: string;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
}

export interface GameState {
  player: CharacterState;
  opponent: CharacterState;
  currentQuestionIndex: number;
  score: number;       // Number of correct answers
  isGameOver: boolean;
}
```

## 5. The Data-First Art Pipeline

To prove we can iterate rapidly without traditional assets, the game relies on text-based media.

### Visuals: SVGs Only
All characters and UI elements will be SVGs. You will prompt Claude Code to generate these. 
* **Requirement:** The SVGs must be well-formed XML and use named `<g>` (group) tags (e.g., `<g id="body">`, `<g id="weapon">`). This allows Phaser to load the SVG and allows you to apply tweens to specific parts of the character if you wish, or just tween the whole sprite.
* **Visual Identity Palette:** Primary/Fire (#E63946), Dark Base (#1D3557), Light/Text (#F1FAEE), Accent/UI (#457B9D), Health (#A8DADC).

### Audio: jsfxr JSON
Instead of audio files, we use `jsfxr` (a JavaScript port of sfxr). The parameters for the sound effects will be stored in a JSON file. This allows a human to go to [sfxr.me](https://sfxr.me/), tweak sliders until a sound is punchy, copy the array of numbers, and paste it into the JSON file.

```json
// public/assets/sounds/sound-params.json
{
  "correct": [2, , 0.2, , 0.3, 0.5, , , , , , , , , , , , , 1, , , , , 0.5],
  "wrong": [3, , 0.3, , 0.2, 0.2, , , , , , , , , , 0.4, , , 1, , , , , 0.5],
  "attackHit": [3, , 0.1, , 0.1, 0.3, , 0.4, , , , , , , , , , 1, , , , , 0.5]
}
```

## 6. Implementation Plan (Feature-Driven)

This is the recommended path for the backend developer to build the game, feature by feature, to naturally learn the tooling.

**Step 1: Scaffolding & Claude Setup**
* Initialize a Vite + TypeScript project. 
* Install Phaser 3.88.
* Have Claude Code generate the SVGs based on the Visual Identity palette.
* Have Claude Code set up its own `CLAUDE.md` to establish project context (see Section 7).

**Step 2: Static UI & Asset Loading**
* **Goal:** Learn how Phaser puts things on screen.
* Create a `BootScene` to preload the SVGs and a `BattleScene` to display them.
* Draw the player, the opponent, basic rectangles for health bars, and standard Phaser Text objects for the questions and answer buttons. Don't worry about logic yet.

**Step 3: Game Logic & Interaction**
* **Goal:** Learn Phaser input handling and vanilla TS integration.
* Create the `BattleSystem` class to hold the HP and Question array.
* Make the answer buttons interactive (`button.setInteractive().on('pointerdown', ...)`)
* When clicked, update the state, calculate damage, and write a simple `updateUI()` function in your scene to redraw the health bars and text.

**Step 4: Visual Juice (Native Tweens)**
* **Goal:** Learn the Phaser Tween API.
* In `BattleScene`, write functions like `playPlayerAttack()`. Use `this.tweens.add()` to physically move the SVG sprite across the screen, bounce off the opponent, and return to its starting position. 
* Tween the health bar width so it shrinks smoothly rather than snapping instantly.

**Step 5: Audio & Scene Management**
* **Goal:** Learn audio and transitioning states.
* Write a simple wrapper to load the arrays from `sound-params.json` into jsfxr and play them during the attack phases.
* Add logic to detect game over. Use `this.scene.start('VictoryScene')` or `DefeatScene` to transition away from the battle.

## 7. Instructions for Claude Code (AI Assistant Guidelines)

*Note for the Developer: Hand this section's intent over to Claude Code and let it do the heavy lifting.*

**Task 1: Generate `CLAUDE.md`**
Do not enforce a hardcoded `CLAUDE.md` template. Instead, prompt Claude Code with:
> *"Read the Arena Battle Design Document. We are using Vite, TypeScript, and Phaser 3.88. Generate a `CLAUDE.md` file for this repository. It should define your system prompts, note the visual identity palette, specify that all art must be SVG and placed in `public/assets/`, and establish standard OOP Phaser practices. You decide how best to structure this markdown file to keep yourself aligned as we build."*

**Task 2: Asset Generation**
Use Claude Code to generate all the mundane stuff:
> *"Generate 5 flat, geometric SVGs using only the colors in the visual identity. 1 Player idle, 1 Player attack, 1 Opponent idle, 1 Opponent attack, 1 UI button frame. Place them in `public/assets/`."*

**Task 3: Assistance, not Dominance**
If you get stuck on Phaser syntax (e.g., "How do I make text wrap in a Phaser button?"), ask Claude Code. Ensure it gives you *standard Phaser 3 answers*, not highly abstracted custom classes.

## 8. Hardcoded Question Bank

Store these in a simple array in a `QuestionBank.ts` file. 

* **Topic:** JEE Physics (Thermodynamics) - NCERT Class 11.
* **Level:** Bloom’s 2–3 (Understanding/Application).

1. **Q:** In an isothermal expansion of an ideal gas, which of the following is true?
   * A) Internal energy increases
   * B) Heat is removed from the system
   * C) Work done by the gas is equal to heat absorbed *(Correct)*
   * D) Pressure remains constant
   * *Explanation:* Temperature is constant, so change in internal energy is zero. By First Law (dQ = dU + dW), dQ = dW.

2. **Q:** A Carnot engine operates between 500 K and 300 K. What is its maximum theoretical efficiency?
   * A) 20%
   * B) 40% *(Correct)*
   * C) 60%
   * D) 80%
   * *Explanation:* Efficiency = 1 - (T_cold / T_hot) = 1 - (300/500) = 1 - 0.6 = 0.4 = 40%.

3. **Q:** During an adiabatic process, the pressure of a gas is found to be proportional to the cube of its temperature. The ratio of Cp/Cv for the gas is:
   * A) 1.5 *(Correct)*
   * B) 1.67
   * C) 1.33
   * D) 1.4
   * *Explanation:* P ∝ T^3. We know for adiabatic, P^(1-γ) * T^γ = constant. Therefore, γ / (γ - 1) = 3, which solves to γ = 1.5.

4. **Q:** Which law of thermodynamics establishes the concept of temperature?
   * A) Zeroth Law *(Correct)*
   * B) First Law
   * C) Second Law
   * D) Third Law
   * *Explanation:* The Zeroth Law states that if two systems are in thermal equilibrium with a third, they are in equilibrium with each other, defining temperature.

5. **Q:** For a cyclic process, the change in internal energy of the system is:
   * A) Equal to the heat absorbed
   * B) Zero *(Correct)*
   * C) Equal to the work done
   * D) Always positive
   * *Explanation:* Internal energy is a state function. Since the system returns to its initial state, dU = 0.

## 9. Verification Criteria

Once the developer believes the sliver is complete, it must pass these tests:

### Functional Tests
1. **Launch:** `npm run dev` opens the game in the browser with no console errors.
2. **Battle Intro:** SVGs are visible. Health bars at 100%.
3. **Correct Answer Flow:** Tapping the right answer plays an attack animation (Phaser tween), drops opponent HP by 20, shrinks the opponent health bar, and plays a sound.
4. **Wrong Answer Flow:** Tapping the wrong answer drops player HP by 20, shows an explanation for 1.5 seconds, and plays an attack sound.
5. **Game Over:** Battle strictly ends after 5 questions or if an HP reaches 0. Shows a Victory or Defeat screen.
6. **Restart:** Clicking "Play Again" completely resets HP, pulls the questions again, and restarts the flow.

### Pipeline Proof Tests (The Thesis Check)
1. **Change Colors:** Edit a hex code inside the SVG files directly. Reload the browser. The character should appear in the new color without touching any TypeScript.
2. **Change Sound:** Open `sound-params.json`, change the first number in the `correct` array from `2` to `0`. Reload the browser. The sound should instantly sound completely different without touching any TypeScript. 

*If both pipeline tests pass, you have successfully built a data-driven game architecture where content can be iterated on separately from the code!*
