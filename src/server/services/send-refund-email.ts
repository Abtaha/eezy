import resendService from "@/server/services/resend";

type RefundDecision = "approved" | "rejected";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function processRefundDecisionEmail({
  to,
  name,
  orderId,
  productName,
  refundAmount,
  decision,
}: {
  to: string;
  name?: string | null;
  orderId: string;
  productName: string;
  refundAmount: string | number;
  decision: RefundDecision;
}) {
  try {
    const safeName = name?.trim() ? name.trim() : "there";
    const amount =
      typeof refundAmount === "number"
        ? refundAmount.toFixed(2)
        : String(refundAmount);

    const isApproved = decision === "approved";

    const subject = isApproved
      ? `Refund approved · Order ${orderId}`
      : `Refund denied · Order ${orderId}`;

    const html = `
      <div style="background:#fafafa;padding:32px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#09090b;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:24px;">
          
          <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:600;">
            ${isApproved ? "Refund approved" : "Refund denied"}
          </h1>

          <p style="margin:0 0 20px 0;color:#52525b;font-size:14px;">
            Hi ${escapeHtml(safeName)},
          </p>

          <p style="margin:0 0 24px 0;font-size:14px;color:#18181b;">
            ${
              isApproved
                ? "Your refund request has been approved and will be processed shortly."
                : "After reviewing your request, we’re unable to approve this refund."
            }
          </p>

          <div style="border:1px solid #e4e4e7;border-radius:10px;padding:16px;background:#fafafa;">
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr>
                <td style="padding:4px 0;color:#71717a;">Order</td>
                <td style="padding:4px 0;text-align:right;font-weight:500;">${escapeHtml(orderId)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#71717a;">Item</td>
                <td style="padding:4px 0;text-align:right;font-weight:500;">${escapeHtml(productName)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#71717a;">Amount</td>
                <td style="padding:4px 0;text-align:right;font-weight:600;">
                  ${escapeHtml(amount)} USD
                </td>
              </tr>
            </table>
          </div>

        </div>

        <p style="text-align:center;margin:16px 0 0 0;font-size:12px;color:#71717a;">
          Eezy Store
        </p>
      </div>
    `;

    await resendService.sendEmail({
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send refund decision email:", error);
  }
}
