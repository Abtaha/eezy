
import { Hero } from "@/components/ui/home-page-components/hero"
import { Categories } from "@/components/ui/home-page-components/categories"
import { FreeShippingBanner } from "@/components/ui/home-page-components/free-shipping-banner"
import { Bestsellers } from "@/components/ui/home-page-components/best-sellers"


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <FreeShippingBanner />
        <Bestsellers />
        <Categories />
      </main>
    </div>
  )
}
