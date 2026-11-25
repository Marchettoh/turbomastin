import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
const root = resolve("dist-nested");
const base = "/turbomastin/";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!pathname.startsWith(base)) {
      res.writeHead(404);
      res.end();
      return;
    }
    let path = resolve(root, pathname.slice(base.length));
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
      await stat(path);
    } catch {
      path = resolve(root, "404.html");
      status = 404;
    }
    const body = await readFile(path);
    res.writeHead(status, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(400);
    res.end();
  }
}).listen(4322, "127.0.0.1", () =>
  console.log("QA statico: http://127.0.0.1:4322/turbomastin/"),
);
