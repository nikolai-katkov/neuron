_[Русский](./05-05-placeholder-sections.ru.md)_

---

# 05-05: Placeholder Sections

Status: Pending

## Summary

Add 7 new sections with `isAvailable: false` for future VB-MAPP Level I categories: Listener Responding, Visual Perceptual, Independent Play, Social Behaviour, Motor Imitation, Echoic, Spontaneous Vocal Behaviour.

## User Acceptance Criteria

- [ ] Sections list shows 9 total sections (2 active, 7 placeholder)
- [ ] Each placeholder has a distinct icon and "Coming soon" label
- [ ] Placeholder cards are visually disabled

## System Acceptance Criteria

- [ ] 7 section constants added to `sections.ts` (both languages) with `isAvailable: false` and `criteria: []`
- [ ] Stub introductions added to `introduction.ts` for all 7 sections
- [ ] `SECTION_ICONS` in `SectionsListPage.tsx` includes all 9 section IDs

## Depends On

- 05-02 (same file: sections.ts)

## Related Files

- `src/i18n/translations/sections.ts`
- `src/i18n/translations/introduction.ts`
- `src/pages/SectionsListPage.tsx`
