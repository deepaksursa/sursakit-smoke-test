import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";

export class ResetPassword extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillNewPassword(password: string): Promise<void> {
    await this.page.getByLabel("New Password").fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: /reset|save/i }).click();
  }

  isOnResetPasswordPage(): boolean {
    return this.isUrlContaining("reset-password");
  }

  async resetPassword(newPassword: string): Promise<void> {
    await this.fillNewPassword(newPassword);
    await this.clickSubmit();
  }

  async performPasswordReset(newPassword: string): Promise<boolean> {
    await this.resetPassword(newPassword);

    try {
      await this.page.waitForURL(
        (url) => !url.toString().includes("reset-password"),
        {
          timeout: 15000,
        }
      );
      return true;
    } catch {
      await this.takeScreenshot("password-reset-failed");
      return false;
    }
  }
}
