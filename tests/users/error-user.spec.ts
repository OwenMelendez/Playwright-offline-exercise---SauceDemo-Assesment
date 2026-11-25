import { USERS } from '../../src/data/users';
import { expect, NO_AUTH, test } from '../../src/fixtures';

test.describe('error_user', () => {
  test.use({ storageState: NO_AUTH });

  // The brief calls this user "intermittent". The app's public source (saucelabs/sample-app-web)
  // shows its faults are deterministic (sorting, add/remove by item id, last-name input), so they
  // can be tested reliably. Sorting is the one that does not depend on internal item ids.
  test('sorting reorders the list without raising an error', async ({ page, loginPage, inventoryPage }) => {
    test.fail(true, 'Known defect: error_user sorting raises a "Sorting is broken!" alert and does not reorder');

    const alerts: string[] = [];
    page.on('dialog', async (dialog) => {
      alerts.push(dialog.message());
      await dialog.dismiss();
    });

    await loginPage.goto();
    await loginPage.login(USERS.error);
    const original = await inventoryPage.names();

    await inventoryPage.sortBy('za');

    expect(alerts, 'the app raised an unexpected alert').toEqual([]);
    await expect
      .poll(() => inventoryPage.names(), { timeout: 2_000 })
      .toEqual([...original].sort().reverse());
  });
});
