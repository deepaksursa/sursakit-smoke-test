import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { WorkspacePage } from "../pages/WorkspacePage";
import { TestCredentials, TestData } from "../utils/test-data";

type TestFixtures = {
  workspacePage: WorkspacePage;
};

export const test = base.extend<TestFixtures>({
  workspacePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const workspacePage = new WorkspacePage(page);
    const { username, password } = TestCredentials.validUser;

    await homePage.navigateToHome();
    await homePage.goToLogin();
    await loginPage.performLogin(username, password);

    await homePage.createNewOrganization(TestData.organizationName);
    await homePage.createNewWorkspace(TestData.workspaceName);
    await workspacePage.isOnWorkspacePage();

    // now the page is on workspace with user logged in
    await use(workspacePage);
  },
});

// test.afterEach(async ({ page }) => {
//   const homePage = new HomePage(page);
//   await homePage.deleteOrganization();
// });
