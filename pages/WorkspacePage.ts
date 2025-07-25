import { BasePage } from "./BasePage";
import { Page, expect } from "@playwright/test";
import path from "path";

export class WorkspacePage extends BasePage {
  private addButtonSelectors = ["button:has(svg.lucide-plus)"];

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

  async clickOnEmptyService() {
    const emptyServiceBtn = this.page.getByRole("menuitem", {
      name: "Empty service",
    });
    await expect(emptyServiceBtn).toBeVisible();
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
    await this.clickOnEmptyService();
    await this.isCreateServiceModalOpen();
    await this.fillCreateService(serviceName);
    console.log(
      `Creating service with name: ${serviceName.split(" ").join("-")}`
    );
    //verify service creation
    await expect(
      this.page.getByRole("button", {
        name: `${serviceName.split(" ").join("-")}`,
        exact: true,
      })
    ).toBeVisible();
    console.log(`Service "${serviceName}" created successfully.`);
  }

  async clickOnServiceTab(serviceName: string) {
    const serivceTab = this.page.getByRole("button", {
      name: `${serviceName.split(" ").join("-")}`,
      exact: true,
    });
    await serivceTab.click();
    console.log("Clicked on service tab.");
  }

  //upload File into the service
  async uploadFile(serviceName: string) {
    await this.clickOnServiceTab(serviceName);
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
    ).toBeVisible({ timeout: 20000 });
  }

  async clickFileTab(fileName: string) {
    const newFileTab = this.page.getByRole("button", {
      name: fileName,
      exact: true,
    });
    await newFileTab.click();
  }

  async createNewFile(fileName: string, serviceName: string) {
    await this.clickOnServiceTab(serviceName);
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

  async writeOnEditor(fileName: string) {
    const editor = this.page.locator(".view-lines");
    await editor.click();
    await this.page.keyboard.type("console.log('Hello World')");
  }

  async closeFileAndSave(fileName: string) {
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
    await this.clickFileTab(fileName);
    await expect(
      this.page
        .getByRole("code")
        .locator("div")
        .filter({ hasText: "console.log('Hello World')" })
        .nth(3)
    ).toBeVisible();
  }

  async refreshFiles() {
    const refresFilesBtn = this.page
      .getByLabel("File explorer")
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .nth(1);
    await refresFilesBtn.click();
  }

  async addTerminal(serviceName: string) {
    const addTerminalButton = this.page.getByRole("button", {
      name: `Add ${serviceName.split(" ").join("-")} terminal`,
    });
    await addTerminalButton.click();
    expect(
      this.page
        .getByRole("tab", {
          name:
            serviceName.length > 10
              ? `${serviceName
                  .split(" ")
                  .join("-")
                  .substring(0, 10)}... terminal`
              : serviceName,
        })
        .first()
    ).toBeVisible();
  }

  async closeTerminal(serviceName: string) {
    const closeTerminalButton = this.page.getByRole("button", {
      name:
        serviceName.length > 10
          ? `${serviceName.split(" ").join("-").substring(0, 10)}... terminal`
          : serviceName,
    });
    await closeTerminalButton.click();
    await expect(closeTerminalButton).toBeHidden();
  }

  async testTerminal() {
    const terminalInput = this.page.getByRole("textbox", {
      name: "Terminal input",
    });
    await expect(terminalInput).toBeVisible();
    await terminalInput.click();
    await this.page.keyboard.type("mkdir NewFolder");
    await this.page.keyboard.press("Enter");
    await this.refreshFiles();
    await expect(
      this.page.getByRole("button", { name: "NewFolder", exact: true })
    ).toBeVisible();
  }
}
