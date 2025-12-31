import { test, expect } from "@playwright/test";
import { Dashboard } from "../pages/Dashboard";
import { WorkspacePage } from "../pages/WorkspacePage";

/**
 * Template Verification Test
 *
 * This test automatically uses the "owner" project (matched by filename in playwright.config.ts)
 * The "owner" project loads auth/auth-owner.json (created by auth.setup.ts setup project)
 * User is already authenticated - no login needed!
 *
 * Execution flow:
 * 1. Setup project runs first (auth.setup.ts) - authenticates and saves auth state
 * 2. Owner project runs (depends on setup) - loads saved auth state
 * 3. Test executes - already authenticated
 *
 * Run: playwright test 04_template-verification
 */

test.describe("Template Verification", () => {
  test(
    "TC_004: Employee Management Template Verification",
    {
      tag: ["@owner", "@smoke"],
    },
    async ({ page }) => {
      const dashboard = new Dashboard(page);
      const workspacePage = new WorkspacePage(page);

      // Step 1: Navigate to dashboard (already logged in via saved auth state)
      await test.step("Navigate to Dashboard", async () => {
        await dashboard.navigateToDashboard();
        // Verify we're on dashboard (not login page)
        const currentUrl = page.url();
        expect(currentUrl).not.toContain("sign-in");
        expect(currentUrl).not.toContain("login");
      });

      // Step 2: Verify template is visible
      await test.step("Verify Template is Visible", async () => {
        const isVisible = await dashboard.isTemplateVisible(
          "Employee Management System"
        );
        expect(isVisible).toBe(true);
      });

      // Step 3: Click "Use" button on template
      await test.step("Click Template Use Button", async () => {
        await dashboard.clickTemplateUseButton("Employee Management System");
      });

      // Step 4: Verify workspace is created (navigation happens)
      await test.step("Verify Workspace Created", async () => {
        // Note: clickTemplateUseButton() already waits for URL change,
        // but we verify here to ensure workspace creation succeeded

        // Wait for URL to change to workspace pattern (explicit wait for condition)
        await page.waitForURL(/\/s\/[a-z0-9]+$/, { timeout: 30000 });

        // Verify we're on workspace page using page object method
        const isOnWorkspace = await workspacePage.isOnWorkspacePage();
        expect(isOnWorkspace).toBe(true);

        // Additional verification: Check URL pattern matches
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/s\/[a-z0-9]+$/);
      });

      // Step 5: Verify all 3 services are created
      await test.step("Verify Services Created", async () => {
        const expectedServices = [
          "employee-info-app",
          "employee-info-api",
          "production-db",
        ];
        const allServicesExist =
          await workspacePage.verifyServicesExist(expectedServices);
        expect(allServicesExist).toBe(true);
      });

      // Step 6: Verify Run button is visible
      await test.step("Verify Run Button is Visible", async () => {
        const isRunButtonVisible = await workspacePage.verifyRunButton();
        expect(isRunButtonVisible).toBe(true);
      });
    }
  );
});
