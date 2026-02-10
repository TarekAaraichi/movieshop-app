# Deployment Guidelines for Student/Portfolio Next.js App

## Purpose

This guide helps you safely deploy your app using free cloud PostgreSQL providers and Vercel, minimizing risk and cost.

## Steps

1. **Use Demo/Test Data**
   - Seed your database with sample movies, users, and orders.
   - Avoid real or sensitive data.
   - Keep record counts low to stay within free tier limits.

2. **Restrict Public Access**
   - Disable or limit user sign-ups (allow only demo accounts).
   - Optionally require a password or simple authentication for access.

3. **Monitor Usage**
   - Check your cloud provider’s dashboard for storage and activity.
   - Set up alerts if available.

4. **Document Setup**
   - Add a note in your README about demo data, limited access, and free tier constraints.

5. **Environment Variables**
   - Use production DATABASE_URL and AUTH_SECRET from your cloud provider.
   - Set these securely in Vercel’s environment settings.

6. **Optional: Rate Limiting**
   - Add basic rate limiting or access control to prevent abuse.

## Recommended Providers

- Supabase, Railway, Neon, Render (all offer free PostgreSQL tiers)

## Example: Vercel Environment Variables

- DATABASE_URL: Your production database connection string
- AUTH_SECRET: A secure random string for authentication

## Security Tips

- Never use your own computer’s database for public deployment.
- Use demo/test data for portfolio apps.
- Limit features that could be abused (e.g., sign-ups, uploads).

---

**For more details or code samples, see the README or ask your instructor.**
