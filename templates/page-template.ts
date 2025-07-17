import { Page, Locator } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

/**
 * 📋 PAGE OBJECT TEMPLATE - Copy this file to create new page objects
 * 
 * Instructions for Junior Developers:
 * 1. Copy this file to pages/YourPageNamePage.ts (e.g., DashboardPage.ts, ProfilePage.ts)
 * 2. Replace "TemplatePage" with your actual page name throughout this file
 * 3. Update the selectors arrays with your page's actual element selectors
 * 4. Implement the methods for your page's functionality
 * 5. Add JSDoc comments for all public methods
 * 
 * FIND & REPLACE: Replace "TemplatePage" with your page name (e.g., "Dashboard", "Profile")
 */

/**
 * Template Page Object - REPLACE "TemplatePage" with your page name
 * 
 * Encapsulates:
 * - List the main functionality this page handles
 * - Key user actions available
 * - Important validations
 */
export class TemplatePage extends BasePage {
  
  // 🎯 SELECTORS - Replace these with your page's actual element selectors
  // Use multiple selectors for flexibility (framework handles fallbacks automatically)
  
  private primaryButtonSelectors = [
    'button[data-testid="primary-action"]',    // Replace with your button's data-testid
    'button.primary',                          // Replace with your button's CSS class
    'button:has-text("Primary Action")',       // Replace with your button's text
    '#primary-button'                          // Replace with your button's ID
  ];

  private inputFieldSelectors = [
    'input[name="field-name"]',                // Replace "field-name" with actual field name
    'input[placeholder*="field" i]',           // Replace "field" with actual placeholder text
    '#field-input',                            // Replace with actual input ID
    '[data-testid="field-input"]'              // Replace with actual data-testid
  ];

  private formSelectors = [
    'form[data-testid="main-form"]',           // Replace with your form's data-testid
    'form.main-form',                          // Replace with your form's CSS class
    'form'                                     // Generic form selector
  ];

  // Add more selector arrays as needed for your page

  constructor(page: Page) {
    super(page);
  }

  // 🧭 NAVIGATION METHODS

  /**
   * Navigate to this page
   * REPLACE '/your-page-path' with your actual page path
   */
  async navigateToTemplatePage(): Promise<void> {
    // TODO: Replace '/your-page-path' with actual path (e.g., '/dashboard', '/profile')
    await this.navigate('/your-page-path');
  }

  // 🔍 ELEMENT GETTER METHODS

  /**
   * Get primary button element
   * This method finds the button using multiple selectors for reliability
   */
  async getPrimaryButton(): Promise<Locator> {
    const element = await this.findElement(this.primaryButtonSelectors);
    if (!element) {
      await this.takeScreenshot('primary-button-not-found');
      throw new Error('Primary button not found. Check screenshot.');
    }
    return element;
  }

  /**
   * Get input field element
   * This method finds the input using multiple selectors for reliability
   */
  async getInputField(): Promise<Locator> {
    const element = await this.findElement(this.inputFieldSelectors);
    if (!element) {
      await this.takeScreenshot('input-field-not-found');
      throw new Error('Input field not found. Check screenshot.');
    }
    return element;
  }

  // 🎬 ACTION METHODS

  /**
   * Click primary button
   */
  async clickPrimaryButton(): Promise<void> {
    const button = await this.getPrimaryButton();
    await button.click();
    console.log('✅ Primary button clicked');
  }

  /**
   * Fill input field
   */
  async fillInputField(value: string): Promise<void> {
    const input = await this.getInputField();
    await input.fill(value);
    console.log(`✅ Input field filled with: ${value}`);
  }

  /**
   * Submit form (example composite action)
   */
  async submitForm(inputValue: string): Promise<void> {
    console.log(`📝 Submitting form with value: ${inputValue}`);
    
    await this.fillInputField(inputValue);
    await this.takeScreenshot('form-filled');
    await this.clickPrimaryButton();
    await this.waitForNavigation();
    
    console.log('✅ Form submitted successfully');
  }

  // ✅ VALIDATION METHODS

  /**
   * Check if we're on this page
   * REPLACE 'your-page-identifier' with actual URL pattern that identifies your page
   */
  isOnTemplatePage(): boolean {
    // TODO: Replace 'your-page-identifier' with actual URL pattern (e.g., 'dashboard', 'profile')
    return this.isUrlContaining('your-page-identifier');
  }

  /**
   * Verify page loaded correctly
   */
  async verifyPageLoaded(): Promise<boolean> {
    try {
      const button = await this.findElement(this.primaryButtonSelectors);
      const input = await this.findElement(this.inputFieldSelectors);
      
      return button !== null && input !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get error messages on this page
   */
  async getErrorMessages(): Promise<string[]> {
    const errorSelectors = [
      '[class*="error"]',
      '[class*="invalid"]',
      'text="Error"',
      '[data-testid*="error"]'
    ];
    
    const errors: string[] = [];
    
    for (const selector of errorSelectors) {
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

  // 🎯 HIGH-LEVEL WORKFLOWS (combine multiple actions)

  /**
   * Complete main workflow for this page
   * Example: Fill form and navigate to next step
   * REPLACE "TemplatePage" with your actual page name in the method name and logs
   */
  async completeTemplatePageWorkflow(data: any): Promise<boolean> {
    console.log(`🎯 Starting TemplatePage workflow`);
    
    try {
      // TODO: Add your workflow steps here
      await this.fillInputField(data.inputValue);
      await this.clickPrimaryButton();
      
      // Verify success (customize this logic for your page)
      const success = !this.isOnTemplatePage(); // Assume success means navigation away from this page
      console.log(`🎯 Workflow result: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      return success;
    } catch (error) {
      console.log(`❌ Workflow failed: ${(error as Error).message}`);
      await this.takeScreenshot('workflow-failed');
      return false;
    }
  }

}

/*
📋 JUNIOR DEVELOPER CHECKLIST - Complete these steps after copying this template:

□ 1. Rename file: TemplatePage.ts → YourPageNamePage.ts
□ 2. Find & Replace: "TemplatePage" → "YourPageName" (throughout file)
□ 3. Update selector arrays with your page's actual selectors
□ 4. Replace '/your-page-path' with your page's actual URL path
□ 5. Replace 'your-page-identifier' with your page's URL identifier
□ 6. Add any additional methods your page needs
□ 7. Update JSDoc comments to describe your page's functionality
□ 8. Test your page object by importing it in a test file

💡 TIP: Start with just the selectors you need, then add more methods as your tests require them.
*/ 