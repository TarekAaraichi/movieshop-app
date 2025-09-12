"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    line1: z.string().min(2, "Address required"),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    paymentToken: z.string().optional(),
});

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        const parsed = schema.safeParse(payload);
            if (!parsed.success) {
                const formatted: Record<string, string> = {};
                const flat = parsed.error.flatten();
                for (const [k, v] of Object.entries(flat.fieldErrors)) {
                    formatted[k] = Array.isArray(v) ? v[0] ?? 'Invalid' : 'Invalid';
                }
                setErrors(formatted);
                return;
            }

        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(parsed.data),
            });
            const json = await res.json();
            if (!res.ok) {
                setErrors({ _form: json.error || 'Something went wrong' });
                setLoading(false);
                return;
            }
            // redirect to order confirmation
            router.push(`/orders/${json.orderId}`);
            } catch {
                setErrors({ _form: 'Network error' });
                setLoading(false);
            }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full my-10">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Checkout</h1>
                <form className="space-y-4" onSubmit={onSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-800">Full Name</label>
                        <input name="fullName" type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="John Doe" />
                        {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input name="email" type="email" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="john.doe@example.com" />
                        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                        <input name="line1" type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="Street address" />
                        {errors.line1 && <p className="text-red-600 text-sm">{errors.line1}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input name="city" type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="City" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                            <input name="postalCode" type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="ZIP" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                            <input name="country" type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="Country" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Card Details</label>
                        <input name="paymentToken" type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" placeholder="simulated-card-token" />
                    </div>

                    {errors._form && <p className="text-red-600 text-sm">{errors._form}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        {loading ? 'Processing...' : 'Complete Purchase'}
                    </button>
                </form>
            </div>
        </div>
    );
}
