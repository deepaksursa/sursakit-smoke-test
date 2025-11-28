/**
 * 📧 Email Service
 *
 * Handles email operations using MailSlurp API
 * Used for signup verification and email-based testing workflows
 *
 * @example
 * ```typescript
 * const emailService = new EmailService();
 * const email = await emailService.createEmailAddress();
 * const verificationEmail = await emailService.waitForEmail(email);
 * const link = await emailService.extractVerificationLink(verificationEmail);
 * ```
 */

import { Email, MailSlurp } from "mailslurp-client";

export class EmailService {
  private mailSlurp: MailSlurp;
  private apiKey = process.env.MAILSLURP_API_KEY ?? "";
  // Store inbox info: emailAddress -> inboxId
  private inboxMap: Map<string, string> = new Map();

  /**
   * Initialize MailSlurp client with API key from environment variables
   * API key should be set in .env file as MAILSLURP_API_KEY
   */
  constructor() {
    if (!this.apiKey) {
      throw new Error(
        "MAILSLURP_API_KEY is not set. Please add it to your .env file."
      );
    }
    this.mailSlurp = new MailSlurp({ apiKey: this.apiKey });
  }

  /**
   * Create a new email inbox address
   * Returns a real email address that can receive emails
   * Stores inbox ID internally for efficient email retrieval
   *
   * @returns {Promise<string>} Email address (e.g., "abc123@mailslurp.com")
   * @example
   * ```typescript
   * const email = await emailService.createEmailAddress();
   * // Use this email in signup form
   * ```
   */
  async createEmailAddress(): Promise<string> {
    const inbox = await this.mailSlurp.createInbox();

    // Validate inbox was created successfully
    if (!inbox.id || !inbox.emailAddress) {
      throw new Error("Failed to create inbox. Missing id or emailAddress.");
    }

    // Store both id and emailAddress for later use
    this.inboxMap.set(inbox.emailAddress, inbox.id);
    return inbox.emailAddress;
  }

  /**
   * Wait for an email to arrive in the inbox
   * Uses MailSlurp's built-in waitForLatestEmail method for efficient polling
   *
   * @param {string} emailAddress - The email address to check for new emails
   * @param {number} timeout - Maximum time to wait in milliseconds (default: 60000)
   * @param {boolean} unreadOnly - Wait only for new unread emails (default: true)
   * @returns {Promise<Email>} The email object containing subject, body, HTML, etc.
   * @throws {Error} If email doesn't arrive within timeout period
   * @example
   * ```typescript
   * const email = await emailService.waitForEmail("test@mailslurp.com");
   * console.log(email.subject); // "Verify your email"
   * ```
   */
  async waitForEmail(
    emailAddress: string,
    timeout: number = 60000,
    unreadOnly: boolean = true
  ): Promise<Email> {
    // Validate email address
    if (!emailAddress || emailAddress.trim() === "") {
      throw new Error("Email address cannot be empty");
    }

    // Get inbox ID from stored map
    const inboxId = this.inboxMap.get(emailAddress);
    if (!inboxId) {
      throw new Error(
        `Inbox not found for email: ${emailAddress}. Make sure to create it using createEmailAddress() first.`
      );
    }

    // Use MailSlurp's built-in waitForLatestEmail method
    const email = await this.mailSlurp.waitController.waitForLatestEmail({
      inboxId: inboxId,
      timeout: timeout,
      unreadOnly: unreadOnly,
    });

    if (!email) {
      throw new Error(
        `No email received at ${emailAddress} within ${timeout}ms timeout`
      );
    }

    return email;
  }

  /**
   * Extract verification link from email content
   * Uses MailSlurp's getEmailLinks method to extract links, then searches for verification link
   * Checks both HTML and text content for maximum reliability
   *
   * @param {Email} email - The email object from waitForEmail()
   * @returns {Promise<string>} The verification link URL
   * @throws {Error} If no verification link is found
   * @example
   * ```typescript
   * const email = await emailService.waitForEmail(emailAddress);
   * const link = await emailService.extractVerificationLink(email);
   * await page.goto(link); // Navigate to verification link
   * ```
   */
  async extractVerificationLink(email: Email): Promise<string> {
    if (!email.id) {
      throw new Error("Email ID is required to extract links");
    }

    // Use MailSlurp's built-in getEmailLinks method
    const emailLinks = await this.mailSlurp.emailController.getEmailLinks({
      emailId: email.id,
    });

    const links = emailLinks.links || [];

    if (links.length === 0) {
      throw new Error(
        `No links found in email. Subject: ${email.subject || "Unknown"}`
      );
    }

    // Search for verification link in extracted links
    for (const link of links) {
      // Look for verification-related keywords
      // Matches: verify-email, verification, confirm, activate, token
      if (
        link.includes("verify") ||
        link.includes("verification") ||
        link.includes("confirm") ||
        link.includes("activate") ||
        link.includes("token")
      ) {
        return link;
      }
    }

    // If no verification link found with keywords, return first link
    // (assuming it's the verification link if only one link exists)
    return links[0];
  }

  /**
   * Delete an email inbox (cleanup)
   * Useful for cleaning up test data after tests complete
   *
   * @param {string} emailAddress - The email address to delete
   * @returns {Promise<void>}
   * @example
   * ```typescript
   * // Cleanup after test
   * await emailService.deleteEmailAddress(emailAddress);
   * ```
   */
  async deleteEmailAddress(emailAddress: string): Promise<void> {
    // Validate email address
    if (!emailAddress || emailAddress.trim() === "") {
      throw new Error("Email address cannot be empty");
    }

    // Get inbox ID from stored map
    const inboxId = this.inboxMap.get(emailAddress);
    if (!inboxId) {
      throw new Error(
        `Inbox not found for email: ${emailAddress}. Make sure to create it using createEmailAddress() first.`
      );
    }

    try {
      await this.mailSlurp.deleteInbox(inboxId);
      // Remove from map after successful deletion
      this.inboxMap.delete(emailAddress);
    } catch (error) {
      // Remove from map even if deletion fails (inbox might already be deleted)
      this.inboxMap.delete(emailAddress);
      throw new Error(`Failed to delete inbox for ${emailAddress}: ${error}`);
    }
  }
}
