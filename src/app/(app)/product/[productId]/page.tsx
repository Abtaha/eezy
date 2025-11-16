"use client"

import ProductCard from '@/components/product-card';
import ProductRating from '@/components/product-rating';
import CommentSection from '@/components/comment-section';
import { use, useState } from 'react';

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

// Dummy comments
const DUMMY_COMMENTS = [
  {
    id: "1",
    authorName: "Mew",
    authorInitial: "M",
    avatarColor: "bg-pink-500",
    text: "Absolutely love this hoodie! The fabric is so soft and the pink color is exactly as shown.",
    timestamp: "2 days ago"
  },
  {
    id: "2",
    authorName: "Squirtle",
    authorInitial: "S",
    avatarColor: "bg-blue-500",
    text: "Fits true to size and the kangaroo pocket is surprisingly spacious. Already ordered two more in different colors.",
    timestamp: "5 days ago"
  },
  {
    id: "3",
    authorName: "Bulbasaur",
    authorInitial: "B",
    avatarColor: "bg-green-500",
    text: "Nice hoodie but runs a bit small. I usually wear M but needed L for a comfortable fit.",
    timestamp: "1 week ago"
  },
  {
    id: "4",
    authorName: "Mewtwo",
    authorInitial: "M",
    avatarColor: "bg-purple-500",
    text: "Incredibly cozy. Highly recommend! ⭐⭐⭐⭐⭐",
    timestamp: "2 weeks ago"
  }
];

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const [currentImage, setCurrentImage] = useState<'front' | 'back'>('front');
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Product Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* LEFT SIDE: Product Images */}
            <div className="space-y-4">
              {/* Main Image Display */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={currentImage === 'front' ? DUMMY_PRODUCT.imageFront : DUMMY_PRODUCT.imageBack}
                  alt={DUMMY_PRODUCT.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Thumbnails */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentImage('front')}
                  className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentImage === 'front' 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={DUMMY_PRODUCT.imageFront}
                    alt="Front view"
                    className="w-full h-full object-cover"
                  />
                </button>
                
                <button
                  onClick={() => setCurrentImage('back')}
                  className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentImage === 'back' 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={DUMMY_PRODUCT.imageBack}
                    alt="Back view"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
            
            {/* RIGHT SIDE: Product Details */}
            <div className="flex flex-col">
              {/* Product Name & Category */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {DUMMY_PRODUCT.name}
              </h1>
              <p className="text-gray-600 mb-4">{DUMMY_PRODUCT.category}</p>
              
              {/* Rating Display */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < DUMMY_PRODUCT.rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({DUMMY_PRODUCT.rating} stars)
                </span>
              </div>
              
              {/* Price */}
              <p className="text-4xl font-bold text-gray-900 mb-6">
                ${DUMMY_PRODUCT.price.toFixed(2)}
              </p>
              
              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{DUMMY_PRODUCT.description}</p>
              </div>
              
              {/* Stock Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Stock: <span className={`font-semibold ${DUMMY_PRODUCT.stock > 5 ? 'text-green-600' : 'text-orange-600'}`}>
                    {DUMMY_PRODUCT.stock} available
                  </span>
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
        
        {/* Rating Component - Only shown when logged in */}
        <ProductRating 
          productId={productId} 
          isLoggedIn={true}  // TODO: Connect to actual auth later - set to true for testing
        />
        
        {/* Comments Section */}
        <CommentSection comments={DUMMY_COMMENTS} />
        
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