const CANONICAL_HOST = "algodrills.com";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const normalized = new URL(url);

  normalized.protocol = "https:";
  normalized.hostname = CANONICAL_HOST;

  if (shouldUseTrailingSlash(normalized.pathname)) {
    normalized.pathname = `${normalized.pathname}/`;
  }

  if (normalized.toString() !== url.toString()) {
    return Response.redirect(normalized.toString(), 301);
  }

  return context.next();
}

function shouldUseTrailingSlash(pathname) {
  if (pathname === "/") return false;
  if (pathname.endsWith("/")) return false;
  return !pathname.split("/").pop().includes(".");
}
