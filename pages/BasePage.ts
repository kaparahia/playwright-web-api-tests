import { Page, Locator, expect } from '@playwright/test';

/**
 * Base class for all page objects.
 * It holds shared logic such as navigation, waits, screenshots, and more.
 * All other pages inherit from this class, making the project easy to extend:
 * a new page immediately receives the full set of base utilities.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForUrl(pattern: string | RegExp) {
    await this.page.waitForURL(pattern);
  }

  async expectVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async expectHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
