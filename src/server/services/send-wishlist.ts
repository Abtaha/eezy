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
        product: { with: { category: true } },
      },
    });

    if (wishlistItems.length === 0) throw new Error("No wishlist items found");

    const [item] = wishlistItems;

    if (!item) throw new Error("No item found");

    const recipients = wishlistItems.map((i) => i.wishlist.user.email);

    await resendService.sendBatchEmail({
      recipients,
      subject: "Update on an item in your wishlist",
      html: `
<div style="background-color: #ffffff; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #09090b;">
  <div style="max-width: 450px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden;">
    
    <div style="padding: 24px 24px 16px 24px; display: flex; flex-direction: column; gap: 4px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;">
        Wishlist update
      </h3>
      <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.5;">
        Price dropped and stock is running low.
      </p>
    </div>

    <div style="padding: 0 24px 24px 24px;">
      <div style="margin-bottom: 20px; border-radius: 6px; border: 1px solid #f4f4f5; overflow: hidden;">
        <img
          src="${item.product.frontImage}"
          alt="${item.product.name}"
          style="width: 100%; display: block; object-fit: cover;"
        />
      </div>

      <div style="margin-bottom: 24px;">
        <div style="font-size: 14px; font-weight: 500; margin-bottom: 2px;">
          ${item.product.name}
        </div>
        <div style="font-size: 13px; color: #71717a; margin-bottom: 12px;">
          ${item.product.category.name} &middot; ${item.product.model}
        </div>

        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
            $${(Number(item.product.price) * (1 - item.product.discountPercentage / 100)).toFixed(2)}
          </span>
          <span style="font-size: 14px; color: #a1a1aa; text-decoration: line-through;">
            $${Number(item.product.price).toFixed(2)}
          </span>
          <span style="font-size: 12px; font-weight: 600; color: #18181b; background-color: #f4f4f5; padding: 2px 6px; border-radius: 4px; margin-left: auto;">
            -${item.product.discountPercentage}%
          </span>
        </div>

        <div style="margin-top: 12px; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 6px; border: 1px solid #fef3c7; background-color: #fffbeb;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #d97706;"></div>
          <span style="font-size: 12px; font-weight: 500; color: #b45309;">
            Only ${item.product.quantityInStock} units left in stock
          </span>
        </div>
      </div>

      <a
        href="https://eezy-liart.vercel.app/product/${item.product.id}"
        style="
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 10px 16px;
          background-color: #18181b;
          color: #ffffff;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          transition: opacity 0.2s;
        "
      >
        View Product Details
      </a>
    </div>

    <div style="padding: 16px 24px; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
      <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.4;">
        You’re receiving this because this item is in your wishlist. 
        <br/>Manage your preferences in your account settings.
      </p>
    </div>
  </div>
</div>
      `,
    });
  } catch (error) {
    console.error("Failed to process wishlist email:", error);
  }
}
