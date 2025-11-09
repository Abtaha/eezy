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
        from: "eezy@resend.dev",
        to,
        subject,
        html,
      });
      console.log("Email sent:", response);
      return response;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async sendEmailWithAttachment({
    to,
    subject,
    html,
    attachments,
  }: {
    from: string;
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
        from: "eezy@resend.dev",
        to,
        subject,
        html,
        attachments: attachments.map((file) => ({
          filename: file.filename,
          content: file.content,
          contentType: file.contentType,
        })),
      });
      console.log("Email with attachment sent:", response);
      return response;
    } catch (error) {
      console.error("Failed to send email with attachment:", error);
      throw error;
    }
  }
}

const resendService = new ResendService();

export default resendService;
