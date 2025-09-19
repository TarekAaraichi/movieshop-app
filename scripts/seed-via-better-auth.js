#!/usr/bin/env node
/*
  Seed via Better Auth endpoints.
  Usage: 1) Start dev server (localhost:3000). 2) Run `node scripts/seed-via-better-auth.js` or `npm run seed:auth`.

  This script will POST to `/api/auth/sign-up/email` for the demo user and the admin user
  so the auth library performs hashing and account linking. It retries requests a few times
  in case the dev server isn't ready yet.

  Assumptions:
  - Dev server is running on http://localhost:3000
  - The sign-up endpoint exists and accepts the body { name, email, password }
    (This matches Better Auth's email sign-up route used in the app.)
*/

// Use native fetch available in Node 18+. If not available, dynamically import a fetch polyfill.
let _fetch = null;
async function getFetch() {
  if (_fetch) return _fetch;
  if (globalThis.fetch) {
    _fetch = globalThis.fetch;
    return _fetch;
  }
  // dynamic import inside function so this file can run as CommonJS
  const mod = await import("node-fetch");
  _fetch = mod.default ?? mod;
  return _fetch;
}

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ENDPOINT = BASE + "/api/auth/sign-up/email";

const users = [
  { name: "Demo User", email: "demo@example.com", password: "password" },
  { name: "Admin User", email: "admin@example.com", password: "password" },
];

async function tryPost(url, body, maxRetries = 8, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const fetch = await getFetch();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        /* not json: */ void parseErr;
      }
      return { status: res.status, body: json ?? text };
    } catch (error) {
      // likely connection refused if dev server not running yet
      // reference the error to avoid lint complaints
      void error;
      process.stdout.write(".");
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Failed to POST to " + url + " after retries");
}

async function main() {
  console.log("\nSeeding users via Better Auth sign-up endpoint");
  console.log("Endpoint:", ENDPOINT);
  for (const u of users) {
    process.stdout.write(`\nCreating ${u.email} ... `);
    try {
      const { status, body } = await tryPost(ENDPOINT, u, 12, 1000);
      if (status >= 200 && status < 300) {
        console.log("OK", status);
      } else if (status === 409 || (body && body.code === "USER_EXISTS")) {
        console.log("Already exists", status, body);
      } else {
        console.log("Failed", status, body);
      }
    } catch (err) {
      console.log("\nError creating user:", err.message);
    }
  }

  console.log(
    "\nDone. Try signing in with the seeded accounts at /api/auth/sign-in/email"
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
