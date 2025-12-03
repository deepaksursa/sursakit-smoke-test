import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";

export class SignupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToSignup(): Promise<void> {
    await this.navigateWithCloudflareHandling("/auth/sign-up");
    await this.waitForCloudflareChallenge();
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Name" }).fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByLabel("Password").fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Create an account" }).click();
  }

  async signup(name: string, email: string, password: string): Promise<void> {
    await this.waitForCloudflareChallenge();
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  isOnSignupPage(): boolean {
    return this.isUrlContaining("sign-up");
  }

  async performSignup(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    await this.signup(name, email, password);
    await this.waitForSignupResponse();

    // If we're no longer on signup page, signup likely succeeded
    if (!this.isOnSignupPage()) {
      return true;
    }

    // Still on signup page - signup may have failed
    await this.takeScreenshot("signup-verification-failed");
    return false;
  }

  private async waitForSignupResponse(): Promise<void> {
    try {
      await Promise.race([
        this.page.waitForLoadState("networkidle", { timeout: 10000 }),
        this.page.waitForLoadState("domcontentloaded", { timeout: 5000 }),
      ]);
    } catch {
      // Continue with verification even if navigation times out
    }
  }
}
