import { CATALOGUE_SIZE } from '../../src/data/products';
import { USERS } from '../../src/data/users';
import { expect, NO_AUTH, test } from '../../src/fixtures';

/**
 * Budget for login -> inventory visible, for performance_glitch_user.
 *
 * Why 15 s:
 *  - SauceDemo deliberately blocks the browser's main thread for 5 s when this user's inventory
 *    page renders (see the app's public source, saucelabs/sample-app-web, Inventory.jsx). Locally the
 *    full login -> inventory flow measured ~5-6 s. The budget must sit well ABOVE that built-in
 *    delay or the test would fail by design, not by regression.
 *  - It is 3x that delay, leaving headroom for a slow public host and CI network jitter, while
 *    still failing fast if the page hangs.
 *  - It is deliberately larger than the global `expect` timeout (7 s), which is why the wait below
 *    passes this value explicitly instead of relying on the default.
 *  - It is below the 45 s test timeout so a breach fails on THIS assertion with a clear message,
 *    not as a generic test timeout.
 * Re-baseline after the first real runs: the measured time is attached to every run.
 */
const INVENTORY_LOAD_BUDGET_MS = 15_000;

test.describe('performance_glitch_user', () => {
  test.use({ storageState: NO_AUTH });

  test('inventory loads within the documented budget', async ({ loginPage, inventoryPage }, testInfo) => {
    test.setTimeout(45_000);
    await loginPage.goto();

    const startedAt = Date.now();
    await loginPage.login(USERS.performanceGlitch);
    await expect(inventoryPage.title, `inventory not visible within ${INVENTORY_LOAD_BUDGET_MS} ms`)
      .toHaveText('Products', { timeout: INVENTORY_LOAD_BUDGET_MS });
    const elapsedMs = Date.now() - startedAt;

    testInfo.annotations.push({ type: 'login-to-inventory-ms', description: String(elapsedMs) });
    await expect(inventoryPage.items).toHaveCount(CATALOGUE_SIZE);
  });
});
