# Changelog

Versions follow [Semantic Versioning](https://semver.org). Note that the
address space is part of the contract: a change to the vocabulary or the line
shapes renumbers every haiku, and would be a new major version or a new
edition rather than a patch.

## 3.1.0 — 2026-11-07

Accessibility, display themes, and review follow-ups. No change to the
vocabulary or templates, so every address still opens the same haiku.

### Added
- Display control in the header: match system, light, dark or high contrast.
  The choice is remembered in the browser and applied before first paint.
  High contrast is white on black at 10:1 or better with heavier type, and
  also engages when the operating system asks for more contrast.
- Skip link to the haiku. Status messages and search results are announced
  to screen readers. The single-key `r` shortcut can be switched off.
- Accessibility section in the README, and a changelog.

### Changed
- Searching a whole haiku with a line that fits no shape now says which line
  fails and whether it needed five or seven syllables, instead of searching
  all the words as one phrase.
- Phrase search reports the number of distinct line shapes that can hold the
  phrase, not the number of template offsets.
- "Open an address" accepts `No. 5,000`, `#5000`, `5 000` and `5_000`, and
  rejects anything else that is not a plain number.
- Control borders and the light-mode focus ring meet 3:1 contrast. Every
  focusable element shows the same 3px focus ring.
- Previous, Wander and Next share one row on phones.
- `npm test` runs `node --test` without a shell glob, so it works on Windows
  with Node 20.

### Fixed
- Browser shortcuts such as Ctrl+R and Alt+Left no longer also trigger
  wander or navigation.
- Back and forward no longer render the haiku twice.
- `decode()` throws the documented `RangeError` for every non-address input.
- Motion is switched off under `prefers-reduced-motion`; borders and focus
  stay visible under Windows High Contrast.
- The Pages workflow can be enabled on a fresh fork; the README explains the
  one manual step.

## 3.0.0 — 2026-11-05

The pivot. Every Haiku became a finite, fully enumerable library: 20 × 22 × 20
halls of line shapes, 419 words, 34,985,525,500,137,095,382,456 haikus, each
computed from its address and located back to it. One static page, no build
step, no dependencies, no accounts, deployed to GitHub Pages.

Removed the Firebase backend, Cloud Functions, Firestore rules, Cypress suite
and the AI generator from versions 1 and 2. That code remains in the git
history before this release.
