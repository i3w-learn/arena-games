# Arena Battle — Proof-of-Pipeline Sliver

## Architecture Rules (Non-Negotiable)

1. Files in `src/state/` and `src/systems/` NEVER import from Phaser
2. Files in `src/rendering/` NEVER directly modify BattleState properties
3. All state-to-rendering communication flows through EventBus
4. All animation values come from `public/assets/animations/animation-spec.json`
5. All sound parameters come from `public/assets/sounds/sound-params.json`
6. All visual design values (colors, dimensions, timing) come from the Visual Identity below

Violations of rules 1-3 are bugs — same priority as crashes.

## Visual Identity

- **Palette:**
  - Primary (fire/attack): #E63946
  - Dark base: #1D3557
  - Light (text/highlights): #F1FAEE
  - Accent (UI): #457B9D
  - Secondary (health): #A8DADC
- **Background:** CSS linear gradient from #1D3557 to #0D1B2A (no image)
- **Characters:** 128px height, 2px line weight, bold flat geometric style
- **Touch targets:** minimum 48px
- **Font:** system sans-serif stack
- **Timing:**
  - Battle intro delay: 1500ms
  - Explanation display: 1500ms
  - Inter-question delay: 500ms

## File Ownership

| Folder | Owner | Rule |
|--------|-------|------|
| `src/state/` | Tech Lead | Pure data. No Phaser. |
| `src/systems/` | Tech Lead | Logic only. No Phaser. |
| `src/events/` | Tech Lead | Typed pub/sub. No Phaser. |
| `src/rendering/` | Backend Engineer | Reads state, never writes directly. |
| `public/assets/` | Game Designer | JSON + SVG data files only. |
| `src/types.ts` | Tech Lead | Shared contract. |
| `src/main.ts` | Tech Lead | Phaser config only. |

## Tech Stack

- **Engine:** Phaser 3.88 (latest stable, NOT Phaser 4 beta)
- **Language:** TypeScript (strict mode)
- **Build:** Vite
- **Sound:** jsfxr (parametric, from JSON arrays)
- **Art:** SVG only (Claude Code generated, no external tools)

## State Machine

```
BATTLE_INTRO → QUESTION_DISPLAY → ANSWER_RESOLVE → check:
  opponent HP ≤ 0 → VICTORY
  player HP ≤ 0 → DEFEAT
  all 5 questions done → compare HP → VICTORY or DEFEAT
  else → QUESTION_DISPLAY
```

## Damage Model

- 20 HP per hit, 100 HP total, 5 questions per battle
- Draws impossible with symmetric damage
