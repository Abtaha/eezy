import Link from "next/link"
import Image from "next/image"

export function Categories() {
  const categories = [
    {
      name: "Women",
      href: "/category/women",
      image: "/women-category.jpg",
    },
    {
      name: "Men",
      href: "/category/men",
      image: "/men-category.jpg",
    },
    {
      name: "Kids",
      href: "/category/kids",
      image: "/kids-category.jpg",
    },
  ]

  return (
    <section className="py-10 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden aspect-3/4 bg-neutral-100"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-4xl font-light tracking-wide">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
