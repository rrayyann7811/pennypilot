# PennyPilot screenshot capture record

Status: completed on 2026-11-14, following the Phase 6A screenshot plan and explicit user authorization.

## Placeholder replacement

The tracked `screenshots` file was verified immediately before removal as exactly one newline byte (`0a`). Only that placeholder was removed and replaced with a `screenshots/` directory. No other file was deleted or renamed. Earlier phase reports describe the repository at their verification time.

## Actual captures

| File | Dimensions | View |
| --- | --- | --- |
| `screenshots/dashboard.png` | 1440 × 1000 | Main overview, all-time cards, monthly budget and analytics summaries |
| `screenshots/analytics.png` | 1440 × 1000 | Monthly metrics and both six-month charts |
| `screenshots/transactions.png` | 1440 × 1000 | Add form, November income-filtered history and export controls |
| `screenshots/data-management.png` | 1440 × 1000 | Backup/export controls and staged restore confirmation with transaction/budget counts |
| `screenshots/mobile.png` | 375 × 1206 | Complete mobile overview and monthly budget |

## Provenance and privacy

- Captured from the real locally built production preview in headless Chrome, using a separate temporary browser profile.
- 43 fictional transactions span June–November 2026. November income is Monthly Salary ₹45,000 plus Freelance Project ₹8,000; expenses are Groceries ₹4,500, Transportation ₹2,000, Internet ₹999, Shopping ₹3,500, Electricity ₹1,800 and Dining ₹1,250. Historical records are fictional as well. Monthly budgets are ₹25,000.
- November expenses total ₹14,049; savings are ₹38,951 and remaining monthly budget ₹10,951. All displayed values and chart geometry were rendered by the application itself.
- Chart rendering and font readiness were checked before capture. No error/warning UI or uncaught JavaScript exceptions appeared.
- The restore image stages a synthetic backup through the ordinary import control and leaves it awaiting confirmation. No personal data or personal browser storage was accessed, overwritten or exported.
- No browser chrome, developer tools, desktop notifications, OS file picker, personal profile, or local filesystem path is included in the images.
- Native Chrome PNG captures were recompressed losslessly. No pixels were retouched, composited, generated or rescaled.

All five images were opened for visual review. PNG signatures, dimensions, chunk CRCs and decompressed image data were validated; README uses existing relative image paths. Application source, financial calculations, tests and dependency files were verified unchanged. Temporary profiles, fictional backup fixtures and capture scripts stay outside the repository.

Nothing has been staged, committed, pushed or deployed. Publication remains subject to separate user approval.
