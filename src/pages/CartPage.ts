import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  private readonly itemNames: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.itemNames = page.getByTestId('inventory-item-name');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
    await expect(this.title).toHaveText('Your Cart');
  }

  async removeItem(name: string): Promise<void> {
    await this.items
      .filter({ has: this.itemNames.getByText(name, { exact: true }) })
      .getByRole('button', { name: /remove/i })
      .click();
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
