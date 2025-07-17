import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object - Foundation for all page objects
 * 
 * Provides common functionality that all pages inherit:
 * - Navigation helpers
 * - Screenshot utilities  
 * - Wait helpers
 * - Common element interactions
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = Date.now();
    await this.page.screenshot({ 
      path: `test-results/${name}-${timestamp}.png`, 
      fullPage: true 
    });
  }

  /**
   * Wait for element to be visible with multiple selector attempts
   */
  async waitForElement(selectors: string[], timeout: number = 10000): Promise<Locator | null> {
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      try {
        await element.waitFor({ state: 'visible', timeout: 2000 });
        return element;
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * Find element using multiple selectors (flexible element location)
   */
  async findElement(selectors: string[]): Promise<Locator | null> {
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        return element;
      }
    }
    return null;
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if we're on a specific page type
   */
  isUrlContaining(text: string): boolean {
    return this.getCurrentUrl().includes(text);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
} 