import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/sign-in");
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByLabel("Password").fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  async login(email: string, password: string): Promise<void> {
    // Step 1: Wait for Cloudflare challenge to complete
    await this.waitForCloudflareChallenge();

    // Step 2: Wait for login form to be visible and ready
    // This ensures the form is fully loaded and CAPTCHA token (if any) is set
    const emailInput = this.page.getByRole("textbox", { name: "Email" });
    await emailInput.waitFor({ state: "visible", timeout: 10000 });

    // Step 3: Wait a bit more to ensure CAPTCHA token is properly set
    // Cloudflare may need a moment after challenge completes to set the token
    // Also wait for the page to be in a stable state
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2000);

    // Step 4: Fill and submit the form
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  isOnLoginPage(): boolean {
    return this.isUrlContaining("sign-in");
  }

  async performLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);

    try {
      // Wait for URL to change away from sign-in/sign-up pages
      // Simplified check: only exclude sign-in and sign-up, not all /auth/ paths
      await this.page.waitForURL(
        (url) => {
          const urlString = url.toString().toLowerCase();
          return (
            !urlString.includes("sign-in") && !urlString.includes("sign-up")
          );
        },
        {
          timeout: 15000,
        }
      );

      // Additional verification: Double-check we're on a valid post-login page
      // (Defensive check - waitForURL already verified this, but ensures consistency)
      const currentUrl = this.page.url().toLowerCase();
      const isSuccess =
        currentUrl !== "" &&
        !currentUrl.includes("sign-in") &&
        !currentUrl.includes("sign-up");

      return isSuccess;
    } catch {
      // Check for actual error messages on the page (not field labels)
      const errorSelectors = [
        '[role="alert"]',
        '[role="status"]',
        ".error-message",
        '[class*="error-message"]',
        '[class*="Error"]',
        'div:has-text("Invalid")',
        'div:has-text("incorrect")',
        'div:has-text("failed")',
        'div:has-text("CAPTCHA")',
        'div:has-text("captcha")',
        'div:has-text("Missing CAPTCHA")',
      ];

      const errorMessages: string[] = [];
      for (const selector of errorSelectors) {
        try {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            const text = await element.textContent();
            if (
              text &&
              text.trim().length > 0 &&
              !text.includes("Email") &&
              !text.includes("Password") &&
              (text.toLowerCase().includes("error") ||
                text.toLowerCase().includes("invalid") ||
                text.toLowerCase().includes("incorrect") ||
                text.toLowerCase().includes("failed") ||
                text.toLowerCase().includes("captcha"))
            ) {
              errorMessages.push(text.trim());
            }
          }
        } catch {
          // Continue checking other selectors
        }
      }

      // Get current URL for debugging
      const currentUrl = this.page.url();

      if (errorMessages.length > 0) {
        console.error(`Login failed with error: ${errorMessages.join(", ")}`);
        console.error(`Current URL: ${currentUrl}`);
      } else {
        console.error(`Login failed: URL did not change from sign-in page`);
        console.error(`Current URL: ${currentUrl}`);
        console.error(`Expected: URL without "sign-in" or "sign-up"`);
      }

      // Still on login page after timeout - login failed
      await this.takeScreenshot("login-verification-failed");
      return false;
    }
  }
}
