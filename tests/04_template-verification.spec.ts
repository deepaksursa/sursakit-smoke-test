import { test, expect } from "@playwright/test";
import { Dashboard } from "../pages/Dashboard";
import { WorkspacePage } from "../pages/WorkspacePage";
import { WebSocketHelpers } from "../utils/websocket-helpers";

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
  // Shared state: workspace URL
  let templateTestingWorkspaceURL: string = ""; // to store the session id of the workspace for TC_005

  // Run tests serially - TC_005 and TC_006 depend on TC_004
  test.describe.serial("Serial Test Execution", () => {
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
          templateTestingWorkspaceURL = currentUrl;
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

    test(
      "TC_005: Terminal Websocket Verification",
      {
        tag: ["@owner", "@smoke"],
      },
      async ({ page }) => {
        const workspacePage = new WorkspacePage(page);

        // Set up WebSocket monitoring BEFORE navigation
        // This ensures we capture the terminal WebSocket when it connects
        // Filter for terminal WebSocket only - ignores /ws/fs and /ws/session
        const wsMonitor = WebSocketHelpers.setupWebSocketMonitoring(
          page,
          true,
          "/ws/terminal" // Only track terminal WebSocket connections
        );

        // Store initial frame count at test start (for frame validation in Integrity step)
        const testStartFrameCount = workspacePage.getInitialFrameCount(
          () => wsMonitor.getSentFrames(),
          () => wsMonitor.getReceivedFrames()
        );

        await test.step("Navigate to Workspace", async () => {
          await workspacePage.navigate(templateTestingWorkspaceURL);
          // Verify we're on workspace page
          const isOnWorkspace = await workspacePage.isOnWorkspacePage();
          expect(isOnWorkspace).toBe(true);
        });
        await test.step("1. Connectivity: Verify HTTP 101 (WebSocket Upgrade)", async () => {
          // Set up promise to wait for WebSocket connection BEFORE opening terminal
          const wsPromise = wsMonitor.waitForConnection(30000);
          // Open terminal - this should trigger a WebSocket connection with HTTP 101 upgrade
          await workspacePage.clickAddTerminalButton();
          await workspacePage.selectServiceFromDropdown("employee-info-app");

          // Wait for WebSocket connection to be established
          const ws = await wsPromise;
          // Verify WebSocket connection exists (HTTP 101 upgrade successful)
          expect(ws).not.toBeNull();
          expect(ws.url()).toBeTruthy();

          // Verify WebSocket URL is valid (should contain ws:// or wss://)
          const wsUrl = ws.url();
          expect(wsUrl).toMatch(/^(ws|wss):\/\//);

          // Verify connectivity using helper (validates HTTP 101 upgrade)
          const connectivity = wsMonitor.verifyConnectivity();
          expect(connectivity.success).toBe(true);

          // If failed, provide detailed error message
          if (!connectivity.success) {
            throw new Error(
              `Connectivity verification failed: ${connectivity.failureReason}`
            );
          }
        });

        await test.step("2. Performance: Verify Latency < 300ms", async () => {
          await page.waitForTimeout(1000);

          const initialFrameCount = workspacePage.getInitialFrameCount(
            () => wsMonitor.getSentFrames(),
            () => wsMonitor.getReceivedFrames()
          );

          const sendTime = await workspacePage.executeTerminalCommand("whoami");

          // Wait for actual response and get the response timestamp from the received frame
          const responseTime = await wsMonitor.waitForResponse(
            initialFrameCount,
            5000
          );

          const performance = wsMonitor.verifyPerformance(
            initialFrameCount,
            sendTime,
            responseTime
          );

          expect(performance.success).toBe(true);

          if (!performance.success) {
            throw new Error(
              `Performance verification failed: ${performance.failureReason}\n` +
                `Latency: ${performance.latency}ms, Threshold: ${performance.threshold}ms`
            );
          }
        });

        await test.step("3. Integrity: Verify JSON/String Content in Frames", async () => {
          // Wait a bit more to ensure we have frames
          await page.waitForTimeout(1000);

          // Verify we have received frames (basic check)
          expect(wsMonitor.getReceivedFrames().length).toBeGreaterThan(0);

          // Verify minimum NEW frames since test start (using page object method)
          // This validates that frames were accumulated throughout the test
          const frameValidation = workspacePage.verifyMinimumFrames(
            testStartFrameCount,
            wsMonitor.getSentFrames().length,
            wsMonitor.getReceivedFrames().length,
            2 // Minimum expected: 1 sent frame + 1 received frame
          );
          expect(frameValidation.success).toBe(true);

          // Verify command was sent in sent frames
          // Commands are sent character-by-character as JSON: {"eventName":"input","payload":{"data":"w"}}
          const sentFrames = wsMonitor.getSentFrames();
          const commandToFind = "whoami";
          let reconstructedCommand = "";
          let commandFound = false;

          // Check if command appears as complete string in any frame
          const directMatch = sentFrames.some((frame) => {
            const payload = frame.payload || "";
            const payloadStr =
              typeof payload === "string" ? payload : JSON.stringify(payload);
            return payloadStr
              .toLowerCase()
              .includes(commandToFind.toLowerCase());
          });

          if (directMatch) {
            commandFound = true;
          } else {
            // Reconstruct command from character-by-character input events
            for (const frame of sentFrames) {
              const payload = frame.payload || "";
              const payloadStr =
                typeof payload === "string" ? payload : JSON.stringify(payload);

              try {
                const jsonData = JSON.parse(payloadStr);
                if (
                  jsonData.eventName === "input" &&
                  jsonData.payload &&
                  jsonData.payload.data
                ) {
                  const char = jsonData.payload.data;

                  if (char === "\r" || char === "\n") {
                    if (
                      reconstructedCommand.toLowerCase() ===
                      commandToFind.toLowerCase()
                    ) {
                      commandFound = true;
                      break;
                    }
                    reconstructedCommand = "";
                  } else if (typeof char === "string" && char.length === 1) {
                    reconstructedCommand += char;
                    if (
                      reconstructedCommand.toLowerCase() ===
                      commandToFind.toLowerCase()
                    ) {
                      commandFound = true;
                      break;
                    }
                    if (
                      !commandToFind
                        .toLowerCase()
                        .startsWith(reconstructedCommand.toLowerCase())
                    ) {
                      reconstructedCommand = char;
                    }
                  }
                }
              } catch {
                // Not JSON, continue
              }
            }
          }

          expect(commandFound).toBe(true);

          // Verify command output is present in received frames
          // For "whoami" command, we expect the output (username like "developer") to be in the frames
          // This validates that the terminal actually returned the command output, not just the command echo
          const receivedFrames = wsMonitor.getReceivedFrames();
          const commandOutput = workspacePage.verifyCommandOutputInFrames(
            receivedFrames,
            "whoami"
          );

          expect(commandOutput.success).toBe(true);
          expect(commandOutput.foundOutput).not.toBeNull();
          expect(commandOutput.foundOutput).not.toBe("");

          // Verify integrity using helper (validates JSON/String content)
          const integrity = wsMonitor.verifyIntegrity();
          expect(integrity.success).toBe(true);
          expect(integrity.validFrames).toBeGreaterThan(0);

          // If failed, provide detailed error message
          if (!integrity.success || !commandOutput.success || !commandFound) {
            throw new Error(
              `Integrity verification failed: ${integrity.failureReason || "Unknown error"}\n` +
                `Total frames: ${integrity.totalFrames}, Valid: ${integrity.validFrames}, Invalid: ${integrity.invalidFrames}\n` +
                `Frame validation: ${frameValidation.success ? "Passed" : frameValidation.failureReason}\n` +
                `Command sent validation: ${commandFound ? "Passed" : "Failed - command not found in sent frames"}\n` +
                `Command output validation: ${commandOutput.success ? `Passed - Found: "${commandOutput.foundOutput}"` : commandOutput.failureReason || "Failed - no output found"}`
            );
          }
        });

        await test.step("4. Closure: Verify terminal close action", async () => {
          // Close the terminal by clicking the close button
          await workspacePage.closeTerminal("employee-info-app");
        });
      }
    );

    test(
      "TC_006: Workspace Deletion Verification",
      {
        tag: ["@owner", "@smoke"],
      },
      async ({ page }) => {
        const workspacePage = new WorkspacePage(page);

        await test.step("Navigate to Workspace", async () => {
          await workspacePage.navigate(templateTestingWorkspaceURL);
          const isOnWorkspace = await workspacePage.isOnWorkspacePage();
          expect(isOnWorkspace).toBe(true);
        });

        await test.step("Open Workspace Settings", async () => {
          await workspacePage.clickWorkspaceSettingsButton();
          await workspacePage.waitForWorkspaceSettingsDialog();
        });

        await test.step("Navigate to Danger Section", async () => {
          await workspacePage.clickDangerMenuItem();
        });

        await test.step("Delete Workspace", async () => {
          await workspacePage.clickDeleteWorkspaceButton();
          await workspacePage.waitForDeleteConfirmationDialog();
          await workspacePage.clickContinueButton();
        });

        await test.step("Verify Workspace Deleted", async () => {
          // Wait for navigation away from workspace (back to dashboard or home)
          // Workspace URL pattern: /s/[session-id]
          // After deletion, should navigate to dashboard (no /s/ in URL)
          await page.waitForURL(/^(?!.*\/s\/)/, { timeout: 15000 });
          const currentUrl = page.url();
          expect(currentUrl).not.toMatch(/\/s\/[a-z0-9]+$/);

          // Verify we're on dashboard or home page (not workspace)
          const isOnWorkspace = await workspacePage.isOnWorkspacePage();
          expect(isOnWorkspace).toBe(false);
        });
      }
    );
  }); // End of test.describe.serial
});
