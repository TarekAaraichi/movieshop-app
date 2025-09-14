// Server-side Better Auth wrapper (scaffold)
// Replace the pseudo imports below with the actual Better Auth server SDK imports

// Example (pseudo):
// import { betterAuth, getSession } from '@better-auth/sdk/server'
// import { username } from '@better-auth/sdk/plugins/username'
import prisma from "./prisma";

export async function getCurrentUser() {
  // TODO: replace with actual Better Auth session retrieval
  // const session = await getSession();
  const session = null; // placeholder
  if (!session) return null;

  const email = session.user?.email;
  if (!email) return null;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: session.user?.name ?? "", isAnonymous: false },
    });
  }
  return user;
}
