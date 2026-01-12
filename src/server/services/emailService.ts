import resendService from "@/server/services/resend";

type RefundDecisionEmailInput = {
  to: string;
  name?: string | null;
  orderId: string;
  productName: string;
  refundAmount: string | number;
  decision: "approved" | "rejected";
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const emailService = {
  async sendRefundDecisionEmail(input: RefundDecisionEmailInput) {
    const name = input.name?.trim() ? input.name.trim() : "there";
    const amount =
      typeof input.refundAmount === "number"
        ? input.refundAmount.toFixed(2)
        : String(input.refundAmount);

    const subject =
      input.decision === "approved"
        ? `Refund approved for order ${input.orderId}`
        : `Refund denied for order ${input.orderId}`;

    const title = input.decision === "approved" ? "Refund approved ✅" : "Refund denied ❌";

    const message =
      input.decision === "approved"
        ? "Your refund request has been approved."
        : "Your refund request has been denied.";

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.6; color:#111;">
        <h2 style="margin:0 0 12px 0;">${escapeHtml(title)}</h2>
        <p style="margin:0 0 12px 0;">Hi ${escapeHtml(name)},</p>

        <p style="margin:0 0 12px 0;">
          ${escapeHtml(message)}
        </p>

        <div style="padding:12px 14px; border:1px solid #e5e7eb; border-radius:10px; background:#f9fafb;">
          <div><strong>Order:</strong> ${escapeHtml(input.orderId)}</div>
          <div><strong>Item:</strong> ${escapeHtml(input.productName)}</div>
          <div><strong>Amount:</strong> ${escapeHtml(amount)} USD</div>
        </div>

        <p style="margin:16px 0 0 0; color:#444;">
          If you have questions, reply to this email.
        </p>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:18px 0;" />
        <p style="margin:0; font-size:12px; color:#6b7280;">Eezy Store</p>
      </div>
    `;

    return resendService.sendEmail({ to: input.to, subject, html });
  },
};

