# Phase 4: Polish & Mobile UX

## Context

Moved ahead of Phase 3B (MongoDB). This phase takes the game from "works" to "feels great on a phone." Every item here is client-side — no infrastructure dependencies. This is the last phase before soft launch to friends & family.

## Why Before MongoDB

- Friends/family will forgive a `.vercel.app` URL. They won't forgive a janky mobile experience.
- The "come back tomorrow" countdown is the #1 missing retention hook.
- `navigator.share()` is the #1 missing virality hook (80%+ traffic is mobile).
- Accessibility is cheaper to build in now than to retrofit after launch.
- None of this work touches the data layer — zero conflict with Phase 3B.

## High Impact

### 1. "Come Back Tomorrow" Countdown on RevealScreen

**File:** `components/RevealScreen.tsx`

- Calculate seconds until midnight UTC
- Display countdown: `HH:MM:SS` until next question
- Update every second via `setInterval`
- Show below the share button area
- Style: muted text, small font, subtle — not the focus of the screen

### 2. Web Share API (Mobile Native Share Sheet)

**File:** `components/ShareButton.tsx`

- Check `navigator.share` availability
- On mobile: use `navigator.share({ text })` for native share sheet
- On desktop / unsupported: fall back to `navigator.clipboard.writeText()`
- Wrap both in try/catch — in-app browsers (Instagram, Twitter) may throw
- Show "Shared!" or "Copied!" feedback based on which path was taken

### 3. Progress Bar Fill Animation

**File:** `components/GuessRow.tsx`

- Mount progress bar at `width: 0`
- Animate to target width via `useEffect` + CSS transition
- Delay animation slightly (50-100ms) so the transition is visible on mount

### 4. "See the Answer" Button Animation

**File:** `components/RevealScreen.tsx` or `components/GameBoard.tsx`

- Add `fadeSlideIn` entrance animation on the "See the Answer" button
- Should appear after last guess feedback, not simultaneously

### 5. Scroll Input Into View on Mobile

**File:** `components/GuessInput.tsx`

- After each guess submission, scroll the input back into view
- Mobile soft keyboards push content up — input can scroll off screen
- Use `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`

### 6. Clipboard Error Handling

**File:** `components/ShareButton.tsx`

- Wrap `navigator.clipboard.writeText()` in try/catch
- On failure: show "Couldn't copy — tap to try again" instead of silent fail
- Some in-app browsers block clipboard API entirely

## Accessibility

### 7. Guess History — ARIA Live Region

**File:** `components/GuessHistory.tsx`

- Add `aria-live="polite"` and `role="log"` to the guess list container
- Screen readers will announce new guesses as they appear

### 8. Input Field — ARIA Label

**File:** `components/GuessInput.tsx`

- Add `aria-label="Enter your guess"` to the input element

### 9. Emoji ARIA Labels

**Files:** `components/GuessRow.tsx`, `components/RevealScreen.tsx`

- Wrap emoji characters in `<span role="img" aria-label="...">`
- Feedback: "exact match", "very hot", "warm", "cold"
- Trail emojis on RevealScreen: same pattern

### 10. Focus Management on Screen Transitions

**File:** `components/GameBoard.tsx`

- When transitioning from play → reveal, move focus to the reveal heading
- Use `useRef` + `useEffect` to focus the heading element
- Prevents screen reader users from being lost after transition

### 11. Semantic HTML Fixes

**Files:** `components/Header.tsx`, various

- Change `Header.tsx` wrapper from `<div>` to `<header>`
- Add `type="button"` to all non-form `<button>` elements (prevents accidental form submission)
- Add `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"` to progress bars in `GuessRow.tsx`

## Mobile Polish

### 12. Safe Area Inset Padding

**File:** `app/layout.tsx` or `app/globals.css`

- Add `padding-bottom: env(safe-area-inset-bottom)` to the main container
- Prevents iPhone home indicator from overlapping game content
- Add `viewport-fit=cover` to the viewport meta tag

### 13. Input Mode Testing

**File:** `components/GuessInput.tsx`

- Test `inputMode="decimal"` — shows numeric keypad on mobile
- Tradeoff: numeric keypad doesn't have 'k'/'m'/'b' keys for shorthand
- Decision: use `inputMode="text"` if shorthand usage is common, `decimal` if most people type raw numbers
- Test with real users during soft launch

### 14. Viewport Zoom Prevention

**File:** `app/layout.tsx`

- Add `maximum-scale=1` to viewport meta tag to prevent accidental pinch-zoom
- Ensure input font size is >= 16px (prevents iOS auto-zoom on focus)

### 15. Extract Gradient Utilities

**File:** `tailwind.config.ts` or `app/globals.css`

- Extract repeated `background: linear-gradient(...)` styles to Tailwind `@apply` utilities or theme extensions
- Reduces duplication across components

## Verification Checklist

### Functional
- [ ] "Come back tomorrow" countdown displays after game completion
- [ ] Countdown ticks every second, resets at midnight UTC
- [ ] Native share sheet appears on iOS Safari
- [ ] Native share sheet appears on Chrome Android
- [ ] Clipboard fallback works on desktop browsers
- [ ] Progress bars animate from 0 to target width
- [ ] Input scrolls into view after each guess on mobile
- [ ] No console errors after share button interactions

### Accessibility
- [ ] VoiceOver (iOS) can navigate: question → input → guess history → reveal
- [ ] New guesses are announced by screen reader (aria-live)
- [ ] All emoji have text alternatives
- [ ] Focus moves to reveal heading after game over
- [ ] Tab order is logical throughout the game flow

### Mobile
- [ ] iPhone home indicator doesn't overlap content
- [ ] No accidental zoom on input focus (font >= 16px)
- [ ] Game feels usable on a 375px-wide screen (iPhone SE)
- [ ] Timer is visible and readable on small screens
- [ ] Keyboard doesn't obscure the guess input field
