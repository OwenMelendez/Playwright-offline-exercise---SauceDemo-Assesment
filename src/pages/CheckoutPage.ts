import type { Locator, Page } from '@playwright/test';
import { parseMoney } from '../support/money';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Covers the three checkout screens: information, overview and complete. */
export class CheckoutPage {
  readonly title: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly overviewItems: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;
  private readonly itemPrices: Locator;
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('title');
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');
    this.error = page.getByTestId('error');
    this.overviewItems = page.getByTestId('inventory-item');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
  }

  /** Fills only the provided fields so tests can leave one blank on purpose. */
  async fillInformation(info: Partial<CheckoutInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async itemPricesOnOverview(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(parseMoney);
  }

  async subtotal(): Promise<number> {
    return parseMoney(await this.subtotalLabel.innerText());
  }

  async tax(): Promise<number> {
    return parseMoney(await this.taxLabel.innerText());
  }

  async total(): Promise<number> {
    return parseMoney(await this.totalLabel.innerText());
  }
}
