import Link from "next/link";
import Image from "next/image";

export function Categories() {
  const categories = [
    {
      name: "Women",
      href: "/store?category=Women",
      image: "/women-category.jpg",
    },
    {
      name: "Men",
      href: "/store?category=Men",
      image: "/men-category.jpg",
    },
    {
      name: "Kids",
      href: "/store?category=Kids",
      image: "/kids-category.jpg",
    },
  ];

  return (
    <section className="px-4 py-10 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-4xl font-light tracking-wide text-white">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
