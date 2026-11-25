import { test as setup, expect } from '@playwright/test';
import { USERS } from '../src/data/users';
import { LoginPage } from '../src/pages/LoginPage';
import { AUTH_FILE } from '../src/support/auth';

/**
 * Runs once per `npx playwright test` (project "setup"), before the browser projects.
 * Every browser project then starts each test with this session already loaded, so only
 * the login specs pay the cost of a UI login.
 */
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(USERS.standard);
  await expect(page.getByTestId('title')).toHaveText('Products');
  await page.context().storageState({ path: AUTH_FILE });
});
