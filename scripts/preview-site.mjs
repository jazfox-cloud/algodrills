#!/usr/bin/env node

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const port = Number(process.env.PORT || 4321);
const types = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("..")) return send404(response);
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = path.join(root, pathname.replace(/^\/+/, ""));
  try {
    if (!(await stat(file)).isFile()) return send404(response);
    response.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    createReadStream(file).pipe(response);
  } catch {
    send404(response);
  }
}).listen(port, "127.0.0.1", () => console.log(`Previewing ${root} at http://127.0.0.1:${port}`));

function send404(response) {
  response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
  createReadStream(path.join(root, "404.html")).pipe(response);
}
