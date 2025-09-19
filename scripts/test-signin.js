const fetch = globalThis.fetch || require("node-fetch");

async function trySignIn() {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo@example.com",
          password: "password",
        }),
      });
      console.log("status", res.status);
      const text = await res.text();
      console.log("body", text);
      return;
    } catch (err) {
      console.log("attempt", i + 1, "failed", err.code || err.message);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.error("all attempts failed");
}

trySignIn();
