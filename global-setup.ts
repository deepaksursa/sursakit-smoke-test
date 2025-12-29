import { chromium, FullConfig } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// config parameter is required by Playwright's globalSetup signature but not used
// eslint-disable-next-line no-unused-vars
async function globalSetup(_config: FullConfig) {
  try {
    // Load environment variables
    dotenv.config();

    // Get credentials from environment
    const ownerEmail = process.env.OWNER_EMAIL;
    const ownerPassword = process.env.OWNER_PASSWORD;

    // Validate credentials
    if (!ownerEmail || !ownerPassword) {
      throw new Error("OWNER_EMAIL and OWNER_PASSWORD must be set in .env file");
    }

    // Create auth directory if it doesn't exist
    const authDir = path.join(process.cwd(), "auth");
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Get base URL from environment with fallback
    const baseURL = process.env.BASE_URL || "https://uat.sursakit.com";

    // Launch browser
    const browser = await chromium.launch({
      headless: true,
    });

    // Create browser context
    const context = await browser.newContext({
      baseURL: baseURL,
    });

    // Create page
    const page = await context.newPage();

    // Initialize LoginPage
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.navigateToLogin();

    // Perform login and check if successful
    const loginSuccess = await loginPage.performLogin(ownerEmail, ownerPassword);

    if (!loginSuccess) {
      throw new Error(
        "Failed to login as Owner. Please check credentials in .env file"
      );
    }

    // Wait for page to fully load after login
    await page.waitForLoadState("networkidle");

    // Save authentication state
    const authFilePath = path.join(authDir, "auth-owner.json");
    await context.storageState({ path: authFilePath });

    // Close browser
    await browser.close();

    console.log("✅ Authentication state saved successfully to auth/auth-owner.json");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error; // Re-throw to fail the setup
  }
}

export default globalSetup;