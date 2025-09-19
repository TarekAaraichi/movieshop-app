const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log(
      'Searching for users with name/email containing "atest" (case-insensitive)...'
    );
    const matches = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "atest", mode: "insensitive" } },
          { name: { contains: "atest", mode: "insensitive" } },
        ],
      },
    });

    console.log(`Found ${matches.length} matching user(s).`);
    if (matches.length > 0) {
      for (const u of matches) {
        console.log(` - ${u.id} ${u.email} (${u.name})`);
      }
      console.log("Deleting matching users...");
      const ids = matches.map((u) => u.id);
      const del = await prisma.user.deleteMany({ where: { id: { in: ids } } });
      console.log(`Deleted ${del.count} user(s).`);
    } else {
      console.log("No matching users to delete.");
    }

    // Now attempt sign-up via the auth endpoint
    const signup = {
      name: "atest",
      email: "atest@example.com",
      password: "password",
    };
    const endpoint = process.env.BASE_URL || "http://localhost:3000";
    const url = endpoint + "/api/auth/sign-up/email";
    console.log("Posting sign-up to", url);

    // Use global fetch (Node 18+). If not available, require node-fetch
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
      const nf = await import("node-fetch");
      fetchFn = nf.default || nf;
    }

    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signup),
    });

    const text = await res.text();
    console.log("Sign-up response status:", res.status);
    console.log("Sign-up response body:", text);

    // Check DB for new user
    const newUser = await prisma.user.findUnique({
      where: { email: signup.email },
    });
    if (newUser) {
      console.log("User found in DB after sign-up:", {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      });
    } else {
      console.log("User NOT found in DB after sign-up.");
    }
  } catch (err) {
    console.error("ERROR", err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
