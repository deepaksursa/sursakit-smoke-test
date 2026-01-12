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
    // Check if current URL matches workspace pattern without waiting
    // This is a simple check, not a wait operation
    const currentUrl = this.page.url();
    return /\/s\/[a-z0-9]+$/.test(currentUrl);
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
    // Find the terminal tab by its name
    const terminalTabName =
      serviceName.length > 10
        ? `${serviceName.split(" ").join("-").substring(0, 10)}... terminal`
        : `${serviceName.split(" ").join("-")} terminal`;

    // First, find the terminal tab
    const terminalTab = this.page.getByRole("tab", {
      name: terminalTabName,
    });

    // Wait for the tab to be visible
    await terminalTab.waitFor({ state: "visible", timeout: 10000 });

    // Find the close button by aria-label (more reliable than SVG selector)
    const closeButton = this.page.getByRole("button", {
      name: /close.*terminal/i,
    });

    // Wait for close button to be visible and enabled
    await closeButton.waitFor({ state: "visible", timeout: 5000 });

    // Verify button is not disabled and is clickable
    const isDisabled = await closeButton.isDisabled().catch(() => false);
    if (isDisabled) {
      throw new Error(`Close button is disabled for terminal "${serviceName}"`);
    }

    // Click the close button
    await closeButton.click();
  }

  /**
   * Test terminal functionality by executing a command and verifying the result
   * Creates a new folder and verifies it appears in the file explorer
   * @param folderName - Optional folder name to create (default: "NewFolder")
   */
  async testTerminal(folderName: string = "NewFolder"): Promise<void> {
    try {
      console.log(`Testing terminal with command: mkdir ${folderName}`);

      // Wait for terminal input to be visible and ready
      const terminalInput = this.page.getByRole("textbox", {
        name: "Terminal input",
      });
      await terminalInput.waitFor({ state: "visible", timeout: 10000 });

      // Small delay to ensure terminal is fully initialized
      await this.page.waitForTimeout(500);

      // Click on terminal input to focus it
      await terminalInput.click();
      console.log("Terminal input focused");

      // Wait a bit for focus to be established
      await this.page.waitForTimeout(300);

      // Type the command
      await this.page.keyboard.type(`mkdir ${folderName}`);
      console.log(`Typed command: mkdir ${folderName}`);

      // Press Enter to execute the command
      await this.page.keyboard.press("Enter");
      console.log("Command executed");

      // Wait for command to complete (terminal processes the command)
      await this.page.waitForTimeout(1000);

      // Refresh the file explorer to see the new folder
      await this.refreshFiles();
      console.log("File explorer refreshed");

      // Wait a bit for the refresh to complete
      await this.page.waitForTimeout(500);

      // Verify the folder was created and is visible in the file explorer
      const newFolder = this.page.getByRole("button", {
        name: folderName,
        exact: true,
      });
      await newFolder.waitFor({ state: "visible", timeout: 10000 });
      console.log(`✅ Successfully created and verified folder: ${folderName}`);
    } catch (error) {
      console.error(`❌ Terminal test failed: ${error}`);
      throw new Error(
        `Failed to test terminal functionality: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get initial WebSocket frame count before executing a command
   * Used for performance/latency testing to measure new frames after command
   * @param getSentFrames - Function to get sent frames count
   * @param getReceivedFrames - Function to get received frames count
   * @returns Initial total frame count (sent + received)
   */
  getInitialFrameCount(
    getSentFrames: () => Array<unknown>,
    getReceivedFrames: () => Array<unknown>
  ): number {
    return getSentFrames().length + getReceivedFrames().length;
  }

  /**
   * Execute a terminal command and return the timestamp when command was sent
   * Used for performance/latency testing
   * @param command - Command to execute (e.g., "echo 'test'")
   * @returns Timestamp when Enter key was pressed (sendTime)
   */
  async executeTerminalCommand(command: string): Promise<number> {
    // Wait for terminal input to be visible and ready
    const terminalInput = this.page.getByRole("textbox", {
      name: "Terminal input",
    });
    await terminalInput.waitFor({ state: "visible", timeout: 10000 });
    await terminalInput.click();
    await this.page.waitForTimeout(300);

    // Clear any existing text in the terminal input
    await this.page.keyboard.press("Control+a");
    await this.page.waitForTimeout(100);

    // Type the command character by character to ensure it's captured
    await this.page.keyboard.type(command, { delay: 50 });

    // Wait a bit to ensure typing is complete
    await this.page.waitForTimeout(200);

    // Record timestamp just before pressing Enter
    const sendTime = Date.now();
    await this.page.keyboard.press("Enter");

    // Wait a bit after Enter to ensure the command is sent via WebSocket
    await this.page.waitForTimeout(500);

    return sendTime;
  }

  /**
   * Verify minimum expected frames after terminal command execution
   * For a terminal command, we expect at least:
   * - 1 sent frame (command sent to server)
   * - 1 received frame (response from server)
   * Total minimum: 2 frames
   * @param initialFrameCount - Frame count before command
   * @param currentSentFrames - Current sent frames count
   * @param currentReceivedFrames - Current received frames count
   * @param minimumExpectedFrames - Minimum frames expected (default: 2)
   * @returns Object with validation result
   */
  verifyMinimumFrames(
    initialFrameCount: number,
    currentSentFrames: number,
    currentReceivedFrames: number,
    minimumExpectedFrames: number = 2
  ): {
    success: boolean;
    totalNewFrames: number;
    minimumExpected: number;
    failureReason?: string;
  } {
    const totalFrames = currentSentFrames + currentReceivedFrames;
    const totalNewFrames = totalFrames - initialFrameCount;
    const success = totalNewFrames >= minimumExpectedFrames;

    if (!success) {
      console.error(
        `❌ Frame validation failed: ${totalNewFrames} new frames < ${minimumExpectedFrames} minimum`
      );
    }

    return {
      success,
      totalNewFrames,
      minimumExpected: minimumExpectedFrames,
      failureReason: success
        ? undefined
        : `Expected at least ${minimumExpectedFrames} new frames, got ${totalNewFrames}`,
    };
  }

  /**
   * Verify that command output is present in received WebSocket frames
   * This validates that the terminal actually returned the command output
   * Handles both JSON format (e.g., {"output": "developer"}) and plain text format
   * @param receivedFrames - Array of received WebSocket frames
   * @param command - The command that was executed (e.g., "whoami")
   * @returns Object with validation result including found output
   */
  verifyCommandOutputInFrames(
    receivedFrames: Array<{ payload: string; timestamp: number }>,
    command: string
  ): {
    success: boolean;
    foundOutput: string | null;
    foundInFrames: number;
    failureReason?: string;
  } {
    let foundOutput: string | null = null;
    let foundInFrames = 0;

    for (const frame of receivedFrames) {
      const payload = frame.payload || "";

      if (!payload || payload.length === 0) continue;

      // Skip if payload is just the command echo
      if (payload === command || payload.trim() === command) continue;

      // Try to parse as JSON first (common format for terminal responses)
      try {
        const jsonData = JSON.parse(payload);

        // Check common JSON fields for output
        const output =
          jsonData.output ||
          jsonData.data ||
          jsonData.text ||
          jsonData.result ||
          jsonData.stdout;

        if (
          output &&
          typeof output === "string" &&
          output.length > 0 &&
          output !== command
        ) {
          foundOutput = output;
          foundInFrames++;
          continue;
        }

        // If JSON doesn't have output field, check if the whole JSON string contains non-command data
        const jsonString = JSON.stringify(jsonData);
        if (
          jsonString.length > command.length + 10 &&
          !jsonString.includes(`"${command}"`)
        ) {
          foundOutput = jsonString;
          foundInFrames++;
        }
      } catch {
        // Not JSON, check as plain text
        // Look for output that:
        // 1. Is not empty
        // 2. Is not just the command
        // 3. Contains actual data (more than just whitespace/command)
        const trimmed = payload.trim();
        if (
          trimmed.length > 0 &&
          trimmed !== command &&
          !trimmed.startsWith(command) &&
          trimmed.length > command.length + 2 // Ensure it's longer than just command + minimal chars
        ) {
          // Extract potential output (could be username, file content, etc.)
          // For "whoami", output is typically a single word (username)
          const lines = trimmed
            .split("\n")
            .filter((line) => line.trim() && line.trim() !== command);
          if (lines.length > 0) {
            foundOutput = lines[0].trim(); // Take first non-command line as output
            foundInFrames++;
          } else if (trimmed.length > command.length + 5) {
            // If no newlines, but payload is significantly longer than command, it's likely output
            foundOutput = trimmed;
            foundInFrames++;
          }
        }
      }
    }

    const success = foundOutput !== null && foundInFrames > 0;

    if (!success) {
      console.error(
        `❌ Command output validation failed: No valid output found for command "${command}"`
      );
    }

    return {
      success,
      foundOutput,
      foundInFrames,
      failureReason: success
        ? undefined
        : `No valid output found for command "${command}" in received frames`,
    };
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

  async clickAddTerminalButton(): Promise<void> {
    const addTerminalButton = this.page.getByRole("button", {
      name: "Add terminal",
    });
    await addTerminalButton.click();
  }

  async selectServiceFromDropdown(serviceName: string): Promise<void> {
    const serviceMenuItem = this.page.getByRole("menuitem", {
      name: `Add ${serviceName} terminal`,
    });
    await serviceMenuItem.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForTimeout(200);
    await serviceMenuItem.click();
    console.log(`Selected service: ${serviceName} from terminal dropdown`);
  }
  async clickWorkspaceSettingsButton(): Promise<void> {
    const workspaceSettingsButton = this.page.locator(
      'button[title="Open Workspace Settings"]'
    );
    await workspaceSettingsButton.waitFor({ state: "visible", timeout: 10000 });
    await workspaceSettingsButton.click();
  }

  async waitForWorkspaceSettingsDialog(): Promise<void> {
    // Wait for dialog to be open and visible
    const dialog = this.page.getByRole("dialog", {
      name: "Workspace Settings",
    });
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    // Small delay to ensure dialog animations are complete
    await this.page.waitForTimeout(300);
  }

  async clickDangerMenuItem(): Promise<void> {
    // Danger menu item is a button with text "Danger" in the sidebar
    const dangerMenuItem = this.page.getByRole("button", { name: "Danger" });
    await dangerMenuItem.waitFor({ state: "visible", timeout: 10000 });
    await dangerMenuItem.click();
  }

  async clickDeleteWorkspaceButton(): Promise<void> {
    // Click the "Delete workspace" button in the Danger section
    const deleteWorkspaceButton = this.page.getByRole("button", {
      name: "Delete workspace",
    });
    await deleteWorkspaceButton.waitFor({ state: "visible", timeout: 10000 });
    await deleteWorkspaceButton.click();
  }

  async waitForDeleteConfirmationDialog(): Promise<void> {
    // Wait for the confirmation alertdialog to appear
    // The dialog title is "Are you absolutely sure?" not "Delete Workspace"
    const confirmationDialog = this.page.getByRole("alertdialog", {
      name: "Are you absolutely sure?",
    });
    await confirmationDialog.waitFor({ state: "visible", timeout: 10000 });
    // Small delay for dialog animations
    await this.page.waitForTimeout(200);
  }

  async clickContinueButton(): Promise<void> {
    // Wait for dialog and find Continue button within it
    const dialog = this.page.getByRole("alertdialog", {
      name: "Are you absolutely sure?",
    });
    const continueButton = dialog.getByRole("button", { name: "Continue" });
    await continueButton.waitFor({ state: "visible", timeout: 10000 });
    await continueButton.click();
    console.log("Confirmed workspace deletion");
  }
}
