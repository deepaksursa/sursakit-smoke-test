import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  private signInSelectors = [
    'text="Sign In"',
    'text="Login"',
    'text="Sign in"',
    'text="Log in"',
    '[href*="sign-in"]',
    '[href*="login"]',
    'button:has-text("Sign In")',
    'a:has-text("Sign In")',
  ];

  //Organization Selectors

  private orgNameInputSelectors = [
    'form input:near(:text("Organization Name"))',
    'form input[name="name"]',
  ];

  private orgDropDownTriggerSelectors = [
    'button[data-slot="dropdown-menu-trigger"]',
  ];

  private createButtonSelectors = ['button[type="submit"]:has-text("Create")'];

  //Workspace Selectors

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

  async getSignInButton(): Promise<Locator> {
    const element = await this.findElement(this.signInSelectors);
    return element;
  }

  async clickSignIn(): Promise<void> {
    const signInButton = await this.getSignInButton();
    await signInButton.click();
    console.log("✅ Clicked Sign In button");
    await this.page.waitForTimeout(2000);
  }

  async goToLogin(): Promise<void> {
    await this.clickSignIn();
    await this.page.waitForTimeout(2000);
  }

  isOnHomePage(): boolean {
    const url = this.getCurrentUrl();
    return (
      url.endsWith("/") ||
      url.includes("localhost:5173") ||
      (!this.isUrlContaining("auth") && !this.isUrlContaining("login"))
    );
  }

  async getNavigationLinks(): Promise<string[]> {
    return await this.page.locator("nav a, header a").allTextContents();
  }

  // Organization Creation

  async clickCreateOrgBtn() {
    const createOrgBtn = this.page.getByRole("menuitem", {
      name: "Create new organization",
    });
    await createOrgBtn.click();
    console.log("Create organization button clicked");
  }

  async isCreateOrgModalVisible() {
    const modal = await this.waitForElement(this.orgNameInputSelectors);
    expect(modal).toBeTruthy();
  }

  async fillOrgName(orgName: string): Promise<void> {
    const input = await this.findElement(this.orgNameInputSelectors);
    await input.fill(orgName);
    console.log(`Organization name entered: ${orgName}`);
  }

  async clickCreate(): Promise<void> {
    const button = await this.findElement(this.createButtonSelectors);
    await button.click();
  }

  async verifyOrganizationCreation(name: string) {
    const trigger = await this.findElement(this.orgDropDownTriggerSelectors);
    await trigger.click();
    const orgItem = this.page.locator('[role="menuitem"]', {
      hasText: name,
    });
    await expect(orgItem).toBeVisible();
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
  async deleteOrganization() {
    await this.navigateToHome();
    const orgButton = this.page.getByRole("button", {
      name: "Test Organization",
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
    await expect(
      this.page.getByRole("button", { name: "ai-power" })
    ).toBeVisible();
  }

  //Workspace Creation

  async clickCreateWorkspace() {
    const button = await this.findElement(this.createWorkspaceButtonSelectors);
    await button.click();
    console.log("Clicked create workspace");
  }

  async isCreateWorkSpaceModalVisible() {
    const modal = await this.waitForElement(this.createWorkspaceInputSelectors);
    expect(modal).toBeTruthy();
  }

  async fillWorkSpaceName(workspaceName: string) {
    const input = await this.findElement(this.createWorkspaceInputSelectors);
    await input.fill(workspaceName);
    console.log(`Workspace name entered: ${workspaceName}`);
  }

  async createNewWorkspace(workspaceName: string) {
    await this.clickCreateWorkspace();
    await this.isCreateWorkSpaceModalVisible();
    await this.fillWorkSpaceName(workspaceName);
    await this.clickCreate();
    //check if user navigates inside the workspace to confirm workspace creation
    await expect(this.page).toHaveURL(/\/s\/[a-z0-9]+$/);
    console.log("Workspace created");
  }
}
