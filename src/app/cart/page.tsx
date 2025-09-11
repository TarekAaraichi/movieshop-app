import React from "react";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Your Cart</h1>
        <div className="space-y-4">
          {/* Example cart item */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              <img
                src="https://via.placeholder.com/80"
                alt="Product"
                className="w-20 h-20 object-cover rounded-md"
              />
              <div>
                <h2 className="text-lg font-semibold text-blue-500">
                  Movie Title
                </h2>
                <p className="text-sm text-gray-500">Category: Action</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-lg font-medium text-gray-800">$12.99</p>
              <button className="text-red-500 hover:text-red-700 font-medium">
                Remove
              </button>
            </div>
          </div>
          {/* End of example cart item */}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-800">Total: $12.99</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
