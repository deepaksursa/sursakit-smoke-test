import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration - Chrome Only for Basic Testing
 * Simplified configuration focusing on essential functionality
 */
export default defineConfig({
  // Test directory configuration
  testDir: "./tests",
  globalSetup: "./global-setup.ts",

  // Global test timeout (10 minutes)
  timeout: 10 * 60 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },

  // Retry configuration for flaky tests
  retries: process.env.CI ? 2 : 1,

  // Parallel execution workers (currently only 1 active test, so no benefit)
  workers: 1,

  // Simple HTML reporter only
  reporter: [["html", { outputFolder: "reports", open: "never" }], ["list"]],

  // Global test configuration
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || "https://uat.sursakit.com",

    // Browser configuration
    headless: process.env.HEADLESS !== "false",

    // Enhanced browser fingerprinting to bypass Cloudflare
    // These settings make the browser look more like a real user
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
    timezoneId: "America/New_York",

    // Additional headers to appear more legitimate
    extraHTTPHeaders: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },

    // Video recording (only for CI failures)
    video: process.env.CI
      ? {
          mode: "retain-on-failure",
          size: { width: 1280, height: 720 },
        }
      : "off",

    // Screenshot on failure
    screenshot: {
      mode: "only-on-failure",
      fullPage: true,
    },

    // Trace collection
    trace: {
      mode: "retain-on-failure",
      screenshots: true,
      snapshots: true,
    },

    // Navigation timeout (increased for Cloudflare challenges)
    navigationTimeout: 30000,

    // Action timeout (increased for Cloudflare challenges)
    actionTimeout: 10000,

    // Ignore HTTPS errors (useful for UAT environments)
    ignoreHTTPSErrors: true,
  },

  // Test projects - Chrome Only
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name:"owner",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: path.join(process.cwd(), "auth", "auth-owner.json"),
      },
    },
  ],

  // All outputs go to test-results folder
  outputDir: "test-results/",

  // Note: Global teardown removed - in-memory storage clears automatically
  // when process ends. If you switch to file-based storage, re-enable:
  // globalTeardown: "./global-teardown.ts",
});
