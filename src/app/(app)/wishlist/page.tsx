import { api } from "@/trpc/server";
import WishlistCard from "@/components/wishlist-card";

export default async function WishlistPage() {
  const wishlist = await api.wishlist.getMyWishlist();

  return (
    <main className="mx-auto flex min-h-[130vh] w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your Wishlist ❤️
        </h1>
        <p className="text-muted-foreground text-sm">View your wishlist</p>
      </header>

      {wishlist.items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You have no items in your wishlist.
        </p>
      ) : (
        <section className="flex flex-col gap-4">
          {wishlist.items.map((item) => (
            <WishlistCard
              key={item.product.id}
              id={item.product.id}
              imageFront={item.product.frontImage}
              imageBack={item.product.backImage}
              name={item.product.name}
              category={item.product.category}
              price={parseFloat(item.product.price)}
              rating={item.product.rating}
            />
          ))}
        </section>
      )}
    </main>
  );
}
