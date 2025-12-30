import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
dotenv.config();

/**
 * Authentication Setup Project
 *
 * This setup project runs before all dependent projects.
 * It authenticates as Owner and saves the authentication state.
 *
 * Benefits of using setup project (vs globalSetup):
 * - Visible in HTML reports
 * - Supports trace recording
 * - Uses Playwright fixtures (page, browser, etc.)
 * - Respects config options automatically
 * - Optimized: Reuses existing auth state if valid
 */
const authFile = path.join(process.cwd(), "auth", "auth-owner.json");
const authDir = path.join(process.cwd(), "auth");

/**
 * Cookie type from Playwright storage state format
 */
interface StorageStateCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number; // Timestamp in seconds, or -1 for session cookies
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Storage state structure from Playwright
 */
interface StorageState {
  cookies: StorageStateCookie[];
  origins?: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}

/**
 * Check if existing authentication state is valid
 * @returns true if auth file exists and is valid, false otherwise
 */
function isAuthStateValid(): boolean {
  if (!fs.existsSync(authFile)) {
    return false;
  }

  try {
    const authData = JSON.parse(
      fs.readFileSync(authFile, "utf-8")
    ) as StorageState;

    // Validate file structure
    if (!authData.cookies || !Array.isArray(authData.cookies)) {
      return false;
    }

    // Find session cookie (your app uses __Secure-better-auth.session_token)
    const sessionCookie = authData.cookies.find(
      (cookie: StorageStateCookie) =>
        cookie.name === "__Secure-better-auth.session_token" ||
        cookie.name.includes("session_token") ||
        cookie.name.includes("auth")
    );

    if (!sessionCookie) {
      return false;
    }

    // Check expiration if cookie has expires field
    if (sessionCookie.expires && sessionCookie.expires !== -1) {
      const now = Date.now() / 1000; // Current time in seconds
      if (sessionCookie.expires <= now) {
        return false; // Cookie expired
      }
    }

    // Cookie exists and is valid
    return true;
  } catch (error) {
    // File exists but is corrupted/invalid
    console.error("❌ Authentication setup failed:", error);
    return false;
  }
}

setup("authenticate as owner", async ({ page }) => {
  try {
    // Create auth directory if it doesn't exist
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Check if existing auth state is valid
    if (isAuthStateValid()) {
      console.log("✅ Using existing valid authentication state");
      return; // Skip login, reuse existing file
    }

    console.log("🔄 Authenticating as Owner...");

    // Get credentials from environment
    const ownerEmail = process.env.OWNER_EMAIL;
    const ownerPassword = process.env.OWNER_PASSWORD;

    // Validate credentials
    if (!ownerEmail || !ownerPassword) {
      throw new Error(
        "OWNER_EMAIL and OWNER_PASSWORD must be set in .env file"
      );
    }

    // Initialize LoginPage
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.navigateToLogin();

    // Perform login and check if successful
    const loginSuccess = await loginPage.performLogin(
      ownerEmail,
      ownerPassword
    );

    if (!loginSuccess) {
      throw new Error(
        "Failed to login as Owner. Please check credentials in .env file"
      );
    }

    // Wait for page to fully load after login
    // Wait until the page receives the cookies.
    // Sometimes login flow sets cookies in the process of several redirects.
    await page.waitForLoadState("networkidle");

    // Save authentication state
    await page.context().storageState({ path: authFile });

    console.log(
      "✅ Authentication state saved successfully to auth/auth-owner.json"
    );
  } catch (error) {
    console.error("❌ Authentication setup failed:", error);
    throw error; // Re-throw to fail the setup
  }
});
