import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test";

export class SignupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[id*="email" i]',
    "#email",
    '[data-testid="email"]',
  ];
  private passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]',
    'input[id*="password" i]',
    "#password",
    '[data-testid="password"]',
  ];

  private nameSelectors = [
    'input[name="name"]', // Most reliable - matches the HTML name attribute
    'input[placeholder*="name" i]', // Fallback - matches placeholder
    'input[type="text"]', // Generic fallback (less reliable)
  ];

  private submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Create an account")',
    '[data-testid="submit"]',
    "form button",
  ];

  /**
   * Navigate to signup page with Cloudflare handling
   */
  async navigateToSignup(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/sign-up");
    await this.waitForCloudflareChallenge();
  }

  /**
   * Get email input element
   */
  async getEmailInput(): Promise<Locator> {
    const element = await this.findElement(this.emailSelectors);
    if (!element) {
      await this.takeScreenshot("email-input-not-found");
      throw new Error("Email input not found. Check screenshot.");
    }
    return element;
  }

  /**
   * Get password input element
   */
  async getPasswordInput(): Promise<Locator> {
    const element = await this.findElement(this.passwordSelectors);
    if (!element) {
      await this.takeScreenshot("password-input-not-found");
      throw new Error("Password input not found. Check screenshot.");
    }
    return element;
  }

  /**
   * Get name input element
   */
  async getNameInput(): Promise<Locator> {
    const element = await this.findElement(this.nameSelectors);
    if (!element) {
      await this.takeScreenshot("name-input-not-found");
      throw new Error("Name input not found. Check screenshot.");
    }
    return element;
  }

  /**
   * Get submit button element
   */
  async getSubmitButton(): Promise<Locator> {
    const element = await this.findElement(this.submitSelectors);
    if (!element) {
      await this.takeScreenshot("submit-button-not-found");
      throw new Error("Submit button not found. Check screenshot.");
    }
    return element;
  }

  /**
   * Fill name field
   */
  async fillName(name: string): Promise<void> {
    const nameInput = await this.getNameInput();
    await nameInput.fill(name);
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    const emailInput = await this.getEmailInput();
    await emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    const passwordInput = await this.getPasswordInput();
    await passwordInput.fill(password);
  }

  /**
   * Click submit/signup button
   */
  async clickSubmit(): Promise<void> {
    const submitButton = await this.getSubmitButton();
    await submitButton.click();
  }

  /**
   * Main signup action - combines all steps
   */
  async signup(name: string, email: string, password: string): Promise<void> {
    await this.prepareSignupForm();
    await this.fillSignupForm(name, email, password);
    await this.submitSignupForm();
  }

  /**
   * Prepare signup form (handle Cloudflare challenges)
   */
  private async prepareSignupForm(): Promise<void> {
    await this.waitForCloudflareChallenge();
  }

  /**
   * Fill signup form with user data
   */
  private async fillSignupForm(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.takeScreenshot("signup-form-filled");
    await this.waitForCloudflareChallenge();
  }

  /**
   * Submit signup form
   */
  private async submitSignupForm(): Promise<void> {
    await this.clickSubmit();
  }

  /**
   * Check if we're still on signup page
   */
  isOnSignupPage(): boolean {
    return (
      this.isUrlContaining("sign-up") ||
      this.isUrlContaining("register") ||
      this.isUrlContaining("auth")
    );
  }

  /**
   * Complete signup workflow
   * Returns true if signup was successful (redirected away from signup page)
   */
  async performSignup(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    await this.signup(name, email, password);
    await this.waitForSignupResponse();

    // If we're no longer on signup page, signup likely succeeded
    if (!this.isOnSignupPage()) {
      return true;
    }

    // Still on signup page - signup may have failed
    await this.takeScreenshot("signup-verification-failed");
    return false;
  }

  /**
   * Wait for signup response and page stabilization
   */
  private async waitForSignupResponse(): Promise<void> {
    try {
      await Promise.race([
        this.page.waitForLoadState("networkidle", { timeout: 10000 }),
        this.page.waitForLoadState("domcontentloaded", { timeout: 5000 }),
      ]);
    } catch {
      // Continue with verification even if navigation times out
    }

    await this.page.waitForTimeout(1000);
  }
}
