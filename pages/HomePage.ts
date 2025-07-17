import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home Page Object - Handles homepage interactions
 * 
 * Encapsulates:
 * - Navigation elements
 * - Sign In button location
 * - Homepage validation
 */
export class HomePage extends BasePage {
  
  // Selector arrays for flexible element location
  private signInSelectors = [
    'text="Sign In"',
    'text="Login"', 
    'text="Sign in"',
    'text="Log in"',
    '[href*="sign-in"]',
    '[href*="login"]',
    'button:has-text("Sign In")',
    'a:has-text("Sign In")'
  ];

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to homepage
   */
  async navigateToHome(): Promise<void> {
    await this.navigate('/');
  }

  /**
   * Get Sign In button element
   */
  async getSignInButton(): Promise<Locator> {
    const element = await this.findElement(this.signInSelectors);
    if (!element) {
      await this.takeScreenshot('signin-button-not-found');
      
      // List available elements for debugging
      const links = await this.page.locator('a').allTextContents();
      const buttons = await this.page.locator('button').allTextContents();
      console.log('🔍 Available links:', links);
      console.log('🔍 Available buttons:', buttons);
      
      throw new Error('Sign In button not found. Check screenshot and available elements above.');
    }
    return element;
  }

  /**
   * Click Sign In button to navigate to login
   */
  async clickSignIn(): Promise<void> {
    const signInButton = await this.getSignInButton();
    await signInButton.click();
    console.log('✅ Clicked Sign In button');
    
    // Wait for navigation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate to login page via Sign In button
   */
  async goToLogin(): Promise<void> {
    await this.clickSignIn();
    // Use a more forgiving wait instead of networkidle for navigation
    await this.page.waitForTimeout(2000); // Give time for navigation to start
  }

  /**
   * Check if we're on the homepage
   */
  isOnHomePage(): boolean {
    const url = this.getCurrentUrl();
    return url.endsWith('/') ||
           url.includes('localhost:5173') ||
           (!this.isUrlContaining('auth') && !this.isUrlContaining('login'));
  }

  /**
   * Get all navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    return await this.page.locator('nav a, header a').allTextContents();
  }
} 