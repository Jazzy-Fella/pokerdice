# Poker Dice — Agent Handoff

**Repo:** `/Users/alex.jarrett/Documents/Projects/poker-dice/`  
**Single file:** `index.html` (all HTML, CSS, and JS in one file)  
**Preview server:** port 5555 (defined in `.claude/launch.json`)  
**Remote:** https://github.com/Jazzy-Fella/pokerdice.git  

---

## What the project is

A mobile-first browser poker-dice game with four modes:
- **Classic** — free play, no scoring
- **Score** — 5 rounds, points per hand banked
- **Betting** — players bet a pot each round, winner takes all
- **Wild** — Betting + wild die outcomes (dark dice, extra rolls, etc.)

All game logic, CSS, and HTML live in `index.html`. There is no build step — the dev server just serves the static file.

---

## Architecture notes

| Concept | Details |
|---|---|
| `gameMode` | `'free' \| 'score' \| 'bet' \| 'wild'` |
| `currentTurn` | `'human' \| 'cpu' \| 'bet' \| 'wild-roll'` etc. |
| `pState[]` | Per-player state — `pts`, `handQ`, `chips`, `eliminated`, etc. |
| `players[]` | Player config — `name`, `isAI`, `chips` |
| `dealerIdx` | Index of the current dealer (rotates each round in bet/wild) |
| `currentPlayerIdx` | Index of the player whose turn it is |
| `bContrib[]` | Per-player bet contributions shown during betting round |
| `wildRenderOpts()` | Returns `{blankMask, lockedIdx, wildChargeable}` — **must** be spread into every `renderTray()` call so CPU respects dark/locked dice |

**Key CSS classes:**
- `.bp-off` / `.table-bp-off` — collapse betting panel without display:none reflow
- `setBettingPanelOff(bool)` — helper that toggles both atomically
- `#wild-outcome-badge` uses `visibility:hidden/visible` (NOT display) to avoid shifting dice

**Score mode tiebreak:**
- `pState[i].handQ` accumulates `hand.tiebreak` values across rounds
- Used at game-over when two players have identical `pts`

---

## Recent changes (all shipped to main)

| Commit | What changed |
|---|---|
| `0669a41` | Condensed score mode hand-reference grid (font 0.60rem, tight padding) so it clears the fixed Change Mode button on mobile |
| `aa8a207` | (superseded — was a scroll approach that didn't work on real mobile) |
| `3b1f144` | Removed player names from status text ("x is thinking" → "Thinking…") |
| `52de091` | Renamed "in:" → "bet:" on scoreboard bet-contribution label |
| `5b4112d` | Show each player's current bet amount under their name during betting round |
| `e802ad0` | Removed `+x pts` from CPU bank status message |
| `8c834c3` | Fixed CPU "Two Dice Go Dark" — dark dice now revealed at end of turn, not immediately |
| `bed518e` | Removed `+x pts` from hand name banner in bet/wild modes |
| `d304bd6` | Wild outcome badge no longer shifts dice (uses visibility, fixed height) |
| `f3a5983` | Fixed Two Pair tie-breaking; kicker shown in round-winner popup |
| `f6ceb97` | Table background hidden between betting turns (no empty green box) |
| `e9e4c3d` | Betting panel no longer grows/shrinks between players (bp-off class) |

---

## Known layout constraints (mobile, 375×812)

- `body { height: 100dvh; overflow: hidden }` — no page scroll; everything must fit in viewport
- `#game-change-mode-btn` is `position: fixed; bottom: 14px` — floats above all content
- Score mode: the hand-reference grid (`#score-hand-ref`) was previously colliding with the button. Fixed by condensing `.shr-grid` padding/font. Current gap ≈ 2px — tight but clear.
- If layout breaks on a specific device, check `#score-hand-ref` bottom vs `#game-change-mode-btn` top in DevTools.

---

## How to run / test

```bash
# The preview server on port 5555 serves index.html directly.
# In Claude Code, use the preview_start tool with name "poker-dice".
# Then use preview_screenshot / preview_eval to inspect.

# To navigate to score mode via eval:
document.querySelectorAll('.mode-card')[1].click();
setTimeout(() => document.querySelector('.btn-setup')?.click(), 100);
```

---

## Pending / known issues

None outstanding. All reported bugs have been fixed and pushed.

---

## Things to be careful about

1. **Always spread `wildRenderOpts()`** into `renderTray()` calls for CPU — without it, dark dice appear immediately instead of at turn end.
2. **`setBettingPanelOff()`** must be used instead of toggling `display` directly on the betting panel, or the grow animation reappears.
3. **Wild outcome badge** — use `visibility` not `display` to show/hide it, or it shifts the dice tray.
4. **Score tiebreak** — `handQ` must be accumulated in `bankHand` for the `scoreShowGameOver` tiebreak to work. Don't zero it out between rounds.
