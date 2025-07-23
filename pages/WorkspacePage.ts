import { BasePage } from "./BasePage";
import { Page, expect } from "@playwright/test";

export class WorkspacePage extends BasePage {
  private addButtonSelectors = ["button:has(svg.lucide-plus)"];
  private actionsModalSelectors = [
    '[data-slot="dropdown-menu-label"]:has-text("Actions")',
  ];
  private emptyServiceButtonSelectors = [
    '[role="menuitem"]:has-text("Empty service")',
    '[data-slot="dropdown-menu-item"]:has-text("Empty service")',
  ];
  private createServiceModalSelectors = [
    '[role="dialog"]:has(h2:text("Create New Service"))',
    '[data-slot="dialog-title"]:has-text("Create New Service")',
  ];
  private serviceNameInputSelectors = [
    'input[placeholder="service name"]',
    'input[name="name"]',
    '[data-slot="form-control"][placeholder="service name"]',
  ];
  private createServiceButtonSelectors = [
    'button[type="submit"]:has-text("Create")',
    'button.bg-primary:has-text("Create")',
  ];

  constructor(page: Page) {
    super(page);
  }

  async isOnWorkspacePage() {
    await expect(this.page).toHaveURL(/\/s\/[a-z0-9]+$/);
  }

  async clickOnAdd() {
    const addBtn = await this.findElement(this.addButtonSelectors);
    await addBtn.click();
    console.log("Clicked on add.");
  }

  async isActionsModalOpen() {
    await this.waitForElement(this.actionsModalSelectors);
  }

  async clickOnEmptyService() {
    const emptyServiceBtn = await this.findElement(
      this.emptyServiceButtonSelectors
    );
    await emptyServiceBtn.click();
    console.log("Clicked on empty service");
  }

  async isCreateServiceModalOpen() {
    await this.waitForElement(this.createServiceModalSelectors);
  }

  async fillCreateService(serviceName: string) {
    const serviceInput = await this.findElement(this.serviceNameInputSelectors);
    await serviceInput.fill(serviceName);
    const createButton = await this.findElement(
      this.createServiceButtonSelectors
    );
    await createButton.click();
    console.log("Service created.");
  }

  async createService(serviceName: string) {
    await this.clickOnAdd();
    await this.isActionsModalOpen();
    await this.clickOnEmptyService();
    await this.isCreateServiceModalOpen();
    await this.fillCreateService(serviceName);
  }
}
