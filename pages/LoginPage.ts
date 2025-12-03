import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/sign-in");
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByLabel("Password").fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.waitForCloudflareChallenge();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  isOnLoginPage(): boolean {
    return this.isUrlContaining("sign-in");
  }

  async performLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);

    try {
      // Wait for URL to change away from login page (indicates success)
      await this.page.waitForURL((url) => !url.toString().includes("sign-in"), {
        timeout: 15000,
      });
      return true;
    } catch {
      // Still on login page after timeout - login failed
      await this.takeScreenshot("login-verification-failed");
      return false;
    }
  }
}
