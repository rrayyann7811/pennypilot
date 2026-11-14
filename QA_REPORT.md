# Phase 1 final QA — 2026-11-14

Result: PASS for the checks executed. No confirmed defects remain open. Manual accessibility and cross-browser/device checks listed below are NOT TESTED.

Reviewed all tracked Phase 1 diffs, new finance/storage utilities, tests, entry points, styles, package configuration, and documentation. Existing uncommitted work was retained. No Phase 2 work, feature additions, commits, pushes, or deployment.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Phase 1 source review | PASS | Reviewed all changed and new source files |
| Automated tests | PASS | `npm test`: 13 tests, 0 failures |
| Production build | PASS | `npm run build`: Vite production build succeeded |
| Whitespace checks | PASS | `git diff --check` |
| JavaScript runtime | PASS | No uncaught runtime exceptions during Chrome scenarios |
| Add/edit transactions | PASS | Income/expense, exact decimal values, editing preserves row count, form resets |
| Duplicate transactions | PASS | Equal titles coexist; deletion removes only the chosen ID; duplicate stored IDs repaired without merging |
| Delete/clear history | PASS | Individual deletion; cancel preserves history; confirmed clear includes hidden rows; persists on refresh and retains budgets/legacy recovery copy |
| Search/filter/sort | PASS | Trimmed case-insensitive search; combined type/month filters; reset; all four sort modes |
| Monthly budgets | PASS | Month boundaries, month-specific budgets, remaining amount, zero budget, overrun, refresh persistence |
| Integer-paise accuracy | PASS | 0.10 + 0.20; maximum values; cumulative totals beyond Number.MAX_SAFE_INTEGER; negative sub-rupee formatting |
| Dates | PASS | Leap years, invalid calendar days, years 0001/9999; legacy ambiguous dates retained and excluded from monthly calculations until explicitly corrected |
| localStorage persistence | PASS | Saved transactions and month budgets survive browser reload |
| Invalid inputs | PASS | Blank title/date; zero, negative, excess precision, scientific notation, NaN, Infinity, above-limit amounts; first invalid field receives focus |
| Storage unavailable/full | PASS | Read-blocked storage permits session use with warning; quota failure permits session use and leaves saved original intact |
| Malformed data preservation | PASS | Invalid records disable writes; session edits do not overwrite original stored payload |
| Legacy migration | PASS | Exact rupee-to-paise conversion; source keys preserved; ambiguous dates shown; missing/duplicate IDs handled; migrated round trip |
| Responsive layout | PASS | Chrome emulation at 1440, 1024, 768, 390, 320 px; no horizontal overflow with 100-character title and maximum amount; desktop/mobile screenshots inspected |
| Accessibility/keyboard basics | PASS | All input/select controls labeled; errors associated; Tab reaches forms, filters and transaction actions; visible focus including native date subcontrols; Enter activates edit and focuses title |
| Screen-reader audit | NOT TESTED | Requires manual assistive-technology testing; this is not a WCAG conformance certification |
| Other browsers and physical mobile devices | NOT TESTED | Requires Safari/Firefox and real-device testing; Chrome viewport emulation was used |

Browser automation used the local production preview and headless Google Chrome via DevTools Protocol, with a separate temporary browser profile. The in-app browser automation tool was unavailable. Existing personal browser data was not used. Browser scripts and screenshots are temporary QA artifacts under `/private/tmp/pennypilot-qa*`; automated unit regressions are in `tests/finance.test.js`.

## Confirmed defects fixed

1. Editing a migrated transaction with ID `new` reused the add-form component key and could leave stale values after save/cancel. Edit keys now use a distinct prefix.
2. Aggregate sums could lose paise after exceeding JavaScript's safe integer range. Totals now accumulate with BigInt, return Numbers when safe, and preserve exact large totals and currency formatting. Monthly remaining-budget subtraction also uses exact arithmetic. Persisted individual amounts remain integer Numbers; the storage schema is unchanged.
3. Income text and delete-button text had insufficient contrast. Darkened the existing green/red colors.
4. Long titles could squeeze desktop amounts into broken numeric lines. Preserve action-group width and keep currency amounts on one line while retaining mobile wrapping.
5. Native date/month internal controls could receive keyboard focus without the enclosing input outline. Added `:focus-within` coverage.

Added regression tests for large aggregate precision, negative sub-rupee formatting, maximum amounts, calendar boundaries, and duplicate saved IDs with persistence.

## Files changed during this QA

- `src/App.jsx`
- `src/components/BudgetSection.jsx`
- `src/utils/finance.js`
- `src/index.css`
- `tests/finance.test.js`
- `QA_REPORT.md` (new report)

`dist/` was regenerated by the requested production builds and remains ignored. Temporary browser scripts, screenshots and browser-profile files were created under `/private/tmp/`. Other pre-existing uncommitted files were not edited during QA.
