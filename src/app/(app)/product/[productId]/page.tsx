"use client"

import ProductCard from '@/components/product-card';
import { use } from 'react';

// Dummy product data
const DUMMY_PRODUCT = {
  id: "1",
  imageFront: "https://placehold.co/400x400/fce7f3/ec4899?text=Pink+Hoodie+Front",
  imageBack: "https://placehold.co/400x400/fbcfe8/db2777?text=Pink+Hoodie+Back",
  name: "Cozy Pink Hoodie",
  category: "Hoodies & Sweatshirts",
  price: 49.99,
  rating: 5,
  description: "The perfect cozy hoodie for duck-loving students! Super soft fleece material, kangaroo pocket for storing snacks, and comes in the cutest shade of pink. Perfect for those late-night coding sessions or campus walks.",
  stock: 15
};

// Dummy related products
const RELATED_PRODUCTS = [
  {
    imageFront: "https://placehold.co/400x400/dbeafe/3b82f6?text=Blue+Tee",
    imageBack: "https://placehold.co/400x400/bfdbfe/2563eb?text=Blue+Tee+Back",
    name: "Classic Blue T-Shirt",
    category: "T-Shirts",
    price: 24.99,
    rating: 4
  },
  {
    imageFront: "https://placehold.co/400x400/dcfce7/10b981?text=Green+Jacket",
    imageBack: "https://placehold.co/400x400/bbf7d0/059669?text=Green+Jacket+Back",
    name: "Wind Breaker Jacket",
    category: "Jackets",
    price: 89.99,
    rating: 5
  },
  {
    imageFront: "https://placehold.co/400x400/fef3c7/f59e0b?text=Yellow+Sweater",
    imageBack: "https://placehold.co/400x400/fde68a/d97706?text=Yellow+Sweater+Back",
    name: "Duckling Yellow Sweater",
    category: "Sweaters",
    price: 39.99,
    rating: 4
  }
];

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Product ID Display (for debugging)
        <p className="text-sm text-gray-500 mb-4">Product ID: {productId}</p>*/}
        
        {/* Main Product Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Product Card */}
            <div>
              <ProductCard {...DUMMY_PRODUCT} />
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {DUMMY_PRODUCT.name}
              </h1>
              <p className="text-gray-600 mb-4">{DUMMY_PRODUCT.category}</p>
              
              <p className="text-4xl font-bold text-gray-900 mb-4">
                ${DUMMY_PRODUCT.price.toFixed(2)}
              </p>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{DUMMY_PRODUCT.description}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Stock: <span className="font-semibold">{DUMMY_PRODUCT.stock} available</span>
                </p>
              </div>
              
              {/* Add to Cart Button - TODO: Connect to CartContext */}
              <button 
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  DUMMY_PRODUCT.stock > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={DUMMY_PRODUCT.stock === 0}
              >
                {DUMMY_PRODUCT.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Comments Section - TODO */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
          <p className="text-gray-500 italic">Comments section coming soon...</p>
        </div>
        
        {/* Related Products */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RELATED_PRODUCTS.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}