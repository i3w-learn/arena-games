# Data-First Art Pipeline: On-Device, Zero External Tools

> Art is output of code and data, not output of external tools. Everything is text, everything is version-controlled, everything is parameterized.

---

## Toolkit

| Tool | What It Is | Role |
|------|-----------|------|
| **Claude Code** | Opus 4.6, SVG generation, code generation | Characters, UI, animation data, sound parameters |
| **Nano Banana Pro** | Gemini 3 Pro Image — state-of-the-art prompt-adherent image generation | Backgrounds, splash screens, rich visuals that SVGs can't capture |
| **jsfxr** | JavaScript port of sfxr — parametric retro sound generation (MIT, runs in browser) | All sound effects |
| **Tone.js** | Web Audio API wrapper for synthesized audio (MIT) | Richer sounds if jsfxr isn't enough |
| **Puppeteer** | Headless Chrome (npm package) | Renders SVGs to PNG sprite sheets at target resolution |

**Total additional cost: $0.** Token spend on Claude Code and Nano Banana Pro is the only cost, and both are already in the budget.

---

## The Pipeline

```
Character definitions (JSON)  → Claude Code → SVG files       → Phaser textures
Background prompts (text)     → Nano Banana Pro → PNG          → Phaser textures
UI elements (config)          → Claude Code → SVG/CSS          → DOM overlay on canvas
Sound parameters (JSON)       → jsfxr (local) → AudioBuffer   → Phaser audio
Animations (keyframe data)    → Phaser tweens → Runtime
```

Every layer is text-based, version-controlled, and parameterized. Change a value, regenerate the asset.

---

## Layer 1: Characters and Game Objects — Claude Code SVGs

Claude Code generates precise SVGs from data specifications. A character is defined as structured data:

```json
{
  "name": "player",
  "style": "flat-geometric",
  "height": 64,
  "palette": ["#E63946", "#1D3557", "#F1FAEE"],
  "body": "humanoid",
  "armor": "light",
  "weapon": "energy-blade",
  "poses": ["idle", "attack", "hit", "victory"]
}
```

Claude generates an SVG for each pose. These SVGs are:

- **Text files** — diffable, version-controlled, code-reviewable
- **Parametric** — change the palette, regenerate a recolored variant for a new opponent
- **Resolution-independent** — scales perfectly on any phone screen (critical for PWA across India's device landscape)
- **Style-consistent by construction** — same generation logic produces the same visual language every time

For sprite sheets, render SVGs to PNGs at target resolution via Puppeteer. Or load SVGs directly into Phaser.

Opponent variety comes from parameter variation: same character structure, different palettes, different weapon types, different armor configs. The game designer defines the parameters, Claude Code generates the variants.

---

## Layer 2: Backgrounds and Rich Visuals — Nano Banana Pro

Where SVGs hit their limits — painterly textures, atmospheric lighting, detailed environments — Nano Banana Pro fills in. Its prompt adherence means style-locked prompts produce consistent results:

```
Battle arena, 2D side view, flat geometric art style using only
the palette #E63946 #1D3557 #F1FAEE #457B9D #A8DADC.
Clean vector aesthetic, no gradients, hard color boundaries.
Dark background, dramatic lighting from above. No text.
```

Swap the final line for variations:
- `Ancient stone temple with pillars, dramatic shadows`
- `Neon-lit cyberpunk lab with glowing terminals`
- `School rooftop at dusk, city skyline silhouette`

The style constraint in the prompt mirrors the SVG palette — AI-generated backgrounds match code-generated characters because both are locked to the same color system. Consistency comes from data, not from luck.

---

## Layer 3: UI — Pure SVG/CSS

Health bars, question panels, answer buttons, damage numbers — all of this is UI, not art. Code it directly:

- **Health bar:** SVG `<rect>` whose width is bound to game state
- **Damage numbers:** CSS-animated text elements with scale + fade transitions
- **Answer buttons:** Styled HTML overlaid on the Phaser canvas, minimum 48px touch targets
- **Question panel:** CSS with backdrop blur over the battle scene
- **Victory/defeat screens:** CSS transitions and SVG compositions

Zero art tools needed. The game designer specifies the design system (spacing, typography, colors, animation curves), Claude Code implements it.

---

## Layer 4: Sound — jsfxr

jsfxr is the JavaScript port of sfxr — the tool indie developers have used for decades to generate game sounds from parameters. A sound effect is a data object:

```json
{
  "type": "hit",
  "waveform": "square",
  "frequency": 440,
  "decay": 0.3,
  "punch": 0.6
}
```

Parameters in, audio buffer out. No API calls, no credits, no subscriptions. Runs entirely in the browser or as a build-time script.

Arena Battle needs roughly 6-10 sounds:

| Sound | Approach |
|-------|----------|
| Player attack | jsfxr — sharp, percussive, rising pitch |
| Opponent hit | jsfxr — impact with low-frequency punch |
| Player takes damage | jsfxr — descending tone, slight distortion |
| Correct answer | jsfxr — bright two-tone chime |
| Wrong answer | jsfxr — low buzzer |
| Victory | jsfxr — ascending arpeggio |
| Defeat | jsfxr — descending minor arpeggio |
| Button tap | jsfxr — soft click |
| Battle start | jsfxr — dramatic swell |

The sound designer adjusts parameters until the sounds feel right — same feedback loop as adjusting SVG coordinates or animation timing.

For richer audio (background ambience, music stings), Tone.js (Web Audio API wrapper) synthesizes more complex sounds — still fully local, still parameterized, still free.

---

## Layer 5: Animation — Code, Not Sprite Sheets

Instead of frame-by-frame sprite animation, use transform-based animation on SVG groups. Define animations as data that Phaser's tween system executes:

```json
{
  "attack": [
    { "target": "body", "property": "x", "to": 50, "duration": 200, "ease": "quad.out" },
    { "target": "weapon", "property": "angle", "to": -45, "duration": 150, "ease": "back.out" },
    { "target": "impact", "property": "scale", "from": 0, "to": 2, "duration": 100 }
  ]
}
```

| Animation | Technique |
|-----------|-----------|
| Attack | Translate character forward, rotate weapon group, scale impact effect |
| Take damage | Translate backward, flash opacity, screen shake (camera transform) |
| Victory | Scale up, rotation, particle burst (Phaser particle emitter) |
| Defeat | Slump (rotation), fade to grayscale (tint) |
| Question appear | Slide up from bottom with spring easing |
| Correct answer | Green flash, brief scale pulse on player |
| Wrong answer | Red flash, brief shake on player |

The game designer tweaks duration and easing values until the game feels right. No sprite sheets, no external animation tools. Changes are instant — edit a number, reload.

---

## Art Style: Bold Flat Geometric

The data-first pipeline naturally produces a specific aesthetic: bold, flat, geometric. This is a strength for Arena Battle, not a limitation.

**Why this works for the teen demographic:**

- **Sophisticated, not childish.** Flat geometric design reads as modern and premium. It's the aesthetic of Monument Valley, Alto's Odyssey, and every trending mobile app. Teens recognize it as design-forward, not as "educational game."
- **Visually consistent by default.** Everything comes from the same palette and the same generation logic. No risk of collage-effect from mixing outputs of different AI art tools.
- **Animates cleanly.** Transforms on crisp shapes look intentional. No subpixel jitter, no frame interpolation artifacts.
- **Scales to any screen.** SVGs are resolution-independent. The PWA looks sharp on a Redmi Note and an iPhone 16 alike.

**Nano Banana Pro fills the richness gap.** Backgrounds and splash screens get atmospheric depth and painterly texture that pure SVGs can't deliver, while characters stay crisp and code-defined. The style-locked prompts ensure AI-generated raster art matches code-generated vector art.

---

## What This Means for Each Team Member

### Game Designer

Their role shifts from tool operator to creative director of a generative system:

- Write the **visual identity as data**: color palettes as hex arrays, proportions as ratios, spacing as numbers, animation curves as easing functions
- Prompt Claude Code for SVG characters, review output, iterate by adjusting the data spec
- Write Nano Banana Pro prompts for backgrounds with style-locking constraints
- Tweak animation timing values and easing curves until the game feels right
- Adjust jsfxr parameters until sounds match the visual tone
- The visual identity doc from the design plan becomes a **JSON config file** that drives the entire pipeline — change the palette once, regenerate everything

### Backend Engineer

- Builds the Phaser rendering layer that loads SVGs, applies tweens, and plays jsfxr sounds
- The `rendering/` folder consumes data files (SVG assets, animation JSON, sound parameters) and turns them into the game experience
- Practices the separation of state from presentation — game logic never references specific SVG paths or tween values

### Tech Lead

- The content pipeline is unchanged — MCQ generation, FSRS scheduling, quality gates
- The API contract with the game is unchanged — the game still calls `/api/questions` and gets questions back
- May help set up the Puppeteer build step for SVG-to-PNG rendering if needed

---

## Comparison: External Tools vs. Data-First

| Dimension | External Tools (PixelLab, Scenario, etc.) | Data-First (Claude Code + Nano Banana Pro) |
|-----------|------------------------------------------|-------------------------------------------|
| Monthly cost | $9-37/mo in subscriptions | $0 additional (token spend already budgeted) |
| Style consistency | Depends on careful prompting across different tools | Guaranteed by shared palette and generation logic |
| Version control | Binary PNGs in git (bloats repo) | SVG text files, JSON configs (clean diffs) |
| Iteration speed | Re-run tool, download, import | Edit a value, reload the game |
| Reproducibility | Stochastic (different result each run) | Deterministic for SVGs, style-locked for Nano Banana Pro |
| Team skill required | Tool-specific workflows to learn | Prompt engineering + JSON editing (skills the team already has) |
| Vendor dependency | Tied to tool availability and pricing changes | Self-contained except for LLM API access |
