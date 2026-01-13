import { Resend } from "resend";
import { env } from "@/env";

class ResendService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const response = await this.resend.emails.send({
        from: "eezy@abtahafarooq.com",
        to,
        subject,
        html,
      });
      return response;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async sendBatchEmail({
    recipients,
    subject,
    html,
  }: {
    recipients: string[];
    subject: string;
    html: string;
  }) {
    if (recipients.length === 0) return;

    // dedupe
    const uniqueRecipients = [...new Set(recipients)];

    return await this.resend.emails.send({
      from: "Eezy <eezy@abtahafarooq.com>",
      to: "eezy@abtahafarooq.com", // primary recipient
      bcc: uniqueRecipients, // actual users
      subject,
      html,
    });
  }

  async sendEmailWithAttachment({
    to,
    subject,
    html,
    attachments,
  }: {
    to: string;
    subject: string;
    html: string;
    attachments: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }[];
  }) {
    try {
      const response = await this.resend.emails.send({
        from: "eezy@abtahafarooq.com",
        to,
        subject,
        html,
        attachments: attachments.map((file) => ({
          filename: file.filename,
          content: file.content,
          contentType: file.contentType,
        })),
      });
      return response;
    } catch (error) {
      console.error("Failed to send email with attachment:", error);
      throw error;
    }
  }
}

const resendService = new ResendService();

export default resendService;
