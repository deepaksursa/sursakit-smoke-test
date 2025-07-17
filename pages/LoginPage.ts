import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

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
    '#email',
    '[data-testid="email"]'
  ];

  private passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]', 
    'input[id*="password" i]',
    '#password',
    '[data-testid="password"]'
  ];

  private submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'button:has-text("Log In")',
    '[data-testid="login"]',
    '[data-testid="submit"]',
    'form button'
  ];

  private errorSelectors = [
    '[class*="error"]',
    '[class*="invalid"]', 
    '[class*="warning"]',
    'text="Invalid"',
    'text="Error"',
    'text="Wrong"',
    'text="Incorrect"',
    'text="unavailable"',
    'text="service"'
  ];

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigate('/auth/sign-in');
  }

  /**
   * Get email input element
   */
  async getEmailInput(): Promise<Locator> {
    const element = await this.findElement(this.emailSelectors);
    if (!element) {
      await this.takeScreenshot('email-input-not-found');
      throw new Error('Email input not found. Check screenshot.');
    }
    return element;
  }

  /**
   * Get password input element  
   */
  async getPasswordInput(): Promise<Locator> {
    const element = await this.findElement(this.passwordSelectors);
    if (!element) {
      await this.takeScreenshot('password-input-not-found');
      throw new Error('Password input not found. Check screenshot.');
    }
    return element;
  }

  /**
   * Get submit button element
   */
  async getSubmitButton(): Promise<Locator> {
    const element = await this.findElement(this.submitSelectors);
    if (!element) {
      await this.takeScreenshot('submit-button-not-found');
      throw new Error('Submit button not found. Check screenshot.');
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
    console.log('✅ Password entered');
  }

  /**
   * Click submit/login button
   */
  async clickSubmit(): Promise<void> {
    const submitButton = await this.getSubmitButton();
    await submitButton.click();
    console.log('✅ Submit button clicked');
  }

  /**
   * Main login action - combines all steps
   */
  async login(email: string, password: string): Promise<void> {
    console.log(`📝 Logging in with: ${email}`);
    
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.takeScreenshot('form-filled');
    await this.clickSubmit();
    
    // Wait for response
    await this.page.waitForTimeout(3000);
  }

  /**
   * Check if we're still on login page
   */
  isOnLoginPage(): boolean {
    return this.isUrlContaining('sign-in') || 
           this.isUrlContaining('login') || 
           this.isUrlContaining('auth');
  }

  /**
   * Check for error messages on page
   */
  async getErrorMessages(): Promise<string[]> {
    const errors: string[] = [];
    
    for (const selector of this.errorSelectors) {
      const errorElement = this.page.locator(selector);
      if (await errorElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await errorElement.textContent();
        if (errorText) {
          errors.push(errorText);
        }
      }
    }
    
    return errors;
  }

  /**
   * Verify login success
   */
  async verifyLoginSuccess(): Promise<boolean> {
    await this.waitForNavigation();
    
    // If still on login page, login failed
    if (this.isOnLoginPage()) {
      const errors = await this.getErrorMessages();
      if (errors.length > 0) {
        console.log('❌ Login errors found:', errors);
      }
      return false;
    }
    
    console.log('✅ Login successful - redirected away from login page');
    return true;
  }

  /**
   * Complete login workflow with validation
   */
  async performLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);
    return await this.verifyLoginSuccess();
  }
} 