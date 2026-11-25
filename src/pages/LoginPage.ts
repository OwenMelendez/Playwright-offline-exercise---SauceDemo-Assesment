import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { PASSWORD } from '../data/users';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;
  readonly errorDismiss: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.errorDismiss = page.getByTestId('error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username: string, password: string = PASSWORD): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
