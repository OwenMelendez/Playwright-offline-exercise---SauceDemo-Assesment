import { PRODUCTS } from '../../src/data/products';
import { expect, test } from '../../src/fixtures';
import { sum } from '../../src/support/money';

test.describe('Checkout', () => {
  const chosen = [PRODUCTS.backpack, PRODUCTS.bikeLight];

  // Every test starts on checkout step one with two items in the cart.
  test.beforeEach(async ({ inventoryPage, header, cartPage, checkoutPage }) => {
    await inventoryPage.goto();
    for (const name of chosen) await inventoryPage.addToCart(name);
    await header.openCart();
    await cartPage.checkout();
    await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
  });

  test('completes an order end to end', { tag: '@smoke' }, async ({ checkoutPage, checkoutInfo, header, inventoryPage }) => {
    await checkoutPage.fillInformation(checkoutInfo);
    await checkoutPage.continue();

    await expect(checkoutPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutPage.overviewItems).toHaveCount(chosen.length);

    // Totals are verified arithmetically from what the UI shows, not against hard-coded money.
    const subtotal = await checkoutPage.subtotal();
    const tax = await checkoutPage.tax();
    expect(subtotal).toBeCloseTo(sum(await checkoutPage.itemPricesOnOverview()), 2);
    expect(await checkoutPage.total()).toBeCloseTo(subtotal + tax, 2);

    await checkoutPage.finish();

    await expect(checkoutPage.title).toHaveText('Checkout: Complete!');
    await expect(checkoutPage.completeHeader).toHaveText(/thank you for your order/i);
    await expect(header.cartBadge).toBeHidden();

    await checkoutPage.backHomeButton.click();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  const incomplete = [
    { missing: 'first name', info: { lastName: 'Lovelace', postalCode: '110111' }, message: /first name is required/i },
    { missing: 'last name', info: { firstName: 'Ada', postalCode: '110111' }, message: /last name is required/i },
    { missing: 'postal code', info: { firstName: 'Ada', lastName: 'Lovelace' }, message: /postal code is required/i },
  ];

  for (const { missing, info, message } of incomplete) {
    test(`blocks checkout when ${missing} is missing`, async ({ checkoutPage }) => {
      await checkoutPage.fillInformation(info);
      await checkoutPage.continue();

      await expect(checkoutPage.error).toContainText(message);
      await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
    });
  }

  test('cancel on step one returns to the cart with items intact', async ({ checkoutPage, cartPage }) => {
    await checkoutPage.cancelButton.click();

    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.items).toHaveCount(chosen.length);
  });

  test('cancel on the overview returns to the catalogue without ordering', async ({ checkoutPage, checkoutInfo, inventoryPage, header }) => {
    await checkoutPage.fillInformation(checkoutInfo);
    await checkoutPage.continue();
    await expect(checkoutPage.title).toHaveText('Checkout: Overview');

    // The overview has no "Back Home" button (that one only exists after finishing); Cancel is the exit here.
    await checkoutPage.cancelButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(header.cartBadge).toHaveText(String(chosen.length));
  });
});
