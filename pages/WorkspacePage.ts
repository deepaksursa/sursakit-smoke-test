import { BasePage } from "./BasePage";
import { Page, expect } from "@playwright/test";
import path from "path";

export class WorkspacePage extends BasePage {
  private addButtonSelectors = ["button:has(svg.lucide-plus)"];
  private actionsModalSelectors = [
    '[data-slot="dropdown-menu-label"]:has-text("Actions")',
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
    const emptyServiceBtn = this.page.getByRole("menuitem", {
      name: "Empty service",
    });
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

  async createEmptyService(serviceName: string) {
    await this.clickOnAdd();
    await this.isActionsModalOpen();
    await this.clickOnEmptyService();
    await this.isCreateServiceModalOpen();
    await this.fillCreateService(serviceName);
    console.log(
      `Creating service with name: ${serviceName.split(" ").join("-")}`
    );
    //verify service creation
    await expect(
      this.page.getByText(serviceName.split(" ").join("-"))
    ).toBeVisible();
    console.log(`Service "${serviceName}" created successfully.`);
  }

  async clickOnServiceTab() {
    const serivceTab = this.page.getByRole("button", {
      name: "Test-Service",
      exact: true,
    });
    await serivceTab.click();
    console.log("Clicked on service tab.");
  }

  //upload File into the service
  async uploadFile() {
    await this.clickOnServiceTab();
    const uploadButton = this.page
      .getByLabel("File explorer")
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .first();
    await uploadButton.click();
    console.log("Clicked on upload button");

    console.log("Clicked on upload folder button.");
    // Start waiting for file chooser before clicking. Note no await.
    console.log("uploading file now");
    const fileChooserPromise = this.page.waitForEvent("filechooser");

    const uploadFolderBtn = this.page.getByRole("menuitem", {
      name: "Upload Folder",
    });
    await expect(uploadFolderBtn).toBeVisible();
    await uploadFolderBtn.click();
    const fileChooser = await fileChooserPromise;
    const folderPath = path.resolve(__dirname, "../test-file/test-project");
    await fileChooser.setFiles(folderPath);
    await expect(
      this.page.getByRole("button", { name: "test-project", exact: true })
    ).toBeVisible();
  }

  async clickFileTab(fileName: string) {
    const newFileTab = this.page.getByRole("button", {
      name: fileName,
      exact: true,
    });
    await newFileTab.click();
  }

  async createNewFile(fileName: string) {
    await this.clickOnServiceTab();
    const addNewFileBtn = this.page.getByRole("button", { name: "New File" });
    await addNewFileBtn.click();
    const fileNameInput = this.page.getByRole("textbox", {
      name: "filename.ts",
    });
    console.log("Clicked on add file.");
    await fileNameInput.fill(fileName);
    await fileNameInput.press("Enter");
    const newFileTab = this.page.getByRole("button", {
      name: fileName,
      exact: true,
    });
    await expect(newFileTab).toBeVisible();
    console.log("File created");
  }

  async codeEditorCheck() {
    const editor = this.page.locator(".view-lines");
    await editor.click();
    await this.page.keyboard.type("const x = 42;");
    const closeButton = this.page.locator("button:has(svg.lucide-x)").nth(1);

    await closeButton.click();
    await expect(
      this.page.getByRole("alertdialog", { name: "Unsaved Changes" })
    ).toBeVisible();
    const saveButton = this.page.getByRole("button", {
      name: "Save",
      exact: true,
    });
    await saveButton.click();
    await this.clickFileTab("Test-file.ts");
    await expect(
      this.page
        .getByRole("code")
        .locator("div")
        .filter({ hasText: "const x = 42;" })
        .nth(3)
    ).toBeVisible();
  }
}
