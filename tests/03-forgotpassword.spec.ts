import { test, expect } from "@playwright/test";
import { ForgotPassword } from "../pages/ForgotPassword";
import { EmailService } from "../utils/email-service";
import { ResetPassword } from "../pages/ResetPassword";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { saveTestUser, markUserAsVerified } from "../utils/test-user-storage";
import { DataHelpers } from "../utils/test-helpers";
import { Email } from "mailslurp-client";

test.describe("Forgot Password Functionality", () => {
  test("TC_004: Forget Password", async ({ page }) => {
    const signupPage = new SignupPage(page);
    const forgotPassword = new ForgotPassword(page);
    const resetPassword = new ResetPassword(page);
    const loginPage = new LoginPage(page);
    const emailService = new EmailService();

    const name = "Forgot Password Test " + Date.now();
    const initialPassword = DataHelpers.generateRandomString(12) + "!A1";
    const newPassword = DataHelpers.generateRandomString(12) + "!A1";
    let email = "";
    let signupEmail: Email;
    let signupVerifyLink = "";
    let resetEmail: Email;
    let resetLink = "";

    await test.step("Create Email Address for Test", async () => {
      email = await emailService.createEmailAddress();
      expect(email).toBeTruthy();
    });

    await test.step("Setup: Create and Verify User", async () => {
      await signupPage.navigateToSignup();
      await signupPage.signup(name, email, initialPassword);

      signupEmail = await emailService.waitForEmail(email);
      signupVerifyLink =
        await emailService.extractVerificationLink(signupEmail);

      await page.goto(signupVerifyLink);
      await page.waitForLoadState("networkidle");

      saveTestUser(email, initialPassword, name, false);
      markUserAsVerified(email);
    });

    await test.step("Navigate to Forgot Password Page", async () => {
      await forgotPassword.navigateToForgotPassword();
      expect(forgotPassword.isOnForgotPasswordPage()).toBe(true);
    });

    await test.step("Request Password Reset", async () => {
      await forgotPassword.requestPasswordReset(email);
    });

    await test.step("Wait for Reset Email", async () => {
      resetEmail = await emailService.waitForEmail(email);
      expect(resetEmail).toBeTruthy();
      expect(resetEmail.subject).toBeTruthy();
    });

    await test.step("Extract Reset Link", async () => {
      resetLink = await emailService.extractVerificationLink(resetEmail);
      expect(resetLink).toBeTruthy();
      expect(resetLink).toContain("http");
      expect(resetLink).toContain("reset");
    });

    await test.step("Navigate to Reset Link and Set New Password", async () => {
      await page.goto(resetLink);
      await page.waitForLoadState("networkidle");
      expect(resetPassword.isOnResetPasswordPage()).toBe(true);
      await resetPassword.resetPassword(newPassword);
    });

    await test.step("Update Saved User Data with New Password", async () => {
      saveTestUser(email, newPassword, name, true);
    });

    await test.step("Login with New Password", async () => {
      await loginPage.navigateToLogin();
      await loginPage.waitForCloudflareChallenge();
      const loginSuccess = await loginPage.performLogin(email, newPassword);
      expect(loginSuccess).toBe(true);
    });
  });
});
