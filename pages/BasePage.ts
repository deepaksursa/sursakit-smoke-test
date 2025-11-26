import { Page, Locator } from "@playwright/test";

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
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = Date.now();
    await this.page.screenshot({
      path: `test-results/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for element to be visible with multiple selector attempts
   */
  async waitForElement(
    selectors: string[],
    timeout: number = 10000
  ): Promise<Locator | null> {
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      try {
        await element.waitFor({ state: "visible", timeout: timeout });
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
  async findElement(selectors: string[]): Promise<Locator> {
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        return element;
      }
    }
    throw new Error(
      `Element not found. None of the selectors matched or visible: ${selectors.join(
        ", "
      )}`
    );
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
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if Cloudflare challenge is present on the page
   */
  async isCloudflareChallenge(): Promise<boolean> {
    try {
      // Check for Cloudflare challenge indicators
      const cloudflareIndicators = [
        'text="Checking your browser before accessing"',
        'text="Just a moment"',
        'text="Please wait"',
        '[id*="cf-"]',
        '[class*="cf-"]',
        'iframe[src*="challenges.cloudflare.com"]',
        'iframe[src*="cloudflare"]',
        'text="DDoS protection by Cloudflare"',
        'text="Ray ID"',
      ];

      for (const selector of cloudflareIndicators) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          return true;
        }
      }

      // Check page title
      const title = await this.page.title();
      if (
        title.toLowerCase().includes("just a moment") ||
        title.toLowerCase().includes("checking your browser")
      ) {
        return true;
      }

      // Check URL
      const url = this.page.url();
      if (url.includes("challenges.cloudflare.com")) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Wait for Cloudflare challenge to complete
   * This will wait for the challenge to be solved (either automatically or manually)
   */
  async waitForCloudflareChallenge(
    maxWaitTime: number = 30000
  ): Promise<boolean> {
    console.log("🛡️ Checking for Cloudflare challenge...");

    const isChallenge = await this.isCloudflareChallenge();
    if (!isChallenge) {
      console.log("✅ No Cloudflare challenge detected");
      return true;
    }

    console.log("⏳ Cloudflare challenge detected, waiting for completion...");
    console.log(
      "💡 If challenge requires manual interaction, please complete it in the browser"
    );

    const startTime = Date.now();
    const checkInterval = 1000; // Check every second

    while (Date.now() - startTime < maxWaitTime) {
      // Check if challenge is still present
      const stillChallenging = await this.isCloudflareChallenge();

      if (!stillChallenging) {
        console.log("✅ Cloudflare challenge completed!");
        // Wait a bit more for page to fully load
        await this.page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {});
        return true;
      }

      // Wait before next check
      await this.page.waitForTimeout(checkInterval);
    }

    console.log(
      "⚠️ Cloudflare challenge timeout - challenge may still be active"
    );
    return false;
  }

  /**
   * Navigate with Cloudflare challenge handling
   */
  async navigateWithCloudflareHandling(url: string): Promise<void> {
    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for Cloudflare challenge if present
    await this.waitForCloudflareChallenge();

    // Wait for page to be fully loaded
    await this.page
      .waitForLoadState("networkidle", { timeout: 10000 })
      .catch(() => {});
  }
}
