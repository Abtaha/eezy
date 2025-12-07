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
        subtotal: Number(item.subtotal) || 0,
      })),
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoiceTemplate, pdfProps) as any,
    );

    await resendService.sendEmailWithAttachment({
      from: "eezy@resend.dev",
      to: orderData.user.email,
      subject: `Order Confirmation #${orderData.id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>We are processing your delivery. Please find your invoice attached.</p>
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
