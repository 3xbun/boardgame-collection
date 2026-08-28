export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, xc-token",
      },
    });
  }

  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/noco-api/, "") || "/";
  const target = new URL(`https://ndb.3xbun.com${path}`);
  target.search = url.search;

  const headers = new Headers(context.request.headers);
  headers.set("xc-token", context.env.NOCODB_API_TOKEN || "");
  headers.delete("Host");

  const response = await fetch(target, {
    method: context.request.method,
    headers,
    body: ["GET", "HEAD"].includes(context.request.method) ? undefined : context.request.body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, xc-token");
  return new Response(response.body, { status: response.status, headers: responseHeaders });
}
