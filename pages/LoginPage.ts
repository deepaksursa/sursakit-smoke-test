import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";


export class LoginPage extends BasePage {
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

  private submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'button:has-text("Log In")',
    '[data-testid="login"]',
    '[data-testid="submit"]',
    "form button",
  ];

  private errorSelectors = [
    '[class*="error"]',
    '[class*="invalid"]',
    '[class*="warning"]',
    '[class*="alert"]',
    '[class*="danger"]',
    '[class*="fail"]',
    '[role="alert"]',
    '[data-testid*="error"]',
    
    'text="Invalid email or password"',
    'text="Invalid"',
    'text="Error"',
    'text="Wrong"',
    'text="Incorrect"',
    'text="Failed"',
    'text="unavailable"',
    'text="service"',
    
    ':has-text("Invalid")',
    ':has-text("Error")',
    ':has-text("Wrong")',
    ':has-text("Incorrect")',
    ':has-text("Failed")',
    ':has-text("password")',
    ':has-text("email")',
    
    '.notification',
    '.toast',
    '.message',
    '.feedback',
    '#error',
    '#message',
  ];

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page with Cloudflare handling
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/sign-in");
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
   * Click submit/login button
   */
  async clickSubmit(): Promise<void> {
    const submitButton = await this.getSubmitButton();
    await submitButton.click();
  }

  /**
   * Main login action - combines all steps
   */
  async login(email: string, password: string): Promise<void> {

    await this.prepareLoginForm();
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
  }

  /**
   * Prepare login form (handle Cloudflare challenges)
   */
  private async prepareLoginForm(): Promise<void> {
    await this.waitForCloudflareChallenge();
  }

  /**
   * Fill login form with credentials
   */
  private async fillLoginForm(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.takeScreenshot("form-filled");
    await this.waitForCloudflareChallenge();
  }

  /**
   * Submit login form
   */
  private async submitLoginForm(): Promise<void> {
    await this.clickSubmit();
  }

  /**
   * Check if we're still on login page
   */
  isOnLoginPage(): boolean {
    return (
      this.isUrlContaining("sign-in") ||
      this.isUrlContaining("login") ||
      this.isUrlContaining("auth")
    );
  }

  /**
   * Check for error messages on page
   */
  async getErrorMessages(): Promise<string[]> {
    const errors: string[] = [];

    for (const selector of this.errorSelectors) {
      try {
        const errorElement = this.page.locator(selector);
        if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await errorElement.textContent();
          if (errorText && errorText.trim()) {
            errors.push(errorText.trim());
          }
        }
      } catch {
        // Continue checking other selectors
      }
    }

    const pageContent = await this.page.textContent('body').catch(() => '');
    const errorPhrases = [
      'Invalid email or password',
      'Invalid credentials',
      'Login failed',
      'Authentication failed',
      'Wrong password',
      'User not found',
      'Account locked',
      'Too many attempts'
    ];

    for (const phrase of errorPhrases) {
      if (pageContent.toLowerCase().includes(phrase.toLowerCase())) {
        if (!errors.some(e => e.toLowerCase().includes(phrase.toLowerCase()))) {
          errors.push(phrase);
        }
      }
    }

    return [...new Set(errors)];
  }

  /**
   * Verify login success
   */

  async verifyLoginSuccess(): Promise<boolean> {
    await this.waitForLoginResponse();
    
    if (this.isOnLoginPage()) {
      await this.handleLoginFailure();
      return false;
    }

    return true;
  }

  /**
   * Wait for login response and page stabilization
   */
  private async waitForLoginResponse(): Promise<void> {
    try {
      await Promise.race([
        this.page.waitForLoadState("networkidle", { timeout: 10000 }),
        this.page.waitForLoadState("domcontentloaded", { timeout: 5000 })
      ]);
    } catch {
      // Continue with verification even if navigation times out
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * Handle login failure with comprehensive error reporting
   */
  private async handleLoginFailure(): Promise<void> {
    await this.takeScreenshot("login-verification-failed");
    
    const errors = await this.getErrorMessages();
    if (errors.length === 0) {
      await this.debugPageContent();
    }
  }

  /**
   * Debug page content when no obvious errors are found
   */
  private async debugPageContent(): Promise<void> {
    await this.page.textContent('body').catch(() => '');
    
    await this.page.locator('*:has-text("invalid"), *:has-text("error"), *:has-text("wrong"), *:has-text("failed")').all().catch(() => []);
  }

  /**
   * Complete login workflow with validation
   */

  async performLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);
    return await this.verifyLoginSuccess();
  }
}
