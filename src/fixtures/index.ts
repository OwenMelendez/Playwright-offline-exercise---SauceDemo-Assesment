import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, type CheckoutInfo } from '../pages/CheckoutPage';
import { Header } from '../pages/Header';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';

interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: Header;
  /** Default customer data for checkout; override per file with `test.use({ checkoutInfo: ... })`. */
  checkoutInfo: CheckoutInfo;
}

/**
 * Page objects are exposed as fixtures: they are created lazily (only when a test asks for them),
 * share the test's own `page`, and need no setup/teardown boilerplate in specs.
 * Authentication is NOT done here - it comes from the project-level `storageState`.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  checkoutInfo: [
    { firstName: 'Ada', lastName: 'Lovelace', postalCode: '110111' },
    { option: true },
  ],
});

export { expect };
export { NO_AUTH } from '../support/auth';
