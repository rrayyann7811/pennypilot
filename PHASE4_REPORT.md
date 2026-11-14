# Phase 4 — Data Backup, Import, Export, and Recovery

Date: 2026-11-14
Result: PASS for completed automated and browser checks.

## Implemented features

- CSV download of all active transactions, independent of history filters, with readable headings, exact two-decimal INR amounts, UTF-8 BOM, CRLF lines, correct quoting/escaping, Unicode support and spreadsheet formula protection.
- Complete active/session JSON backup with format signature, schema version, UTC export timestamp, transaction IDs/titles/types/dates/integer-paise amounts, monthly budgets and default budget.
- JSON-only file selection, a 5 MiB byte limit, complete schema validation, import preview counts, Cancel and explicit Confirm Restore actions.
- One atomic write to the existing localStorage key after confirmation, followed by updating React state only on success. Failed validation, cancellation, reading errors, full storage and blocked storage preserve existing data.
- Recovery from protected/unreadable active storage using a valid explicitly confirmed backup. Ordinary saving is re-enabled after successful recovery.
- Unresolved legacy date preservation through an explicit backup marker, without inventing dates or including those rows in monthly analytics.
- Compact responsive Data Management section using the Phase 3 design. Cancel receives focus on preview; focus returns to the labeled file input after cancel/success. Status and error messages use live-region roles.

## Files created

- `src/utils/backup.js`
- `src/components/DataManagement.jsx`
- `tests/backup.test.js`
- `PHASE4_REPORT.md`

## Files modified

- `src/App.jsx` — render Data Management and connect successful restore to application state; permit explicit recovery to re-enable writes, cancel an active edit and reset history filters after success.
- `src/index.css` — append scoped Data Management/file-picker/confirmation styles and mobile layout.
- `README.md` — export/backup/restore instructions, JSON schema, validation, privacy, limitations and phase status.

The existing financial, analytics and storage utilities, both original test files, dependency manifest and lockfile were verified byte-for-byte unchanged against the pre-Phase-4 snapshot. No dependency was added. Existing transaction/analytics handlers and formulas remain intact. Prior uncommitted Phase 1–3 work was preserved. Requested production builds regenerated ignored `dist/` files.

## JSON backup format

```json
{
  "format": "pennypilot-backup",
  "version": 1,
  "exportedAt": "2026-11-14T10:00:00.000Z",
  "data": {
    "transactions": [
      {
        "id": "example-id",
        "title": "Lunch",
        "amountPaise": 1234,
        "type": "expense",
        "date": "2026-11-14"
      }
    ],
    "budgets": { "2026-11": 1000000 },
    "defaultBudget": 1000000
  }
}
```

Only recognized application fields are exported/restored. Unknown fields are discarded. No cookies, browser history, credentials, unrelated localStorage contents or browser metadata are included. Timestamp and schema identify the file; they are not a cryptographic signature.

Rows whose existing dates need review also contain `"dateStatus": "unresolved"`. This is the sole explicit exception to strict calendar-date validation: the original date string remains unchanged, even for an invalid ISO-shaped legacy date. Untagged invalid dates are rejected; a marker on an already-valid date is also rejected. Import removes the marker and restores the existing ordinary application structure. Subsequent exports regenerate the marker where necessary. These rows continue to count only in all-time totals until their date is corrected through editing.

## Validation and safety

- `.json` extension (case insensitive), declared file size and actual decoded UTF-8 byte size checked; maximum 5,242,880 bytes. Read failures are caught. Generated backups obey the same limit and validation rules as imports.
- Format signature, supported version, canonical UTC timestamp, data shape and required fields checked.
- Unique string transaction IDs, nonempty string titles, supported types, valid dates or explicit unresolved markers, and positive safe-integer paise amounts capped at 1,000,000,000,000.
- Monthly budget keys must be valid `YYYY-MM` within supported years 0001–9999. Budgets/default budget must be non-negative safe integers within the same monetary cap.
- No transaction merging, silent row skipping, repaired IDs, partial imports, implicit confirmation or writes while previewing. Empty backups are valid intentional replacements and still require confirmation.
- Staged data is revalidated immediately before the single storage write. localStorage's atomic `setItem` failure leaves the previous value intact; React state is changed only after successful storage persistence.
- Restore retains the existing `pennypilot.phase1.v1` key and `{ version: 1, transactions, budgets, defaultBudget }` schema. Original legacy `transactions`/`budget` keys are never changed or removed.
- CSV text cells beginning with formula characters (including whitespace/control prefixes) are prefixed with an apostrophe; quoting alone is not relied on for formula protection. Amount strings use exact integer-paise conversion.
- JSON is parsed as data, never evaluated; imported titles remain escaped React text. Async file selections use request identifiers to avoid staging stale reads.

## Automated testing

`npm test`: **PASS — 42 tests, 0 failures** (all original 24 plus 18 new tests).

New coverage: CSV headings/line endings/escaping; Unicode/multiline text; formula prefixes and control whitespace; one-paise and maximum currency amounts; generated JSON fields and exclusion of unnecessary fields; complete valid restore; legacy-date round trips; malformed JSON/root objects; unsupported versions; invalid timestamps; duplicate/invalid IDs and titles; invalid dates/types/markers; invalid amounts and budgets/shapes; leap dates and calendar limits; empty backups; missing/cancelled confirmation; failed validation and atomic storage-write preservation; file extensions, sizes, UTF-8 bytes, reading failures, oversized export rejection and BOM-prefixed JSON.

## Build and source review

- `npm run build`: **PASS** — Vite production build.
- JS output approximately 624.87 kB minified / 183.85 kB gzip. Existing >500 kB Vite warning remains; it does not fail the build.
- `git diff --check`: **PASS**.
- Reviewed the combined Git diff plus a pre-Phase-4 source snapshot to distinguish this phase from earlier uncommitted changes. Original utilities, calculations, tests and dependency files remain unchanged.

## Browser verification

Isolated headless Chrome against the local production preview; in-app browser automation was unavailable. Real downloaded files and native file-input selections were used with synthetic QA fixtures; personal browser data was not used.

| Check | Result |
| --- | --- |
| Real CSV and JSON downloads and descriptive filenames | PASS |
| CSV all rows despite filters, Unicode, exact paise and formula protection | PASS |
| JSON budgets, IDs, exact amounts and unresolved dates | PASS |
| Export leaves storage unchanged | PASS |
| Preview counts, replacement explanation and Cancel focus | PASS |
| No write before confirmation; Cancel preserves original data | PASS |
| Confirmed restore replaces financial state, clears history filters and retains legacy keys | PASS |
| Restored budgets, totals, analytics and refresh persistence | PASS |
| Malformed/unsupported/non-JSON/oversized files preserve current data | PASS |
| File-reading error preserves data | PASS |
| Quota failure preserves both active state and storage | PASS |
| Unavailable storage produces a safe error without replacement | PASS |
| Own exported backup restores unresolved legacy dates | PASS |
| Protected corrupt-data recovery re-enables normal saving after confirmation | PASS |
| Imported HTML-like title remains inert plain text | PASS |
| Responsive widths 320, 375, 768, 1024, 1440px | PASS — no horizontal overflow with import confirmation displayed |
| Desktop/mobile visual review of Data Management/confirmation | PASS |
| Existing transaction CRUD, duplicates, search, combined filters and sorting | PASS |
| Existing budgeting, invalid-input handling, migration, storage errors and clear-history confirmation | PASS |
| Existing analytics calculations, charts, exact keyboard tooltips and selector independence | PASS |
| Keyboard navigation/focus and input labels | PASS |
| Uncaught JavaScript runtime exceptions | PASS — none observed |
| Safari/Firefox, real mobile devices and screen readers | NOT TESTED — manual verification required |

Temporary browser fixtures, downloads, screenshots, scripts and source snapshot are under `/private/tmp/pennypilot-phase4*`; they are not application dependencies. The QA preview server and browser were stopped after verification.

## Remaining limitations and privacy

- Backups are manual, unencrypted local files. No cloud upload, synchronization, automatic backup, merge or undo is provided. Keep the prior JSON file before confirming a replacement.
- CSV is for viewing, not restore. Spreadsheet formula protection may display a leading apostrophe in some viewers.
- All JSON backups must fit 5 MiB; browser storage quota may be smaller. Files above that limit are rejected without losing source data.
- A backup contains active loaded/session records. Raw corrupt records skipped by the existing loader and original raw legacy storage values are not exported; preserve those originals separately for manual recovery.
- UI filters/month selections and other browsers' data are not included. Raw localStorage dumps and third-party/CSV formats are not accepted imports.
- Existing Phase 2 very-large-chart-coordinate approximation and build-tool advisories are outside this phase; financial summaries/tooltips remain exact and dependency files are unchanged.
- Cross-browser/device and assistive-technology verification remain manual.

## Git working tree status

Working tree remains dirty with the user's earlier Phase 1–3 changes plus this Phase 4 implementation. The combined Git diff spans all four phases; this phase's exact files are listed above. Nothing was staged, committed, pushed or deployed. No backend, authentication, Firebase, Supabase, categories, financial calculation changes, unrelated-project modifications or Phase 5 work were introduced. Phase 5 awaits explicit approval.
