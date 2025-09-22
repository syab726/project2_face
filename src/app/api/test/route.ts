export async function GET() {
  return new Response(JSON.stringify({
    message: "Simple test API",
    timestamp: new Date().toISOString(),
    status: "ok"
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}