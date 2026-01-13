import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import resendService from "@/server/services/resend"; // Update path if needed
import { InvoiceTemplate } from "@/server/services/invoice-template";
import React from "react";

export async function processDelivery(orderId: string) {
  try {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        user: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!orderData || !orderData.user) {
      return;
    }

    const pdfProps = {
      orderId: orderData.id,
      date: orderData.createdAt || new Date(),
      address: orderData.shippingAddress ?? "",
      total: Number(orderData.totalAmount) || 0,
      items: orderData.orderItems.map((item) => ({
        name: item.product.name ?? "Unknown Product",
        quantity: item.quantity,
        price: Number(item.unitPrice) || 0,
        discountPercent: Number(item.discountPercent) || 0,
        subtotal: Number(item.subtotal) || 0,
      })),
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoiceTemplate, pdfProps) as any,
    );

    await resendService.sendEmailWithAttachment({
      to: orderData.user.email,
      subject: `Order Confirmation #${orderData.id}`,
      html: `
<div style="background-color: #ffffff; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #09090b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden;">
    
    <div style="padding: 32px 24px 24px 24px; text-align: center;">
      <div style="margin: 0 auto 16px auto; width: 48px; height: 48px; background-color: #f4f4f5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      
      <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #09090b;">
        Thank you for your order!
      </h1>
      <p style="margin: 8px 0 0; font-size: 15px; color: #71717a; line-height: 1.5;">
        We're getting your items ready for delivery.
      </p>
    </div>

    <div style="padding: 0 24px 32px 24px; text-align: center;">
      <div style="padding: 16px; background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 6px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #18181b;">
          Your order has been confirmed and is being processed. 
          <strong>Please find your invoice attached</strong> to this email for your records.
        </p>
      </div>

      <a href="https://eezy-liart.vercel.app/order/${orderData.id}" style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
        View Order Status
      </a>
    </div>

    <div style="padding: 24px; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
      <table style="width: 100%; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
        <tr>
          <td>
            If you have any questions, simply reply to this email or visit our <a href="#" style="color: #71717a; text-decoration: underline;">help center</a>.
          </td>
        </tr>
      </table>
    </div>

  </div>
</div>
      `,
      attachments: [
        {
          filename: `Invoice-${orderData.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    console.error("Failed to process delivery email:", error);
  }
}
