import { Hero } from "@/components/home-page-components/hero";
import { Categories } from "@/components/home-page-components/categories";
import { FreeShippingBanner } from "@/components/home-page-components/free-shipping-banner";
import { Bestsellers } from "@/components/home-page-components/best-sellers";

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
  );
}
