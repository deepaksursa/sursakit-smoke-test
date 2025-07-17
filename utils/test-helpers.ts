/**
 * 🔧 Test Helper Utilities
 * 
 * Common functions that junior developers can use across tests
 * These helpers simplify repetitive tasks and ensure consistency
 */

import { Page, expect } from '@playwright/test';

/**
 * 📧 Email Helpers
 */
export class EmailHelpers {
  /**
   * Generate unique test email
   */
  static generateTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}+${timestamp}@example.com`;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * 🕐 Wait Helpers
 */
export class WaitHelpers {
  /**
   * Wait for specific time with logging
   */
  static async waitWithLog(milliseconds: number, reason: string): Promise<void> {
    console.log(`⏳ Waiting ${milliseconds}ms: ${reason}`);
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Wait for element to disappear
   */
  static async waitForElementToDisappear(page: Page, selector: string, timeout: number = 10000): Promise<void> {
    console.log(`⏳ Waiting for element to disappear: ${selector}`);
    await page.locator(selector).waitFor({ state: 'hidden', timeout });
    console.log(`✅ Element disappeared: ${selector}`);
  }

  /**
   * Wait for URL to contain text
   */
  static async waitForUrl(page: Page, urlText: string, timeout: number = 10000): Promise<void> {
    console.log(`⏳ Waiting for URL to contain: ${urlText}`);
    
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (page.url().includes(urlText)) {
        console.log(`✅ URL contains: ${urlText}`);
        return;
      }
      await page.waitForTimeout(500);
    }
    
    throw new Error(`Timeout waiting for URL to contain: ${urlText}`);
  }
}

/**
 * 📝 Form Helpers
 */
export class FormHelpers {
  /**
   * Fill form fields from object
   */
  static async fillFormFields(page: Page, fields: Record<string, string>): Promise<void> {
    console.log('📝 Filling form fields...');
    
    for (const [fieldName, value] of Object.entries(fields)) {
      const selectors = [
        `input[name="${fieldName}"]`,
        `input[id="${fieldName}"]`,
        `input[data-testid="${fieldName}"]`,
        `textarea[name="${fieldName}"]`,
        `select[name="${fieldName}"]`
      ];
      
      let filled = false;
      for (const selector of selectors) {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          await element.fill(value);
          console.log(`✅ Filled ${fieldName}: ${value}`);
          filled = true;
          break;
        }
      }
      
      if (!filled) {
        console.log(`⚠️ Could not find field: ${fieldName}`);
      }
    }
  }

  /**
   * Select dropdown option
   */
  static async selectDropdownOption(page: Page, dropdownSelector: string, optionText: string): Promise<void> {
    console.log(`📝 Selecting dropdown option: ${optionText}`);
    await page.locator(dropdownSelector).selectOption({ label: optionText });
    console.log(`✅ Selected: ${optionText}`);
  }
}

/**
 * ✅ Assertion Helpers
 */
export class AssertionHelpers {
  /**
   * Verify element is visible with custom message
   */
  static async assertElementVisible(page: Page, selector: string, elementName: string): Promise<void> {
    console.log(`✅ Verifying ${elementName} is visible`);
    const element = page.locator(selector);
    await expect(element).toBeVisible();
    console.log(`✅ Confirmed ${elementName} is visible`);
  }

  /**
   * Verify text content
   */
  static async assertTextContent(page: Page, selector: string, expectedText: string, elementName: string): Promise<void> {
    console.log(`✅ Verifying ${elementName} contains: ${expectedText}`);
    const element = page.locator(selector);
    await expect(element).toContainText(expectedText);
    console.log(`✅ Confirmed ${elementName} contains expected text`);
  }

  /**
   * Verify URL contains text
   */
  static async assertUrlContains(page: Page, urlText: string): Promise<void> {
    console.log(`✅ Verifying URL contains: ${urlText}`);
    await expect(page).toHaveURL(new RegExp(urlText));
    console.log(`✅ Confirmed URL contains: ${urlText}`);
  }

  /**
   * Verify page title
   */
  static async assertPageTitle(page: Page, expectedTitle: string): Promise<void> {
    console.log(`✅ Verifying page title: ${expectedTitle}`);
    await expect(page).toHaveTitle(expectedTitle);
    console.log(`✅ Confirmed page title: ${expectedTitle}`);
  }
}

/**
 * 📊 Data Helpers
 */
export class DataHelpers {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate test user data
   */
  static generateTestUser(): {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  } {
    const id = this.generateRandomString(6);
    return {
      firstName: `TestFirst${id}`,
      lastName: `TestLast${id}`,
      email: EmailHelpers.generateTestEmail(`user${id}`),
      username: `testuser${id}`,
      password: `Password123!${id}`
    };
  }

  /**
   * Format date for inputs
   */
  static formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

/**
 * 🐛 Debug Helpers
 */
export class DebugHelpers {
  /**
   * Log page elements for debugging
   */
  static async logPageElements(page: Page, elementType: string = 'button'): Promise<void> {
    console.log(`🔍 Available ${elementType}s on page:`);
    const elements = await page.locator(elementType).allTextContents();
    elements.forEach((text, index) => {
      console.log(`   ${index + 1}. "${text}"`);
    });
  }

  /**
   * Log current page info
   */
  static async logPageInfo(page: Page): Promise<void> {
    const url = page.url();
    const title = await page.title();
    console.log('📊 Page Info:');
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);
  }

  /**
   * Take debug screenshot with timestamp
   */
  static async takeDebugScreenshot(page: Page, description: string): Promise<void> {
    const timestamp = Date.now();
    const filename = `debug-${description}-${timestamp}.png`;
    await page.screenshot({ 
      path: `test-results/${filename}`, 
      fullPage: true 
    });
    console.log(`📸 Debug screenshot: ${filename}`);
  }
} 