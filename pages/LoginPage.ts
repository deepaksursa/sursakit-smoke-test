import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Login Page Object - Handles all login-related interactions
 *
 * Encapsulates:
 * - Login form interactions
 * - Element location with fallback selectors
 * - Login validation
 * - Error handling
 */

export class LoginPage extends BasePage {
  // Selector arrays for flexible element location
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
    // Class-based selectors
    '[class*="error"]',
    '[class*="invalid"]',
    '[class*="warning"]',
    '[class*="alert"]',
    '[class*="danger"]',
    '[class*="fail"]',
    '[role="alert"]',
    '[data-testid*="error"]',
    
    // Text-based selectors (more comprehensive)
    'text="Invalid email or password"',
    'text="Invalid"',
    'text="Error"',
    'text="Wrong"',
    'text="Incorrect"',
    'text="Failed"',
    'text="unavailable"',
    'text="service"',
    
    // Partial text matches
    ':has-text("Invalid")',
    ':has-text("Error")',
    ':has-text("Wrong")',
    ':has-text("Incorrect")',
    ':has-text("Failed")',
    ':has-text("password")',
    ':has-text("email")',
    
    // Common notification selectors
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
    console.log(`✅ Email entered: ${email}`);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    const passwordInput = await this.getPasswordInput();
    await passwordInput.fill(password);
    console.log("✅ Password entered");
  }

  /**
   * Click submit/login button
   */
  async clickSubmit(): Promise<void> {
    const submitButton = await this.getSubmitButton();
    await submitButton.click();
    console.log("✅ Submit button clicked");
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
    console.log("🚀 Submitting login form...");
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

    console.log("🔍 Searching for error messages...");

    for (const selector of this.errorSelectors) {
      try {
        const errorElement = this.page.locator(selector);
        if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await errorElement.textContent();
          if (errorText && errorText.trim()) {
            console.log(`❌ Found error with selector "${selector}": "${errorText.trim()}"`);
            errors.push(errorText.trim());
          }
        }
      } catch (error) {
        // Continue checking other selectors
        console.log(`⚠️ Error checking selector "${selector}": ${error}`);
      }
    }

    // Additional check: scan entire page for common error phrases
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
        console.log(`❌ Found error phrase in page content: "${phrase}"`);
        if (!errors.some(e => e.toLowerCase().includes(phrase.toLowerCase()))) {
          errors.push(phrase);
        }
      }
    }

    if (errors.length === 0) {
      console.log("ℹ️ No error messages found on page");
    }

    return [...new Set(errors)]; // Remove duplicates
  }

  /**
   * Verify login success
   */

  async verifyLoginSuccess(): Promise<boolean> {
    await this.waitForLoginResponse();
    
    const currentUrl = this.getCurrentUrl();
    console.log(`🔍 Current URL after login: ${currentUrl}`);
    
    if (this.isOnLoginPage()) {
      await this.handleLoginFailure();
      return false;
    }

    console.log("✅ Login successful - redirected away from login page");
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
      console.log("⚠️ Navigation timeout, proceeding with verification...");
    }

    // Buffer time for any final redirects
    await this.page.waitForTimeout(1000);
  }

  /**
   * Handle login failure with comprehensive error reporting
   */
  private async handleLoginFailure(): Promise<void> {
    console.log("❌ Still on login page - login failed");
    
    await this.takeScreenshot("login-verification-failed");
    
    const errors = await this.getErrorMessages();
    if (errors.length > 0) {
      console.log("❌ Login errors found:", errors);
    } else {
      console.log("❌ No specific error messages found, but still on login page");
      await this.debugPageContent();
    }
  }

  /**
   * Debug page content when no obvious errors are found
   */
  private async debugPageContent(): Promise<void> {
    console.log("🔍 Dumping page content for analysis...");
    
    const pageText = await this.page.textContent('body').catch(() => 'Could not get page content');
    console.log("📄 Page content preview:", pageText?.substring(0, 500) + "...");
    
    // Look for potential error elements
    const errorElements = await this.page.locator('*:has-text("invalid"), *:has-text("error"), *:has-text("wrong"), *:has-text("failed")').all();
    console.log(`🔍 Found ${errorElements.length} elements with potential error text`);
    
    for (let i = 0; i < Math.min(errorElements.length, 5); i++) {
      const text = await errorElements[i].textContent().catch(() => '');
      if (text?.trim()) {
        console.log(`🔍 Element ${i + 1}: "${text.trim()}"`);
      }
    }
  }

  /**
   * Complete login workflow with validation
   */

  async performLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);
    return await this.verifyLoginSuccess();
  }
}
