"use client";

import { useParams, useRouter } from "next/navigation";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === Number(params.id));

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        data-testid="back-button"
        onClick={() => router.back()}
        className="text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center gap-1 font-medium"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            data-testid="product-detail-image"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span
            data-testid="product-detail-category"
            className="text-sm font-medium text-indigo-600 uppercase tracking-wide"
          >
            {product.category}
          </span>
          <h1
            data-testid="product-detail-name"
            className="text-3xl font-bold text-gray-900 mt-2"
          >
            {product.name}
          </h1>

          <div className="flex items-center mt-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-600">{product.rating} out of 5</span>
          </div>

          <p
            data-testid="product-detail-description"
            className="text-gray-600 mt-4 leading-relaxed text-lg"
          >
            {product.description}
          </p>

          <div className="mt-6">
            <span
              data-testid="product-detail-price"
              className="text-4xl font-bold text-gray-900"
            >
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center mt-3">
            <span
              data-testid="product-detail-stock"
              className={`text-sm font-medium ${
                product.inStock ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              data-testid="product-detail-add-to-cart"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button
              data-testid="product-detail-buy-now"
              onClick={() => {
                handleAddToCart();
                router.push("/checkout");
              }}
              disabled={!product.inStock}
              className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
