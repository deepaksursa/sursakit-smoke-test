import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Constants for login page timeouts and selectors
 */
const LOGIN_TIMEOUTS = {
  formWait: 10000,
  urlChange: 15000,
  postChallengeDelay: 2000,
} as const;

const ERROR_SELECTORS = [
  '[role="alert"]',
  '[role="status"]',
  ".error-message",
  '[class*="error-message"]',
  '[class*="Error"]',
] as const;

const ERROR_KEYWORDS = [
  "error",
  "invalid",
  "incorrect",
  "failed",
  "captcha",
] as const;
const EXCLUDE_KEYWORDS = ["email", "password"] as const;

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page with Cloudflare handling
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/sign-in");
  }

  /**
   * Fill email input field
   */
  async fillEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
  }

  /**
   * Fill password input field
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.getByLabel("Password").fill(password);
  }

  /**
   * Click the login submit button
   */
  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  /**
   * Detect login errors on the page
   * @returns Array of error messages found, or empty array if no errors
   */
  private async detectLoginError(): Promise<string[]> {
    const errorMessages: string[] = [];

    for (const selector of ERROR_SELECTORS) {
      try {
        const elements = await this.page.locator(selector).all();
        for (const element of elements) {
          const text = await element.textContent();
          if (!text || text.trim().length === 0) continue;

          const textLower = text.toLowerCase();
          const hasExcludeKeyword = EXCLUDE_KEYWORDS.some((keyword) =>
            textLower.includes(keyword)
          );
          const hasErrorKeyword = ERROR_KEYWORDS.some((keyword) =>
            textLower.includes(keyword)
          );

          if (!hasExcludeKeyword && hasErrorKeyword) {
            errorMessages.push(text.trim());
          }
        }
      } catch {
        // Continue checking other selectors
      }
    }

    return errorMessages;
  }

  /**
   * Perform login action (fill form and submit)
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    // Wait for Cloudflare challenge to complete
    await this.waitForCloudflareChallenge();

    // Wait for login form to be visible and ready
    const emailInput = this.page.getByRole("textbox", { name: "Email" });
    await emailInput.waitFor({
      state: "visible",
      timeout: LOGIN_TIMEOUTS.formWait,
    });

    // Brief delay to ensure CAPTCHA token is set after Cloudflare challenge
    await this.page.waitForTimeout(LOGIN_TIMEOUTS.postChallengeDelay);

    // Fill and submit the form
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  /**
   * Check if currently on the login page
   */
  isOnLoginPage(): boolean {
    return this.isUrlContaining("sign-in");
  }

  /**
   * Perform login and verify success
   * @param email - User email address
   * @param password - User password
   * @returns true if login successful, false otherwise
   */
  async performLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);

    try {
      // Wait for URL to change away from sign-in/sign-up pages
      await this.page.waitForURL(
        (url) => {
          const urlString = url.toString().toLowerCase();
          return (
            !urlString.includes("sign-in") && !urlString.includes("sign-up")
          );
        },
        { timeout: LOGIN_TIMEOUTS.urlChange }
      );

      // Verify we're on a valid post-login page
      const currentUrl = this.page.url().toLowerCase();
      return (
        currentUrl !== "" &&
        !currentUrl.includes("sign-in") &&
        !currentUrl.includes("sign-up")
      );
    } catch {
      // Login failed - detect and log errors
      const errorMessages = await this.detectLoginError();
      const currentUrl = this.page.url();

      // Log at info level (less alarming than error) since this may be expected behavior
      if (errorMessages.length > 0) {
        console.log(`[Login] Failed with error: ${errorMessages.join(", ")}`);
      } else {
        console.log(`[Login] Failed: URL did not change from sign-in page`);
      }
      console.log(`[Login] Current URL: ${currentUrl}`);

      await this.takeScreenshot("login-verification-failed");
      return false;
    }
  }
}
