_[Русский](./06-01-practice-card-gestures.ru.md)_

---

# 06-01: Practice Card Gesture System

Status: Done

## Summary

Overhaul the swipe gesture system on the practice card page. Fix the snap-back animation bug, add 4-direction swiping (left/right/up/down), implement velocity-based intent detection with adaptive animation physics, and add visual zone overlays during drag.

## User Acceptance Criteria

- [x] Swiping a card left, right, up, or down flies it off screen in the corresponding direction
- [x] Swipe right records "Said it!" (mastered)
- [x] Swipe left records "Not yet" (not started)
- [x] Swipe up records "Needed help" (emerging)
- [x] Swipe down skips the word without recording mastery
- [x] Fast flick commits a swipe even with small displacement
- [x] Slow drag past threshold commits a swipe
- [x] Dragging far in one direction then flicking back snaps the card to the pile (cancel gesture)
- [x] Colored overlay with action label appears on the card during drag, intensifying toward the edge
- [x] All three action buttons trigger the same fly-off animation as gestures
- [x] Card renders above page headers and breadcrumbs during drag

## System Acceptance Criteria

- [x] Rolling velocity window (5 samples, weighted 3:1 recent-to-older) replaces single-point velocity
- [x] Axis-dominant intent detection with 1.2x horizontal bias prevents accidental vertical triggers
- [x] Velocity-first priority: when velocity exceeds threshold, velocity direction determines swipe
- [x] Cancel detection: velocity opposing significant displacement (>40px) snaps back
- [x] Adaptive animation duration: `clamp(distance / velocity, 150ms, 400ms)`
- [x] Momentum easing `cubic-bezier(0.2, 0, 0, 1)` for fast flicks
- [x] Position easing `cubic-bezier(0.32, 0.72, 0, 1)` for slow drags
- [x] Reduced motion: 1ms animation duration
- [x] Card stack z-index at `--z-sticky` level
- [x] `SwipeCard` uses `forwardRef` with imperative `triggerSwipe` handle

## Development Acceptance Criteria

- [x] CSS Modules with design tokens only (zone colors use `--color-success`, `--color-danger`, `--color-warning`)
- [x] Zone overlay opacity uses quadratic curve for gradual ramp
- [x] All three themes supported (warm, soft, editorial)
- [x] TypeScript strict, no lint errors
- [x] Production build succeeds
- [x] All 160 existing unit tests pass

## Depends On

- 01-06 (training screen), 05-10 (dictionary provider), 05-14 (training page integration)

## Knowledge Reference

- [Developmental Milestones Assessment](../../knowledge/developmental-milestones-assessment.en.md)
- Gesture physics adapted from `chords` project `useSheetDrag` hook

## Related Files

- `src/components/ui/SwipeCard/useSwipeGesture.ts` — gesture hook (rewritten)
- `src/components/ui/SwipeCard/SwipeCard.tsx` — card component with zone overlay
- `src/components/ui/SwipeCard/SwipeCard.module.css` — zone overlay styles
- `src/pages/PracticeCardPage.tsx` — page wiring for 4 directions
- `src/pages/PracticeCardPage.module.css` — card stack z-index
