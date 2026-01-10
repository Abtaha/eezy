import { db } from "@/server/db";
import { wishlistItem } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import resendService from "@/server/services/resend";

export async function sendWishlistEmail(productId: string) {
  try {
    const wishlistItems = await db.query.wishlistItem.findMany({
      where: eq(wishlistItem.productId, productId),
      with: {
        wishlist: { with: { user: true } },
        product: true,
      },
    });

    for (const item of wishlistItems) {
      await resendService.sendEmail({
        to: item.wishlist.user.email,
        subject: "Update on an item in your wishlist",
        html: `
  <div style="background-color:#fafafa;padding:32px 16px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
        <h1 style="margin:0;font-size:18px;font-weight:600;color:#09090b;">
          Wishlist update
        </h1>
        <p style="margin:6px 0 0;font-size:14px;color:#71717a;">
          Price dropped and stock is running low
        </p>
      </div>

      <!-- Product -->
      <div style="padding:24px;">
        <img
          src="${item.product.frontImage}"
          alt="${item.product.name}"
          style="width:100%;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:16px;"
        />

        <div style="display:flex;flex-direction:column;gap:6px;">
          <span style="font-size:15px;font-weight:500;color:#09090b;">
            ${item.product.name}
          </span>

          <span style="font-size:13px;color:#71717a;">
            ${item.product.category} · ${item.product.model}
          </span>

          <!-- Price -->
          <div style="margin-top:10px;">
            <span style="font-size:16px;font-weight:600;color:#09090b;">
              Now $${(Number(item.product.price) * (1 - item.product.discountPercentage / 100)).toFixed(2)}
            </span>

            <span style="margin-left:8px;font-size:14px;color:#a1a1aa;text-decoration:line-through;">
              $${Number(item.product.price).toFixed(2)}
            </span>

            <span style="margin-left:6px;font-size:13px;color:#16a34a;">
              −${item.product.discountPercentage}%
            </span>
          </div>

          <!-- Stock -->
          <div style="margin-top:8px;font-size:13px;color:#b45309;">
            Only ${item.product.quantityInStock} left in stock
          </div>
        </div>

        <!-- CTA -->
        <a
          href="https://eezy-liart.vercel.app/product/${item.product.id}"
          style="
            display:inline-block;
            margin-top:20px;
            padding:10px 16px;
            border-radius:8px;
            border:1px solid #e5e7eb;
            font-size:14px;
            font-weight:500;
            color:#09090b;
            text-decoration:none;
            background:#ffffff;
          "
        >
          View product
        </a>
      </div>

      <!-- Footer -->
      <div style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#a1a1aa;">
        You’re receiving this because this item is in your wishlist.
      </div>

    </div>
  </div>
  `,
      });
    }
  } catch (error) {
    console.error("Failed to process wishlist email:", error);
  }
}
