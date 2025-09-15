"use client";

import React, { useMemo, useState } from "react";

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const passwordsMatch = useMemo(
        () => password.length > 0 && password === confirmPassword,
        [password, confirmPassword]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch) return;
        setSubmitting(true);
        try {
            // Replace with real sign-up call
            console.log("Email:", email);
            console.log("Password:", password);
            // simulate
            await new Promise((r) => setTimeout(r, 600));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full my-10">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">
                    Create your account
                </h1>
                <p className="mb-6 text-sm leading-6 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-r from-white to-indigo-50 dark:from-transparent dark:via-gray-900 dark:to-gray-800">
                    <span className="text-gray-700 dark:text-gray-300">
                        Join the {""}
                    </span>
                    <span className="mr-2 inline-block align-middle bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold">
                        MovieShop
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                        club now to save favorites, get personalized recommendations, and discover trending films.
                    </span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            title="Enter your email address"
                            required
                            className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            aria-required
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Choose a strong password"
                            title="Enter your password"
                            required
                            className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            aria-required
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm password
                        </span>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            title="Re-enter your password for confirmation"
                            required
                            className={`mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                                confirmPassword.length === 0
                                    ? "border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
                                    : passwordsMatch
                                    ? "border-green-400 focus:ring-green-400"
                                    : "border-red-400 focus:ring-red-400"
                            }`}
                            aria-required
                        />
                    </label>

                    <div className="text-sm min-h-[1.25rem]">
                        {confirmPassword.length > 0 && !passwordsMatch ? (
                            <p className="text-red-600 dark:text-red-400">Passwords do not match</p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                                Use at least 8 characters for a stronger password.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!passwordsMatch || submitting || !email}
                        className={`w-full flex justify-center items-center gap-2 rounded-lg px-4 py-2 text-white font-medium transition ${
                            !passwordsMatch || submitting || !email
                                ? "bg-indigo-300 dark:bg-indigo-700/40 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                        }`}
                        aria-disabled={!passwordsMatch || submitting || !email}
                    >
                        {submitting ? "Creating..." : "Create account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    By creating an account you agree to our <span className="text-indigo-600 dark:text-indigo-400">Terms</span>.
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
