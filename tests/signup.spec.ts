import { test, expect } from "@playwright/test";
import { SignupPage } from "../pages/SignupPage";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { EmailService } from "../utils/email-service";
import { DataHelpers } from "../utils/test-helpers";
import { Email } from "mailslurp-client";
import { saveTestUser, markUserAsVerified } from "../utils/test-data";

test.describe("Signup Functionality", () => {
  test(
    "TC_003: Valid Signup with Email Verification",
    {
      tag: ["@smoke", "@regression"],
    },
    async ({ page }) => {
      const signupPage = new SignupPage(page);
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);
      const emailService = new EmailService();

      // Generate test data
      const name = "Test User " + Date.now();
      const password = DataHelpers.generateRandomString(12) + "!A1";
      let email = "";
      let verificationEmail: Email;
      let verificationLink = "";

      await test.step("Create Email Address", async () => {
        email = await emailService.createEmailAddress();
        expect(email).toBeTruthy();
        expect(email).toContain("@");
      });

      await test.step("Navigate to Signup Page", async () => {
        await signupPage.navigateToSignup();
        expect(signupPage.isOnSignupPage()).toBe(true);
      });

      await test.step("Fill and Submit Signup Form", async () => {
        await signupPage.performSignup(name, email, password);
        await signupPage.waitForNavigation();
        // Verify redirect to home page after signup
        expect(signupPage.isOnSignupPage()).toBe(false);
        expect(homePage.isOnHomePage()).toBe(true);

        // Save user credentials for future tests
        saveTestUser(email, password, name, false);
      });

      await test.step("Wait for Verification Email", async () => {
        verificationEmail = await emailService.waitForEmail(email);
        expect(verificationEmail).toBeTruthy();
        expect(verificationEmail.subject).toBeTruthy();
      });

      await test.step("Extract Verification Link", async () => {
        verificationLink =
          await emailService.extractVerificationLink(verificationEmail);

        // Verify link was extracted successfully
        expect(verificationLink).toBeTruthy();
        expect(verificationLink).toContain("http");
        expect(verificationLink).toContain("verify");
      });

      await test.step("Click Verification Link and Verify", async () => {
        await page.goto(verificationLink);
        await page.waitForLoadState("networkidle");

        // Mark user as verified in storage
        markUserAsVerified(email);
      });

      await test.step("Verify User Can Login", async () => {
        await loginPage.navigateToLogin();
        await loginPage.waitForCloudflareChallenge();
        const loginSuccess = await loginPage.performLogin(email, password);
        expect(loginSuccess).toBe(true);
        await loginPage.takeScreenshot("04-login-after-signup-success");
      });

      await test.step("Cleanup: Delete Email Inbox", async () => {
        try {
          //await emailService.deleteEmailAddress(email);
        } catch (error) {
          // Log but don't fail test if cleanup fails
          console.log(
            `Cleanup warning: Failed to delete email inbox: ${error}`
          );
        }
      });
    }
  );
});
