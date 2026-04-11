_[Русский](./05-02-enable-tact-section.ru.md)_

---

# 05-02: Enable TACT Section

Status: Pending

## Summary

Flip `isAvailable` to `true` for the TACT section, fix the Russian subtitle, and remove the "coming soon" note from introduction text.

## User Acceptance Criteria

- [ ] TACT card on sections list is clickable and navigates to intro page
- [ ] RU subtitle shows "Называние" (changed from "Обозначение")
- [ ] TACT introduction page shows full explanation without "coming soon" note

## System Acceptance Criteria

- [ ] `sections.ts`: TACT `isAvailable` set to `true` in both languages
- [ ] `sections.ts`: RU subtitle changed to "Называние"
- [ ] `introduction.ts`: "coming soon" paragraph removed from EN and RU

## Related Files

- `src/i18n/translations/sections.ts`
- `src/i18n/translations/introduction.ts`
