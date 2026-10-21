/**
 * Node-Server für Self-Hosting (Docker). Führt den Hydrogen-Worker-Build
 * (dist/server/index.js) unter Node aus und liefert dist/client statisch aus.
 *
 * Unterschiede zu Oxygen:
 * - kein Edge-Cache: `caches` ist ein No-op (Storefront-Antworten werden nicht gecacht)
 * - waitUntil-Arbeit läuft im Hintergrund weiter, ohne Garantie bei Shutdown
 * - kein Oxygen-Geo/Request-Header (z. B. oxygen-buyer-ip)
 *
 * Aufruf: npm run build && npm run start:node
 */
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {extname, join, normalize, resolve} from 'node:path';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const clientDir = join(root, 'dist', 'client');
const port = Number(process.env.PORT ?? 3000);

// Worker-APIs, die Oxygen bereitstellt
globalThis.caches ??= {
  open: async () => ({match: async () => undefined, put: async () => {}, delete: async () => false}),
};

const {default: worker} = await import(new URL('../dist/server/index.js', import.meta.url).href);

const MIME = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.glb': 'model/gltf-binary',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

async function serveStatic(pathname, res) {
  if (pathname === '/' || pathname.endsWith('/')) return false;
  const file = normalize(join(clientDir, decodeURIComponent(pathname)));
  if (!file.startsWith(clientDir)) return false;
  try {
    const info = await stat(file);
    if (!info.isFile()) return false;
    const hashed = pathname.startsWith('/assets/') && /-[\w-]{8,}\.\w+$/.test(pathname);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    });
    createReadStream(file).pipe(res);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  try {
    const proto = req.headers['x-forwarded-proto'] ?? 'http';
    const url = new URL(req.url ?? '/', `${proto}://${req.headers.host ?? `localhost:${port}`}`);

    if ((req.method === 'GET' || req.method === 'HEAD') && (await serveStatic(url.pathname, res))) return;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
      else if (value != null) headers.set(key, value);
    }
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const request = new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: hasBody ? 'half' : undefined,
    });

    const response = await worker.fetch(request, process.env, {
      waitUntil: (promise) => Promise.resolve(promise).catch((err) => console.error(err)),
      passThroughOnException: () => {},
    });

    const outHeaders = {};
    response.headers.forEach((value, key) => {
      if (key !== 'set-cookie') outHeaders[key] = value;
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) outHeaders['set-cookie'] = cookies;
    res.writeHead(response.status, outHeaders);

    if (response.body && req.method !== 'HEAD') {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Internal Server Error');
  }
});

server.listen(port, () => console.log(`ateso läuft auf http://localhost:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
