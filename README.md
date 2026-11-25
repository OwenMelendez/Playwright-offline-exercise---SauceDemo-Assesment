# SauceDemo E2E suite — Playwright + TypeScript

Offline exercise for Nuaav (Lead scope). Target: <https://www.saucedemo.com>.

- 31 tests per browser (Chromium + Firefox) + 1 shared login setup = **63 tests** in `npx playwright test --list`
- Page Object Model, custom fixtures (`test.extend`), `storageState` reuse, `fullyParallel`
- Lead add-ons: `performance_glitch_user` load-budget test and the _Onboarding a Junior Engineer_ section below
- LLM usage and how I validated it: see [`llm-prompts.md`](./llm-prompts.md)

## 1. Prerequisites

- **Node.js 20 or newer** (required by the Playwright version pinned in `package-lock.json`)
- Browsers + OS libraries for Playwright:

```bash
npm install
npx playwright install --with-deps      # downloads Chromium and Firefox (+ system deps on Linux)
```

No `.env`, Docker or local server is needed. The credentials in `src/data/users.ts` are SauceDemo's public demo accounts.

## 2. Run all tests

```bash
npx playwright test
```

What you should see: a `[setup]` login test runs first, then both browser projects run in parallel and the
run is expected to end with `63 passed`. Four of those tests (two users × two browsers) are **expected failures**
(`test.fail`, see §6) — Playwright counts them as passed and the list reporter prints them with `✘`. Any other `✘`/`failed` is a real failure.

Shortcuts (`package.json`): `npm test`, `npm run test:chromium`, `npm run test:firefox`, `npm run test:smoke`, `npm run test:ui`.

## 3. Run a specific file, test or project

```bash
npx playwright test tests/checkout/checkout.spec.ts          # one file
npx playwright test -g "completes an order end to end"       # one test by name
npx playwright test tests/cart --project=firefox             # one folder, one browser
npx playwright test --grep "@smoke"                          # tagged subset (quotes needed in PowerShell)
npx playwright test --ui                                     # interactive UI mode
```

`--project=<browser>` automatically runs the `setup` project first (it is a declared dependency). The setup project
launches **Chromium**, so Chromium must be installed even when you only run Firefox (`playwright install` does that).

## 4. View the HTML report

```bash
npx playwright show-report        # also: npm run report
```

The report is written to `playwright-report/` (`open: 'never'`, so a run never blocks your terminal). Failure screenshots
go to `test-results/`, and are embedded in the report. Traces are captured on the first retry (CI only retries).

## 5. Configuration and timeouts

| Setting             | Value                                   | Why                                                                                                                            |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `baseURL`           | `https://www.saucedemo.com`             | Per brief. `BASE_URL` env var can override it (used only for local verification).                                              |
| `testIdAttribute`   | `data-test`                             | SauceDemo exposes `data-test`, not `data-testid`; lets specs use `getByTestId`.                                                |
| projects            | `setup`, `chromium`, `firefox`          | Two browsers per brief; `setup` performs the single login.                                                                     |
| `fullyParallel`     | `true`                                  | Every test is independent, so files _and_ tests inside files run in parallel.                                                  |
| `retries`           | `process.env.CI ? 1 : 0`                | Per brief. Locally I want failures to be loud, not retried away.                                                               |
| `workers`           | CI: 2, local: default                   | The target is a public shared site; keep CI polite.                                                                            |
| `timeout`           | 30 s (default)                          | Longest normal flow (checkout) takes ~2 s; 30 s is already generous.                                                           |
| `expect.timeout`    | 7 s (default 5 s)                       | Public site over the internet from varying regions; +2 s absorbs latency spikes without hiding hangs.                          |
| `actionTimeout`     | 10 s (default: none)                    | An action stuck on a non-actionable element fails in 10 s with a precise error instead of burning the whole 30 s test timeout. |
| `navigationTimeout` | 20 s (default: none)                    | Same reasoning for `goto`; cold loads of the public host are the slowest step.                                                 |
| `screenshot`        | `'only-on-failure'`                     | Built-in, per brief; `outputDir` is explicitly `./test-results`. No custom hook needed.                                        |
| `trace`             | `'on-first-retry'`                      | Zero cost on green runs; full trace for flaky candidates in CI.                                                                |
| reporter            | `list` + `html` (CI: `github` + `html`) | HTML reporter per brief.                                                                                                       |
| perf test           | 45 s test timeout, 15 s budget          | Justified in the comment at the top of `tests/performance/performance-glitch.spec.ts`.                                         |

## 6. Design decisions

**POM structure:** one class per screen (`LoginPage`, `InventoryPage`, `ProductPage`, `CartPage`, `CheckoutPage`) plus a `Header` component for the cart badge and burger menu; page objects expose locators and _actions_, while **assertions stay in the specs** so a test reads as its own spec.
**Fixtures:** page objects are provided through `test.extend` (lazy, one per test, no boilerplate), plus an option fixture `checkoutInfo` for default customer data.
**Authentication and isolation:** `tests/auth.setup.ts` logs in once through the UI and writes `storageState`; every browser project loads it, and the login/logout/user-specific specs opt out with `test.use({ storageState: NO_AUTH })`. SauceDemo keeps its state in the browser (a `session-username` cookie and cart in `localStorage`), so a fresh context per test already gives full isolation — there is no server-side data to pollute or clean up.
**Locators:** `data-test` ids via `getByTestId`, and roles for buttons inside a product card (scoped by product name, never by index); prices are read from the UI and totals are checked arithmetically, so the suite does not rot when data changes.
**Known-defect users:** `problem_user` and `error_user` have deliberately broken behaviour, so I assert the _correct_ behaviour and mark the test `test.fail(true, reason)`: the suite stays green, the defect is documented, and the test turns red ("expected to fail but passed") the day the app is fixed.
**Trade-offs given the time box:** no custom reporter/Allure (HTML covers the brief), no ESLint/Prettier (keeps `npm install` lean — I would add them next), and no API-level checks because the app has no backend.

## 7. What is covered

| Area          | Tests                                                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login / Auth  | valid login (+ cookie), locked-out user, wrong password, unknown user, empty username/password, dismissable error, protected-page redirect, logout (session cleared, back door closed) |
| Catalogue     | 6 products with name/price/image/button, default order, sort A→Z / Z→A / low→high / high→low, product detail page matches list                                                         |
| Cart          | starts empty per context, add + badge + button swap, cart page content, remove from catalogue and cart, persistence across navigation and reload                                       |
| Checkout      | full happy path with arithmetic on subtotal/tax/total, 3 missing-field validations, cancel on step 1 and on overview                                                                   |
| Special users | `performance_glitch_user` load budget (Lead), `problem_user` images and `error_user` sorting (expected failures)                                                                       |

Not automated on purpose: `error_user` add/remove-to-cart and last-name faults (they depend on internal item-id parity,
which would make the test brittle); the empty-cart checkout quirk.

## 8. Verification status

What was **run**:

- **Live site, both browsers:** `npx playwright test` against <https://www.saucedemo.com> on Windows (PowerShell),
  Chromium + Firefox: **63 tests, 63 in the expected state** (4 of them are the documented `test.fail` cases).
  The HTML report summary: 0 unexpected, 0 flaky, 0 skipped. Wall time was ~4.5 min on a modest laptop
  (Firefox is roughly twice as slow as Chromium on the same tests).
- **Earlier, during development:** `tsc --noEmit` (strict) and `playwright test --list`; a local build of the official
  open-source app (`saucelabs/sample-app-web`) with Chromium: 32/32, and 94/94 over 3 repeats with 4 workers (no flakiness).
  I also removed `test.fail` once from `problem_user` / `error_user` to confirm they fail for the stated reasons (all six
  images share one `src`; the app raises the "Sorting is broken!" alert).
- After the last `tsconfig.json` change (`module: preserve`, `moduleResolution: bundler`) I re-ran `npm run typecheck`
  and `playwright test --list` (63 tests).
- **Latest full run (2026-11-25):** starting from a clean tree (`test-results/`, `playwright-report/` and `playwright/`
  removed), `npm run typecheck` passed and `npx playwright test` on Windows (PowerShell) against the live site ended
  with **`63 passed` in ~3.4 min**, the 4 documented `test.fail` cases included.

Not run: the GitHub Actions workflow, and `playwright install --with-deps` on Linux.

## 9. Onboarding a Junior Engineer

**First week: read, run, break.** I would pair with the junior for a first session and walk through
`playwright.config.ts`, then one spec end to end (login → catalogue → cart → checkout) in UI mode and the trace viewer, so they
see page objects, fixtures and `storageState` working rather than just reading about them. Their first task is small: add
one assertion to an existing test, then deliberately break a locator to learn what failures, screenshots and traces look like.

**Documentation I would add.** A short `CONTRIBUTING.md` with the suite's rules (role or `data-test` locators, no sleeps,
actions in page objects and assertions in specs, one behaviour per test); a one-page diagram of the project dependencies
(`setup` → browsers); a "how to debug a failure" checklist; and a pull-request template whose checklist mirrors those rules.
For the first month, reviews are paired, and comments link to the rule instead of silently fixing the code.

**Preventing test data pollution.** SauceDemo is public and shared, so I assume other people use it at the same time.
Its state lives in the browser, not on a server, which gives three rules: every test runs in its own browser context and shares
no mutable state; no test depends on data created by another, and order is never assumed; and we use only the documented demo
accounts and never try to persist server-side data. On a real client system the same suite would instead seed uniquely named
data (prefixed with the run id) through an API in a fixture and remove it in teardown, against a dedicated environment
rather than a shared one. In CI we cap workers so we do not hammer a public site, and we treat intermittent failures as
signals to investigate, not to retry blindly.

## 10. Repository layout

```
playwright.config.ts          projects, timeouts, reporter, screenshots, retries
tests/auth.setup.ts           one-time login -> storageState
tests/{auth,catalog,cart,checkout,users,performance}/*.spec.ts
src/pages/                    page objects (+ Header component)
src/fixtures/index.ts         test.extend fixtures, NO_AUTH helper
src/data/                     demo users and product names
src/support/                  auth constants, money parsing
.github/workflows/            CI (npm ci, install browsers, test, upload report)
llm-prompts.md                prompts used + how the output was validated
```
