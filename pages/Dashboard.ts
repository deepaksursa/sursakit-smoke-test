import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Dashboard Page Object - Post-login authenticated user interface
 *
 * Handles:
 * - Dashboard navigation
 * - Template selection and usage
 * - Organization and workspace management (if needed)
 */
export class Dashboard extends BasePage {
  // Selectors
  private templateCardSelectors = ['div[data-slot="card"]'];

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to dashboard (post-login home page)
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigate("/");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get template card locator by template name
   * @param templateName - Name of the template (e.g., "Employee Management System")
   * @returns Locator for the template card
   */
  async getTemplateCard(templateName: string): Promise<Locator> {
    // More specific selector: find card that contains the exact template name in its title
    const card = this.page
      .locator('div[data-slot="card"]')
      .filter({
        has: this.page.locator(
          `[data-slot="card-title"]:has-text("${templateName}")`
        ),
      })
      .first();

    // Wait for card to be visible to ensure it's found
    await card.waitFor({ state: "visible", timeout: 10000 });
    return card;
  }

  /**
   * Check if a template is visible on the dashboard
   * @param templateName - Name of the template to check
   * @returns true if template is visible, false otherwise
   */
  async isTemplateVisible(templateName: string): Promise<boolean> {
    try {
      // Wait for template section to be visible first
      await this.page
        .locator('div:has(h3:text("Start something new from a template"))')
        .waitFor({ state: "visible", timeout: 10000 })
        .catch(() => {}); // Continue if section not found

      const card = await this.getTemplateCard(templateName);
      await card.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click the "Use" button on a specific template card
   * This will trigger workspace creation with template services
   * @param templateName - Name of the template to use
   * @throws Error if template not found or button click fails
   */
  async clickTemplateUseButton(templateName: string): Promise<void> {
    try {
      // Step 1: Use a direct CSS selector that combines card title and button
      // This avoids the filter scoping issue by using a single query
      const useButton = this.page
        .locator(
          `div[data-slot="card"]:has([data-slot="card-title"]:has-text("${templateName}")) button[data-slot="button"]:has-text("Use")`
        )
        .first();

      // Step 2: Wait for button to be visible and clickable
      await useButton.waitFor({ state: "visible", timeout: 10000 });
      await useButton.click();

      // Step 3: Wait for template processing (workspace creation)
      await this.page.waitForLoadState("networkidle");

      // Step 4: Wait for navigation to workspace (if workspace is created)
      // Template creates workspace automatically, so URL should change to /s/[workspace-id]
      await this.page
        .waitForURL(/\/s\/[a-z0-9]+$/, { timeout: 30000 })
        .catch(() => {
          // If URL doesn't change, workspace might already exist or creation is in progress
          console.log(
            `Workspace URL pattern not detected after using template "${templateName}". ` +
              "Workspace might already exist or creation is still in progress."
          );
        });
    } catch (error) {
      throw new Error(
        `Failed to click Use button for template "${templateName}": ${error}`
      );
    }
  }
}
