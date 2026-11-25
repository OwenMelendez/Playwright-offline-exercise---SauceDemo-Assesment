import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { parseMoney } from '../support/money';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly sortSelect: Locator;
  private readonly itemNames: Locator;
  private readonly itemPrices: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
    await expect(this.title).toHaveText('Products');
  }

  item(name: string): Locator {
    return this.items.filter({
      has: this.itemNames.getByText(name, { exact: true }),
    });
  }

  addButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: /add to cart/i });
  }

  removeButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: /remove/i });
  }

  async addToCart(name: string): Promise<void> {
    await this.addButton(name).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.removeButton(name).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async openProduct(name: string): Promise<void> {
    await this.itemNames.getByText(name, { exact: true }).click();
  }

  async names(): Promise<string[]> {
    await expect(this.items.first()).toBeVisible();
    return this.itemNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    await expect(this.items.first()).toBeVisible();
    return (await this.itemPrices.allTextContents()).map(parseMoney);
  }

  async imageSources(): Promise<string[]> {
    await expect(this.items.first()).toBeVisible();
    return this.items
      .getByRole('img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''));
  }
}
