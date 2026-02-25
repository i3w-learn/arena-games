# Product Sliver Options — i3w JEE/NEET

*Options under consideration, not final decisions.*

---

## Approach A (Recommended): Three Sequential Slivers, One Product

One product shipped in three stages, each independently launchable.

- **Sliver 1 — The Content Engine:** Headless MCQ generator (NCERT PDF in, Bloom's-classified, FSRS-tagged JSON out). Tech Lead drives. *Validates: can we generate quality content at scale?*
- **Sliver 2 — The Daily Challenge:** PWA serving 5 FSRS-scheduled JEE/NEET questions/day. Clean UI, streak counter, shareable scorecard. 3-5 min sessions. Backend Engineer drives. *Validates: will students return daily?*
- **Sliver 3 — The Competitive Layer:** Async challenge-a-friend (both answer the same questions independently, compare scores), Elo rating, leaderboards. Both collaborate. *Validates: does competition drive virality?*

**Monetization hook:** Free = 5 questions/day. Premium = unlimited + topic selection + explanations + analytics.

**Learning framework alignment:** TL practices quality evaluation (Sliver 1), BE practices state machines and separation of concerns (Sliver 2), both practice architecting for composition (Sliver 3).

---

## Approach B: Single-Sliver "Daily Duel"

Ship real-time synchronous quiz battles from day one.

- **Pro:** Focused.
- **Con:** Real-time synchronous multiplayer is hard for an early-career engineer; cold start problem with matchmaking.

---

## Approach C: Content-First, Game-Never (Until Proven)

Build content pipeline only, sell as B2B API to coaching centers.

- **Pro:** Fastest to revenue, plays to team strengths.
- **Con:** Doesn't validate core thesis (teens engage with education embedded in gameplay); no architectural learning from game dev.
