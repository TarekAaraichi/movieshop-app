/**
 * API: /api/cart/debug
 * Debugging helper for cart-related issues during development.
 */

// Debug endpoint removed — return 404 to avoid exposing internal state.
export async function GET() {
  return new Response(null, { status: 404 });
}
