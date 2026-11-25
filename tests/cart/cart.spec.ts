import { PRODUCTS } from '../../src/data/products';
import { expect, test } from '../../src/fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('starts empty in every fresh browser context', async ({ header }) => {
    await expect(header.cartBadge).toBeHidden();
  });

  test('adding an item updates the badge and swaps the button', { tag: '@smoke' }, async ({ inventoryPage, header }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);

    await expect(header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(PRODUCTS.backpack)).toBeVisible();
    await expect(inventoryPage.addButton(PRODUCTS.backpack)).toHaveCount(0);
  });

  test('cart page lists exactly the items that were added', async ({ inventoryPage, header, cartPage }) => {
    const chosen = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.onesie];
    for (const name of chosen) await inventoryPage.addToCart(name);
    await expect(header.cartBadge).toHaveText('3');

    await header.openCart();

    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.items).toHaveCount(chosen.length);
    expect([...(await cartPage.names())].sort()).toEqual([...chosen].sort());
  });

  test('removing from the catalogue decrements the badge and hides it at zero', async ({ inventoryPage, header }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await expect(header.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(PRODUCTS.backpack);
    await expect(header.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart(PRODUCTS.bikeLight);
    await expect(header.cartBadge).toBeHidden();
  });

  test('removing from the cart page drops only that item', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.boltTShirt);
    await header.openCart();

    await cartPage.removeItem(PRODUCTS.backpack);

    await expect(cartPage.items).toHaveCount(1);
    expect(await cartPage.names()).toEqual([PRODUCTS.boltTShirt]);
    await expect(header.cartBadge).toHaveText('1');
  });

  test('cart contents survive navigation and a page reload', async ({ page, inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
    await header.openCart();
    await cartPage.continueShoppingButton.click();
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(header.cartBadge).toHaveText('1');

    await page.reload();

    await expect(header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(PRODUCTS.fleeceJacket)).toBeVisible();
  });
});
