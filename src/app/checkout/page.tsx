import React from "react";

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full my-10">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Checkout</h1>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-800">
                            Full Name
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                            placeholder="john.doe@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Card Details
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                            placeholder="1234 5678 9012 3456"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Expiration Date
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                            placeholder="MM/YY"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            CVC
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                            placeholder="123"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Complete Purchase
                    </button>
                </form>
            </div>
        </div>
    );
}
