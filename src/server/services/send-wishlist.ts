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
<div style="background-color: #ffffff; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #09090b;">
  <div style="max-width: 450px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden;">
    
    <div style="padding: 24px 24px 20px 24px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;">
        Wishlist update
      </h3>
      <p style="margin: 4px 0 0; font-size: 14px; color: #71717a; line-height: 1.4;">
        Price dropped and stock is running low.
      </p>
    </div>

    <div style="padding: 0 24px 24px 24px;">
      <div style="margin-bottom: 20px; border-radius: 6px; border: 1px solid #f4f4f5; overflow: hidden; background-color: #f8f9fa;">
        <img
          src="${item.product.frontImage}"
          alt="${item.product.name}"
          style="width: 100%; display: block; object-fit: cover; max-height: 400px;"
        />
      </div>

      <div style="margin-bottom: 24px;">
        <div style="font-size: 14px; font-weight: 500; margin-bottom: 2px;">
          ${item.product.name}
        </div>
        <div style="font-size: 13px; color: #71717a; margin-bottom: 16px;">
          ${item.product.category.name} &middot; ${item.product.model}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="vertical-align: baseline;">
              <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin-right: 8px;">
                $${(Number(item.product.price) * (1 - item.product.discountPercentage / 100)).toFixed(2)}
              </span>
              <span style="font-size: 14px; color: #a1a1aa; text-decoration: line-through;">
                $${Number(item.product.price).toFixed(2)}
              </span>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="font-size: 12px; font-weight: 600; color: #18181b; background-color: #f4f4f5; padding: 4px 8px; border-radius: 4px; white-space: nowrap;">
                -${item.product.discountPercentage}%
              </span>
            </td>
          </tr>
        </table>

        <div style="display: block; padding: 10px 12px; border-radius: 6px; border: 1px solid #fef3c7; background-color: #fffbeb; margin-bottom: 20px;">
          <span style="font-size: 13px; font-weight: 500; color: #b45309; display: flex; align-items: center;">
            <span style="color: #d97706; margin-right: 6px; font-size: 16px; line-height: 1;">&bull;</span>
            Only ${item.product.quantityInStock} units left in stock
          </span>
        </div>

        <a
          href="https://eezy-liart.vercel.app/product/${item.product.id}"
          style="
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 12px 16px;
            background-color: #18181b;
            color: #ffffff;
            text-align: center;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            border-radius: 6px;
          "
        >
          View Product Details
        </a>
      </div>
    </div>

    <div style="padding: 16px 24px; border-top: 1px solid #e4e4e7; background-color: #fafafa; text-align: left;">
      <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.4;">
        You’re receiving this because this item is in your wishlist.
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
