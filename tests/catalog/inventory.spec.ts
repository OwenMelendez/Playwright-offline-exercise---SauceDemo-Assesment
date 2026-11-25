import { CATALOGUE_SIZE, PRODUCTS } from '../../src/data/products';
import { expect, test } from '../../src/fixtures';

test.describe('Product catalogue', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists every product with name, price, image and an add button', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(CATALOGUE_SIZE);

    for (const name of Object.values(PRODUCTS)) {
      const item = inventoryPage.item(name);
      await expect(item).toBeVisible();
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(item.getByRole('img')).toBeVisible();
      await expect(inventoryPage.addButton(name)).toBeEnabled();
    }
  });

  test('default order is name A to Z', async ({ inventoryPage }) => {
    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort());
  });

  const byName = [
    { option: 'az', label: 'name (A to Z)', order: (n: string[]) => [...n].sort() },
    { option: 'za', label: 'name (Z to A)', order: (n: string[]) => [...n].sort().reverse() },
  ] as const;

  for (const { option, label, order } of byName) {
    test(`sorts by ${label}`, async ({ inventoryPage }) => {
      const original = await inventoryPage.names();

      await inventoryPage.sortBy(option);

      await expect.poll(() => inventoryPage.names()).toEqual(order(original));
    });
  }

  const byPrice = [
    { option: 'lohi', label: 'price (low to high)', order: (p: number[]) => [...p].sort((a, b) => a - b) },
    { option: 'hilo', label: 'price (high to low)', order: (p: number[]) => [...p].sort((a, b) => b - a) },
  ] as const;

  for (const { option, label, order } of byPrice) {
    test(`sorts by ${label}`, async ({ inventoryPage }) => {
      const original = await inventoryPage.prices();

      await inventoryPage.sortBy(option);

      await expect.poll(() => inventoryPage.prices()).toEqual(order(original));
    });
  }

  test('product detail page matches the catalogue entry', async ({ page, inventoryPage, productPage }) => {
    const listPrice = await inventoryPage.item(PRODUCTS.backpack).getByTestId('inventory-item-price').innerText();

    await inventoryPage.openProduct(PRODUCTS.backpack);

    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(productPage.name).toHaveText(PRODUCTS.backpack);
    await expect(productPage.price).toHaveText(listPrice);
    await expect(productPage.description).not.toBeEmpty();

    await productPage.backButton.click();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
