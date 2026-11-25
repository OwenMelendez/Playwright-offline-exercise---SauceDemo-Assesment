import { PASSWORD, USERS } from '../../src/data/users';
import { CATALOGUE_SIZE } from '../../src/data/products';
import { expect, NO_AUTH, test } from '../../src/fixtures';

test.describe('Login (unauthenticated)', () => {
  // These specs must NOT start with the shared session.
  test.use({ storageState: NO_AUTH });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'standard_user logs in and lands on the catalogue',
    { tag: '@smoke' },
    async ({ loginPage, inventoryPage, context }) => {
      await loginPage.login(USERS.standard);

      await expect(inventoryPage.title).toHaveText('Products');
      await expect(inventoryPage.items).toHaveCount(CATALOGUE_SIZE);

      const cookies = await context.cookies();
      expect(cookies.find((c) => c.name === 'session-username')?.value).toBe(USERS.standard);
    },
  );

  const rejected = [
    { title: 'locked_out_user', username: USERS.lockedOut, password: PASSWORD, message: /locked out/i },
    { title: 'a wrong password', username: USERS.standard, password: 'not_the_password', message: /do not match any user/i },
    { title: 'an unknown user', username: 'nobody_here', password: PASSWORD, message: /do not match any user/i },
    { title: 'an empty username', username: '', password: PASSWORD, message: /username is required/i },
    { title: 'an empty password', username: USERS.standard, password: '', message: /password is required/i },
  ];

  for (const { title, username, password, message } of rejected) {
    test(`rejects ${title} with a clear error`, async ({ loginPage, inventoryPage }) => {
      await loginPage.login(username, password);

      await expect(loginPage.error).toBeVisible();
      await expect(loginPage.error).toContainText(message);
      // Still on the login form, no catalogue leaked.
      await expect(loginPage.loginButton).toBeVisible();
      await expect(inventoryPage.items).toHaveCount(0);
    });
  }

  test('error banner can be dismissed', async ({ loginPage }) => {
    await loginPage.login(USERS.lockedOut);
    await expect(loginPage.error).toBeVisible();

    await loginPage.errorDismiss.click();

    await expect(loginPage.error).toBeHidden();
  });

  test('protected pages redirect to login when there is no session', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.error).toContainText(/logged in/i);
  });
});

test.describe('Logout (authenticated)', () => {
  test('burger menu logout ends the session', async ({ page, inventoryPage, header, loginPage, context }) => {
    await inventoryPage.goto();

    await header.logout();

    await expect(loginPage.loginButton).toBeVisible();
    expect((await context.cookies()).some((c) => c.name === 'session-username')).toBe(false);

    // The back door is closed too.
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText(/logged in/i);
  });
});
