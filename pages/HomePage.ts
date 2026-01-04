import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  private signInSelectors = [
    'a[href="/auth/sign-in"]',
    'a[href*="sign-in"][data-slot="button"]',
    'a[data-slot="button"]:has-text("Sign In")',
    'text="Sign In"',
    'text="Login"',
    'text="Sign in"',
    'text="Log in"',
    '[href*="sign-in"]',
    '[href*="login"]',
    'button:has-text("Sign In")',
    'a:has-text("Sign In")',
  ];

  private orgNameInputSelectors = [
    'form input:near(:text("Organization Name"))',
    'form input[name="name"]',
  ];

  private orgDropDownTriggerSelectors = [
    'button[data-slot="dropdown-menu-trigger"]',
  ];

  private createButtonSelectors = ['button[type="submit"]:has-text("Create")'];

  private createWorkspaceButtonSelectors = [
    'button:has-text("Create empty workspace")',
  ];
  private createWorkspaceInputSelectors = [
    'div[role="dialog"] input[placeholder="workspace name"]',
  ];

  constructor(page: Page) {
    super(page);
  }

  async navigateToHome(): Promise<void> {
    await this.navigate("/");
  }

  /**
   * Navigate to home with Cloudflare handling (use only if needed)
   */
  async navigateToHomeWithCloudflare(): Promise<void> {
    await this.navigateWithCloudflareHandling("/");
  }

  async getSignInButton(): Promise<Locator | null> {
    try {
      const element = await this.findElement(this.signInSelectors);
      return element;
    } catch {
      // Sign In button not found - user might already be logged in
      return null;
    }
  }

  async clickSignIn(): Promise<void> {
    const signInButton = await this.getSignInButton();
    if (signInButton) {
      await signInButton.click();
      await this.page.waitForTimeout(2000);
    } else {
      // If Sign In button not found, try navigating directly to login page
      await this.navigate("auth/sign-in");
    }
  }

  async goToLogin(): Promise<void> {
    await this.clickSignIn();
    await this.page.waitForTimeout(2000);
  }

  isOnHomePage(): boolean {
    const url = this.getCurrentUrl();
    return (
      url.endsWith("/") ||
      url.includes("uat.sursakit.com/") ||
      (!this.isUrlContaining("auth") && !this.isUrlContaining("login"))
    );
  }

  async getNavigationLinks(): Promise<string[]> {
    return await this.page.locator("nav a, header a").allTextContents();
  }

  async clickCreateOrgBtn() {
    const createOrgBtn = this.page.getByRole("menuitem", {
      name: "Create new organization",
    });
    await createOrgBtn.click();
  }

  async isCreateOrgModalVisible(): Promise<boolean> {
    const modal = await this.waitForElement(this.orgNameInputSelectors);
    return modal !== null;
  }

  async fillOrgName(orgName: string): Promise<void> {
    const input = await this.findElement(this.orgNameInputSelectors);
    await input.fill(orgName);
  }

  async clickCreate(): Promise<void> {
    const button = await this.findElement(this.createButtonSelectors);
    await button.click();
  }

  async verifyOrganizationCreation(name: string): Promise<void> {
    const trigger = await this.findElement(this.orgDropDownTriggerSelectors);
    await trigger.click();
    const orgItem = this.page.locator('[role="menuitem"]', {
      hasText: name,
    });
    // Wait for organization to be visible
    await orgItem.waitFor({ state: "visible", timeout: 10000 });
    //Choose the created organization
    await orgItem.click();
  }

  async createNewOrganization(organizationName: string) {
    await this.clickCreateOrgBtn();
    await this.isCreateOrgModalVisible();
    await this.fillOrgName(organizationName);
    await this.clickCreate();
    await this.verifyOrganizationCreation(organizationName);
  }

  //delete Organization
  async deleteOrganization(organizationName: string) {
    await this.navigateToHome();
    const orgButton = this.page.getByRole("button", {
      name: organizationName,
    });
    await orgButton.click();
    const orgSettingsButton = this.page.getByRole("button");
    await orgSettingsButton.click();
    const dangerTab = this.page.getByRole("button", { name: "Danger" });
    await dangerTab.click();
    const deleteOrganizationButton = this.page.getByRole("button", {
      name: "Delete Organization",
    });
    await deleteOrganizationButton.click();
    const confirmDeleteButton = this.page.getByRole("button", {
      name: "Confirm Delete",
    });
    await confirmDeleteButton.click();
    // Wait for deletion to complete
    await this.page
      .getByRole("button", { name: "ai-power" })
      .waitFor({ state: "visible", timeout: 10000 });
  }

  //Workspace Creation

  async clickCreateWorkspace() {
    const button = await this.findElement(this.createWorkspaceButtonSelectors);
    await button.click();
  }

  async isCreateWorkSpaceModalVisible(): Promise<boolean> {
    const modal = await this.waitForElement(this.createWorkspaceInputSelectors);
    return modal !== null;
  }

  async fillWorkSpaceName(workspaceName: string) {
    const input = await this.findElement(this.createWorkspaceInputSelectors);
    await input.fill(workspaceName);
  }

  async createNewWorkspace(workspaceName: string) {
    await this.clickCreateWorkspace();
    await this.isCreateWorkSpaceModalVisible();
    await this.fillWorkSpaceName(workspaceName);
    await this.clickCreate();
    //check if user navigates inside the workspace to confirm workspace creation
    await this.page.waitForURL(/\/s\/[a-z0-9]+$/, { timeout: 10000 });
  }
}
