// Debug endpoint removed — return 404 to avoid exposing internal state.
export async function GET() {
  return new Response(null, { status: 404 });
}
