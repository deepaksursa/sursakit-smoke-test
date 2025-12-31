import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";
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

  async isOnWorkspacePage(): Promise<boolean> {
    await this.page.waitForURL(/\/s\/[a-z0-9]+$/, { timeout: 10000 });
    return this.page.url().match(/\/s\/[a-z0-9]+$/) !== null;
  }

  async clickOnAdd() {
    const addBtn = await this.findElement(this.addButtonSelectors);
    await addBtn.click();
    console.log("Clicked on add.");
  }

  async clickOnEmptyService(): Promise<void> {
    const emptyServiceBtn = this.page.getByRole("menuitem", {
      name: "Empty service",
    });
    await emptyServiceBtn.waitFor({ state: "visible", timeout: 10000 });
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
    await this.page
      .getByRole("button", {
        name: `${serviceName.split(" ").join("-")}`,
        exact: true,
      })
      .waitFor({ state: "visible", timeout: 10000 });
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
    await uploadFolderBtn.waitFor({ state: "visible", timeout: 10000 });
    await uploadFolderBtn.click();
    const fileChooser = await fileChooserPromise;
    const folderPath = path.resolve(__dirname, "../test-file/test-project");
    await fileChooser.setFiles(folderPath);
    await this.page
      .getByRole("button", { name: "test-project", exact: true })
      .waitFor({ state: "visible", timeout: 20000 });
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
    await newFileTab.waitFor({ state: "visible", timeout: 10000 });
    console.log("File created");
  }

  async writeOnEditor(fileName: string) {
    const editor = this.page.locator(".view-lines");
    await editor.click();
    await this.page.keyboard.type(
      `console.log("${fileName ? fileName : "Hello World"}")`
    );
  }

  async closeFileAndSave(fileName: string): Promise<void> {
    const closeButton = this.page.locator("button:has(svg.lucide-x)").nth(1);
    await closeButton.click();
    await this.page
      .getByRole("alertdialog", { name: "Unsaved Changes" })
      .waitFor({ state: "visible", timeout: 10000 });
    const saveButton = this.page.getByRole("button", {
      name: "Save",
      exact: true,
    });
    await saveButton.click();
    await this.clickFileTab(fileName);
    await this.page
      .getByRole("code")
      .locator("div")
      .filter({ hasText: "console.log('Hello World')" })
      .nth(3)
      .waitFor({ state: "visible", timeout: 10000 });
  }

  async refreshFiles() {
    const refresFilesBtn = this.page
      .getByLabel("File explorer")
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .nth(1);
    await refresFilesBtn.click();
  }

  async addTerminal(serviceName: string): Promise<void> {
    const addTerminalButton = this.page.getByRole("button", {
      name: `Add ${serviceName.split(" ").join("-")} terminal`,
    });
    await addTerminalButton.click();
    await this.page
      .getByRole("tab", {
        name:
          serviceName.length > 10
            ? `${serviceName.split(" ").join("-").substring(0, 10)}... terminal`
            : serviceName,
      })
      .first()
      .waitFor({ state: "visible", timeout: 10000 });
  }

  async closeTerminal(serviceName: string): Promise<void> {
    const closeTerminalButton = this.page.getByRole("button", {
      name:
        serviceName.length > 10
          ? `${serviceName.split(" ").join("-").substring(0, 10)}... terminal`
          : serviceName,
    });
    await closeTerminalButton.click();
    await closeTerminalButton.waitFor({ state: "hidden", timeout: 10000 });
  }

  async testTerminal(): Promise<void> {
    const terminalInput = this.page.getByRole("textbox", {
      name: "Terminal input",
    });
    await terminalInput.waitFor({ state: "visible", timeout: 10000 });
    await terminalInput.click();
    await this.page.keyboard.type("mkdir NewFolder");
    await this.page.keyboard.press("Enter");
    await this.refreshFiles();
    await this.page
      .getByRole("button", { name: "NewFolder", exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Verify that specific services exist on the workspace page
   * Used to verify services created by template
   * Stops at first failure (fail-fast approach) since test will fail anyway
   * @param serviceNames - Array of service names to verify (e.g., ["frontend", "backend", "database"])
   * @returns true if all services are visible, false if any service is missing
   */
  async verifyServicesExist(serviceNames: string[]): Promise<boolean> {
    for (const serviceName of serviceNames) {
      try {
        // Service names might be formatted (e.g., "frontend" -> "frontend")
        const serviceButton = this.page.getByRole("button", {
          name: serviceName,
          exact: true,
        });
        await serviceButton.waitFor({ state: "visible", timeout: 10000 });
        const isVisible = await serviceButton.isVisible();
        if (!isVisible) {
          console.log(`⚠️ Service "${serviceName}" is not visible`);
          return false; // Fail fast - stop checking if one service is missing
        }
      } catch (error) {
        console.log(`⚠️ Service "${serviceName}" not found: ${error}`);
        return false; // Fail fast - stop checking if one service fails
      }
    }

    return true; // All services exist
  }

  /**
   * Check if the Run button is visible on the workspace page
   * @returns true if Run button is visible, false otherwise
   */
  async verifyRunButton(): Promise<boolean> {
    try {
      const runButton = this.page.getByRole("button", { name: "Run" });
      await runButton.waitFor({ state: "visible", timeout: 10000 });
      return true; // If waitFor succeeds, button is visible
    } catch {
      return false; // Timeout or element not found
    }
  }
}
