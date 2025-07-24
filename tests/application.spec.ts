import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { TestCredentials } from "../utils/test-data";
import { WorkspacePage } from "../pages/WorkspacePage";

test.describe("Applcation Functionality Test", () => {
  test("E2E FLow", async ({ page }) => {
    console.log("Starting Test");
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const workspacePage = new WorkspacePage(page);
    const { validUser } = TestCredentials;

    //Login User
    await test.step("Login", async () => {
      const { username, password } = validUser;
      await homePage.navigateToHome();
      await homePage.goToLogin();
      await loginPage.performLogin(username, password);
    });

    //Create Organization
    await test.step("Create Organization", async () => {
      await homePage.createNewOrganization("Test Organization");
    });

    //Create Workspace
    await test.step("Create Workspace", async () => {
      await homePage.createNewWorkspace("Test Workspace");
    });

    //Create Empty Service
    await test.step("Create Service", async () => {
      await workspacePage.isOnWorkspacePage();
      await workspacePage.createEmptyService("Test Service");
    });

    //UploadFile
    await test.step("upload a file", async () => {
      await workspacePage.uploadFile();
    });
  });
});
