export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/bgg-api/, "") || "/thing";
  const target = new URL(`https://boardgamegeek.com/xmlapi2${path}`);
  target.search = url.search;

  const headers = new Headers(context.request.headers);
  headers.set("Authorization", `Bearer ${context.env.BGG_API_TOKEN || ""}`);
  headers.delete("Host");

  const response = await fetch(target, {
    method: context.request.method,
    headers,
    body: ["GET", "HEAD"].includes(context.request.method) ? undefined : context.request.body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, { status: response.status, headers: responseHeaders });
}
