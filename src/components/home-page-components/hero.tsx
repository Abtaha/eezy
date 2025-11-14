import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"


export function Hero() {
  return (
    <section className="bg-white text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight text-black">
              Timeless elegance 
              <br className="hidden md:block"/>
              meets modern design
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Discover our curated collection of premium clothing crafted with attention to detail and sustainable
              materials.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/store">
                    <Button size="lg" className="gap-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-none cursor-pointer">
                        Shop Collection
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
