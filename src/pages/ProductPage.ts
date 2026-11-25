import type { Locator, Page } from '@playwright/test';

/** Product detail page (/inventory-item.html?id=N). */
export class ProductPage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.backButton = page.getByTestId('back-to-products');
  }
}
