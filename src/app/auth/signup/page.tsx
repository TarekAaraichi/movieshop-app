"use client";
import React from "react";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-centerbg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 py-12">
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Create an Account</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert("Replace with Better Auth signUp call");
                    }}
                >
                    <label className="block mb-4">
                        <span className="text-sm font-medium text-gray-700">Email</span>
                        <input
                            name="email"
                            type="email"
                            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                    <label className="block mb-4">
                        <span className="text-sm font-medium text-gray-700">Password</span>
                        <input
                            name="password"
                            type="password"
                            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                    <label className="block mb-4">
                        <span className="text-sm font-medium text-gray-700">Username</span>
                        <input
                            name="username"
                            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                    <label className="block mb-6">
                        <span className="text-sm font-medium text-gray-700">Display username (optional)</span>
                        <input
                            name="displayUsername"
                            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                    <button className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition">
                        Sign up
                    </button>
                </form>
            </div>
        </div>
    );
}
