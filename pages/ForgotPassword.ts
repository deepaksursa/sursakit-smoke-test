import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";

export class ForgotPassword extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToForgotPassword(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/forgot-password");
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Send reset link" }).click();
  }

  isOnForgotPasswordPage(): boolean {
    return this.isUrlContaining("forgot-password");
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.waitForCloudflareChallenge();
    await this.fillEmail(email);
    await this.clickSubmit();
  }
}
