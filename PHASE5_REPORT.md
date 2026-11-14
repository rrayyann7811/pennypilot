# Phase 5 — Final Security, Performance, Accessibility and Readiness Audit

Date: 2026-11-14

## Scope and verdict

Stabilization of the existing local-only React/Vite app. No product features, redesign, backend, authentication, architecture replacement, major retained dependency upgrades or deployment.

**Verdict: locally ready for an explicitly approved Vercel preview/release, subject to the manual checks and operational limits below.** This is not a certification of WCAG conformance or a live-hosting security audit. Deployment itself remains NOT TESTED and was not performed.

Inspected source, tests, manifest/lockfile, entry point, styles, ignored files, README, all four prior phase reports and QA_REPORT, plus Git status and tracked/untracked changes. The working tree already held all prior uncommitted phases. A pre-audit snapshot distinguishes this phase's changes from the combined Git diff.

## Security findings

No confirmed application XSS, credential exposure, formula-injection bypass, partial restore or silent import data loss was found on the exercised paths. Known vulnerable build-tool dependencies were confirmed and fixed.

- Transaction validation enforces trimmed titles, positive bounded paise amounts, supported types and real dates. Loaded legacy data remains separately protected when malformed records cannot be loaded.
- Complete JSON validation enforces a 5 MiB UTF-8 limit, format/version/timestamp, unique string IDs, amounts, budgets, types and calendar values before preview. Explicit unresolved legacy markers are an intentional compatibility exception; they do not become valid calendar dates.
- New targeted tests reject prototype-shaped budget keys without any write and ensure unknown imported properties never enter persisted state or pollute prototypes.
- CSV escaping/formula protection covers Unicode, quotes, newlines, formula prefixes and whitespace/control prefixes, including unresolved date cells. Amounts remain exact integer-paise conversions.
- Import is data parsing, not code evaluation. No unsafe HTML/eval rendering was found. A browser fixture containing an HTML/event-handler title remains inert React text.
- Restore writes atomically once after explicit confirmation, then updates React state. Cancel, malformed/unsupported input, read errors and blocked/full storage preserve the existing data. Original legacy keys are retained.
- No app-source localhost endpoints, credentials, environment-variable dependencies, backend calls or analytics uploads were identified. Production title remains PennyPilot. Sensitive backup contents are explicit financial state only.
- Browser data and downloaded files remain unencrypted, browser-profile/origin scoped and accessible to someone using the same profile. Cross-tab writes are last-writer-wins; no new locking/synchronization feature was introduced. These limitations are documented.

## Dependency audit

Before fixes, `npm audit` reported **8 affected packages** (6 high, 1 moderate, 1 low) containing **24 individual advisories**. All were development/build dependencies; the vulnerable packages are not served as Node services in the static deployment.

After reviewed fixes and a successful clean `npm ci`, full **`npm audit` and `npm audit --omit=dev` report 0 vulnerabilities**. Current audit data is time-sensitive and should be checked again before release.

The table distinguishes actual project use from theoretical exploitability. Reachability conclusions are source/dependency inspection inferences, not demonstrations that every advisory was exploitable in this app. Advisory links are the primary metadata returned by npm.

| Package | Advisory severity | Scope | Advisory | PennyPilot path / applicability | Safe fix and final result |
| --- | --- | --- | --- | --- | --- |
| @babel/core | low | Development/build | [@babel/core: Arbitrary File Read via sourceMappingURL Comment](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) | Present only through the unused, unconfigured React plugin: no active Babel transform path in this project, and no API accepts source/maps. | 7.29.13 compatible fix available; unused plugin/Babel tree removed |
| baseline-browser-mapping | moderate | Development/build | [baseline-browser-mapping process termination on invalid input causes denial of service](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) | Only through the unused React plugin/Browserslist tree: no active call accepting baseline years/options. | 2.11.37 compatible fix available; unused plugin tree removed |
| browserslist | high | Development/build | [Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | Only through the unused React plugin tree; no active custom stats/query service or untrusted stats file in this repo. | 4.29.5 compatible fix available; unused plugin tree removed |
| browserslist | high | Development/build | [Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | Only through the unused React plugin tree; no active custom stats/query service or untrusted stats file in this repo. | 4.29.5 compatible fix available; unused plugin tree removed |
| nanoid | high | Development/build | [nanoid: non-secure generators can loop indefinitely with negative size](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | Transitive PostCSS ID generation only; finance IDs use crypto/random fallback, not nanoid. No app call to vulnerable size/custom-generator APIs. | 3.3.20 installed |
| nanoid | high | Development/build | [nanoid: custom generators can loop indefinitely when size is zero](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | Transitive PostCSS ID generation only; finance IDs use crypto/random fallback, not nanoid. No app call to vulnerable size/custom-generator APIs. | 3.3.20 installed |
| nanoid | high | Development/build | [nanoid: Integer Overflow or Wraparound](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | Transitive PostCSS ID generation only; finance IDs use crypto/random fallback, not nanoid. No app call to vulnerable size/custom-generator APIs. | 3.3.20 installed |
| picomatch | moderate | Development/build | [Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p) | Vite/tinyglobby matching local build files. No financial/file-import value is passed as a glob pattern. | 4.0.7 installed |
| picomatch | high | Development/build | [Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) | Vite/tinyglobby matching local build files. No financial/file-import value is passed as a glob pattern. | 4.0.7 installed |
| postcss | moderate | Development/build | [PostCSS has XSS via Unescaped </style> in its CSS Stringify Output](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | Compiles the trusted local stylesheet; no uploaded CSS, attacker source maps or HTML style serialization service. | 8.5.33 installed |
| postcss | high | Development/build | [PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments](https://github.com/advisories/GHSA-6g55-p6wh-862q) | Compiles the trusted local stylesheet; no uploaded CSS, attacker source maps or HTML style serialization service. | 8.5.33 installed |
| postcss | moderate | Development/build | [PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | Compiles the trusted local stylesheet; no uploaded CSS, attacker source maps or HTML style serialization service. | 8.5.33 installed |
| postcss | high | Development/build | [PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure](https://github.com/advisories/GHSA-r28c-9q8g-f849) | Compiles the trusted local stylesheet; no uploaded CSS, attacker source maps or HTML style serialization service. | 8.5.33 installed |
| source-map-js | high | Development/build | [source-map-js allows event-loop denial of service through indexed source-map section offsets](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | Build-time PostCSS source-map handling. Imported financial JSON never reaches indexed source-map parsing. | 1.2.2 installed |
| vite | moderate | Development/build | [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | Development server paths can be reachable during npm run dev; absent from deployed dist assets. Do not expose a dev server publicly. | 8.1.6 installed |
| vite | high | Development/build | [Vite: `server.fs.deny` bypassed with queries](https://github.com/advisories/GHSA-v2wj-q39q-566r) | Development server paths can be reachable during npm run dev; absent from deployed dist assets. Do not expose a dev server publicly. | 8.1.6 installed |
| vite | high | Development/build | [Vite Vulnerable to Arbitrary File Read via Vite Dev Server WebSocket](https://github.com/advisories/GHSA-p9ff-h696-f583) | Development server paths can be reachable during npm run dev; absent from deployed dist assets. Do not expose a dev server publicly. | 8.1.6 installed |
| vite | moderate | Development/build | [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | Vite dev editor/file endpoint only; Windows-specific paths are not used on the audited macOS or target Linux static build. Never part of dist. | 8.1.6 installed |
| vite | moderate | Development/build | [launch-editor: escapeCmdArgs() omits % escaping on Windows](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | Vite dev editor/file endpoint only; Windows-specific paths are not used on the audited macOS or target Linux static build. Never part of dist. | 8.1.6 installed |
| vite | moderate | Development/build | [launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | Vite dev editor/file endpoint only; Windows-specific paths are not used on the audited macOS or target Linux static build. Never part of dist. | 8.1.6 installed |
| vite | high | Development/build | [launch-editor: `fs.existsSync()` existence check can be bypassed on Windows](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | Vite dev editor/file endpoint only; Windows-specific paths are not used on the audited macOS or target Linux static build. Never part of dist. | 8.1.6 installed |
| vite | low | Development/build | [Vite: Cross origin script execution through Vite custom middleware](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | Requires custom Vite middleware; none is configured here. Not part of static dist. | 8.1.6 installed |
| vite | moderate | Development/build | [Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | Vite dev editor/file endpoint only; Windows-specific paths are not used on the audited macOS or target Linux static build. Never part of dist. | 8.1.6 installed |
| vite | moderate | Development/build | [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | Vite dev editor/file endpoint only; Windows-specific paths are not used on the audited macOS or target Linux static build. Never part of dist. | 8.1.6 installed |

### Compatible dependency changes

- Removed `@vitejs/plugin-react`: it was declared but never imported/configured anywhere, so it provided no active development/build behavior. This removes the unused Babel/Browserslist dependency tree.
- Pinned Vite **8.1.6** (same major 8), a patched release covering all original Vite advisories. Retained PostCSS 8.5.33, nanoid 3.3.20, picomatch 4.0.7 and source-map-js 1.2.2 through compatible transitive resolutions.
- Reviewed a non-forced `npm audit fix --dry-run` before applying compatible fixes. A subsequent lockfile check caught unnecessary optional WASM major upgrades from the broad Vite 8.3 line; these were not retained. Selecting Vite 8.1.6 returns those packages to their original major lines.
- Verified all packages present both before and after retain their numeric major versions, including cross-platform optional dependencies. React, React DOM and Recharts versions remain unchanged. No forced audit fix was used and no dependency was added.
- A clean **`npm ci` succeeded**, with zero audit findings. Vite still compiles the existing JSX correctly without the unused plugin.

## Performance findings and fixes

1. Storage loading copied/scanned prior rows for every transaction ID, creating quadratic work. It now tracks IDs in a Set, including generated-ID collision checks. All rows, uniqueness guarantees, migration behavior and data-protection warnings remain intact.
2. Every formatted amount constructed a new Intl.NumberFormat. A shared en-IN/INR formatter now produces the same exact integer-paise output. The BigInt financial arithmetic and rounding algorithms did not change.
3. App summary totals, budget-month expenses and filtered/sorted history are memoized by their actual inputs. The analytics dashboard and chart panel use simple React memoization, preventing unrelated history filter/edit state from rebuilding charts. Financial aggregation formulas are unchanged.
4. The prior approximately **624.87 kB / 183.85 kB gzip** single JS chunk is now **219.68 kB / 69.24 kB gzip** for the main app plus **404.16 kB / 114.32 kB gzip** for charts. The >500 kB warning is gone. This reduces the main chunk by about 65%; total transferred JS is roughly unchanged. Charts are still requested automatically, not deferred until a user action.
5. A lightweight error boundary isolates failed chart-chunk requests; transactions, budget metrics and backups remain usable, and a refresh retries loading. Browser request blocking verified this behavior.

Illustrative local Node measurements on the same 10,000-row fixture:

| Operation | Before | After |
| --- | ---: | ---: |
| Load/validate unique stored IDs | ~656 ms | ~30 ms |
| Format 10,000 currency values | ~1,889 ms | ~147 ms |

These are local observations, not reproducible performance thresholds or Lighthouse scores. A browser fixture also rendered 1,000 transactions, retained exact ₹10.00 totals and filtered to one row correctly. Its driver-observed reload took about 11.4 seconds including debugging/waits; this is not a CPU measurement or a guarantee of low-end-device performance. Larger histories still render all matching DOM rows and full-state localStorage writes remain synchronous. No pagination, virtualization or state-management feature was introduced; those scalability limits remain explicit.

## Accessibility findings and fixes

**Confirmed defect fixed:** Chrome's accessibility tree exposed both interactive Recharts surfaces as unnamed applications. Each chart now references its existing visible heading through `aria-labelledby`; the accessibility tree confirms the names “Income vs Expenses” and “Monthly Spending Trend”.

Existing labels, input/error descriptions, alert/status roles, Tab navigation, first-invalid-field focus, edit focus, chart arrow-key tooltips, native keyboard table expansion, visible focus, negative signs and textual budget warnings were retained. Color values remain the Phase 3 audited palette (body/muted/primary/financial text at least 4.5:1 against their reviewed surfaces; input boundaries about 3.16:1 on white). Reduced motion remains respected and chart animations disabled. Buttons and main form controls retain 44px minimum heights in the five viewport checks. Native OS file-picker/dialog behavior and screen-reader announcements need manual device testing.

This is targeted browser/source verification, not a full WCAG audit. No accessibility library, dashboard redesign or new control was added.

## Responsive and data-reliability verification

Final verification uses isolated headless Chrome and synthetic data against the production preview. In-app browser automation was unavailable. Browser regression waits were adjusted for the new asynchronous chart loading rather than treating its temporary loading status as an application defect.

| Check | Result |
| --- | --- |
| Widths 320, 375, 768, 1024, 1440 px | PASS — no horizontal overflow, normal and long-title/maximum-amount fixtures |
| Summary card dimensions and readable maximum amounts | PASS |
| Form/filter alignment and touch-friendly controls | PASS |
| Charts, exact keyboard currency tooltips and data tables | PASS |
| Native Tab/Enter navigation and visible focus | PASS |
| Reduced-motion emulation and expanded table at 320 px | PASS |
| Add/edit/delete, duplicate titles, search/filter/sort | PASS |
| Monthly budgets, savings and comparison calculations | PASS |
| Browser refresh and fresh/missing storage | PASS |
| Corrupted storage, skipped-invalid-row protection | PASS |
| Blocked reads, missing storage access, quota write failures | PASS |
| CSV/JSON real downloads and contents | PASS |
| Malformed/unsupported/oversized/import-reading failures | PASS |
| Confirmed restore, cancellation, no pre-confirmation writes | PASS |
| Failed imports preserve stored and current session data | PASS |
| Legacy-date preservation and original legacy keys | PASS |
| Explicit recovery re-enables ordinary persistence | PASS |
| Clear All cancellation/confirmation including hidden rows | PASS |
| Imported HTML-like strings remain inert React text | PASS |
| Chart-network failure preserves core functionality | PASS |
| Normal browser scenarios: uncaught JS exceptions | PASS — none observed |
| Intentionally blocked chart request | PASS — expected request/render error handled by boundary, no uncaught JS exception |
| Physical devices, Safari/Firefox, screen readers | NOT TESTED — manual checks required |

## Automated tests and production build

- **`npm test`: PASS — 45 tests, 0 failures**, preserving all original 42 tests unchanged.
- Three targeted additions cover a 10,003-row history with duplicate/missing/special IDs; rejecting prototype-shaped budget keys without a write; and dropping unknown imported fields without prototype pollution.
- **`npm run build`: PASS** after clean installation with Vite 8.1.6; two JS chunks, no large-chunk warning.
- **`git diff --check`: PASS**.
- Full and production-only **npm audit: PASS — 0 known vulnerabilities** at audit time.
- Production title, ignore patterns, dependency lock consistency and absence of application localhost/environment/credential references checked. No build artifacts contain user financial data; the app reads browser state at runtime.

## Static deployment readiness and Vercel recommendations

PennyPilot produces a static `dist/` directory and has no backend routes, required environment variables or SSR/runtime server requirements. Use the **Vite** preset, repository-root Root Directory, **Node 24.x**, `npm ci`, `npm run build`, and output **`dist`**. No custom SPA rewrite is currently necessary because this app has no client-side route paths. Never publish the Vite dev/preview server as the production service. The recommended Vercel settings follow the [Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite) and [Node version settings](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

No deployment was performed, and live hosting/cache/header behavior was not tested. After explicit deployment approval, verify a preview's real-browser behavior and asset loads before promoting it. Consider host-level anti-framing, nosniff and referrer-policy headers as part of that deployment review; no untested hosting/CSP configuration was introduced here.

Export a JSON backup before changing origins. Localhost, Vercel preview, production and custom-domain URLs each have separate localStorage; import the backup on the intended origin. README now explains this, private-browser/storage loss, same-profile access, unencrypted backup files and simultaneous-tab limitations. Static hosting may log ordinary requests even though financial records are not uploaded by the application.

## Files changed during Phase 5

Existing files modified:

- `.gitignore` — ignore `.vercel/` local deployment metadata.
- `package.json` — patched Vite pin; remove unused plugin.
- `package-lock.json` — compatible audited resolutions and removal of unused build dependency tree.
- `src/App.jsx` — memoize existing derived values.
- `src/utils/finance.js` — reuse currency formatter; support Set-based ID membership without changing money arithmetic.
- `src/utils/storage.js` — Set-based duplicate-ID handling.
- `src/components/analytics/AnalyticsDashboard.jsx` — memoization, chart chunk loading and failure isolation.
- `src/components/analytics/IncomeExpenseChart.jsx` — accessible chart name.
- `src/components/analytics/SpendingTrendChart.jsx` — accessible chart name.
- `README.md` — audited commands, actual phase/test status, Vercel recommendations and privacy/backup/origin/scalability limits.

New files:

- `src/components/analytics/AnalyticsCharts.jsx`
- `src/components/analytics/ChartBoundary.jsx`
- `tests/audit.test.js`
- `PHASE5_REPORT.md`

Ignored `dist/` was regenerated. Audit JSON, source snapshot/diff, timing probes, browser fixtures/downloads/screenshots/scripts are temporary files under `/private/tmp/`, not new repository dependencies. Existing phase reports, original test files, import/export validation and financial analytics algorithms remain unchanged. The combined Git diff contains earlier phases as well as this phase; reviewed against the pre-audit snapshot to distinguish them.

## Remaining risks and release gate

- localStorage and downloaded files are unencrypted and not synchronized/backed up automatically; quota, clearing browser data, private browsing, origin changes and cross-tab last-writer-wins behavior remain limitations.
- JSON backups are capped at 5 MiB; skipped corrupt raw source records are not included in a loaded/session backup; confirmed restore has no built-in undo.
- Very large histories still have DOM and synchronous-write costs; very large chart coordinates use approximate Number geometry while displayed money stays exact.
- Screen readers, Safari/Firefox and physical devices need manual verification; no complete WCAG/Lighthouse/penetration-test certification is claimed.
- Audit databases change. Rerun audits/tests/build before release; zero advisories today does not guarantee absence of vulnerabilities.
- No live Vercel deployment or host-header/cache test has been performed. A separately approved preview and smoke test is the next release step.

**Release verdict:** no known blocking defect remains in the locally tested scope; suitable for a portfolio/static preview under the documented limitations. Public deployment still requires the user's approval and live/manual verification. Working tree remains dirty with all prior phases and this audit; nothing was staged, committed, pushed or deployed. No Phase 6 work was started.
