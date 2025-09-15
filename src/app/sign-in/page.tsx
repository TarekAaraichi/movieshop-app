"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "./form";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
    const router = useRouter();

    // Redirect if there's an active session/user (only use what's provided by authClient)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                let sessionOrUser: any = null;
                if (typeof authClient?.getSession === "function") {
                    sessionOrUser = await authClient.getSession();
                } else if (typeof authClient?.getUser === "function") {
                    sessionOrUser = await authClient.getUser();
                }
                if (mounted && sessionOrUser) {
                    router.replace("/");
                }
            } catch {
                // ignore and stay on sign-in page
            }
        })();
        return () => {
            mounted = false;
        };
    }, [router]);

    const handleOAuth = async (provider: "google" | "github") => {
        try {
            const url =
                typeof authClient?.getOAuthUrl === "function"
                    ? await authClient.getOAuthUrl(provider)
                    : `/api/auth/${provider}`;
            window.location.href = url;
        } catch {
            window.location.href = `/api/auth/${provider}`;
        }
    };

    return (
        <main style={{ maxWidth: 420, margin: "48px auto", padding: 20 }}>
            <h1 style={{ marginBottom: 8 }}>Sign in</h1>
            <p style={{ marginTop: 0, color: "#666", marginBottom: 20 }}>
                Sign in to continue to MovieShop
            </p>

            <SignInForm onSuccess={(redirectTo?: string) => router.push(redirectTo ?? "/")} />

            <div style={{ textAlign: "center", margin: "14px 0", color: "#666" }}>or sign in with</div>

            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => handleOAuth("google")}
                    style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        background: "white",
                        cursor: "pointer",
                    }}
                >
                    Continue with Google
                </button>

                <button
                    onClick={() => handleOAuth("github")}
                    style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        background: "white",
                        cursor: "pointer",
                    }}
                >
                    Continue with GitHub
                </button>
            </div>

            <p style={{ marginTop: 18, color: "#666", fontSize: 13 }}>
                Don't have an account? <a href="/sign-up">Create one</a>
            </p>
        </main>
    );
}
