import { USERS } from '../../src/data/users';
import { expect, NO_AUTH, test } from '../../src/fixtures';

test.describe('problem_user', () => {
  test.use({ storageState: NO_AUTH });

  test('each product shows its own image', async ({ loginPage, inventoryPage }) => {
    // SauceDemo ships this user broken on purpose. We assert the CORRECT behaviour and mark the
    // test as an expected failure: it documents the defect, keeps the run green, and turns red
    // ("expected to fail but passed") the day the app is fixed so the annotation gets removed.
    test.fail(true, 'Known defect: problem_user renders the same image for every product');

    await loginPage.goto();
    await loginPage.login(USERS.problem);

    const sources = await inventoryPage.imageSources();
    expect(new Set(sources).size).toBe(sources.length);
  });
});
