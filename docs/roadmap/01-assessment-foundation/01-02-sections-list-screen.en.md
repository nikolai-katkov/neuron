_[Русский](./01-02-sections-list-screen.ru.md)_

---

# 01-02: Sections List Screen

Status: Done

## Summary

App entry point showing available skill sections as cards. MAND is active with progress tracking. TACT is shown as a disabled "coming soon" placeholder. Tapping MAND navigates to the MAND introduction screen.

## User Acceptance Criteria

- [x] MAND card displays: title "MAND", subtitle "Requests", status (Not started / In progress / Completed), progress (X/5)
- [x] TACT card displays: title "TACT", subtitle "Coming soon", visually disabled/greyed
- [x] Tapping MAND card navigates to MAND introduction screen
- [x] Tapping TACT card does nothing (disabled)
- [x] Progress updates reflect actual assessment state (persisted across sessions)

## System Acceptance Criteria

- [x] Route: `/` (app entry point)
- [x] Section progress computed from criterion states (count of Completed out of total)
- [x] Section status derived: all NotStarted = "Not started", any InProgress or mixed = "In progress", all Completed = "Completed"
- [x] State persists across page reloads (localStorage or equivalent)

## Development Acceptance Criteria

- [x] CSS Modules with design tokens only (no hardcoded values)
- [x] Responsive across desktop (1920x1080), tablet (768x1024), mobile (375x667)
- [x] Unit test for progress/status derivation logic
- [x] E2E test: load app, verify MAND card visible, tap navigates to intro

## Depends On

- 01-01 (data model)

## Knowledge Reference

- [Developmental Milestones Assessment](../../knowledge/developmental-milestones-assessment.en.md)

## Related Files

- `src/pages/SectionsListPage.tsx`
- `src/pages/SectionsListPage.module.css`
- `src/components/ui/Card/Card.tsx`
- `src/components/ui/Card/Card.module.css`
- `src/components/ui/StatusBadge/StatusBadge.tsx`
- `src/components/ui/StatusBadge/StatusBadge.module.css`
- `src/components/ui/ProgressBar/ProgressBar.tsx`
- `src/components/ui/ProgressBar/ProgressBar.module.css`
- `tests/pages/SectionsListPage.test.tsx`
