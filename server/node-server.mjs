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
import zlib from 'node:zlib';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const clientDir = join(root, 'dist', 'client');
const port = Number(process.env.PORT ?? 3000);

/**
 * Öffentliche Origin (z. B. https://ateso.store). Gesetzt → Host-/Proto-Header
 * des Requests werden ignoriert. Sonst nur geprüfte Werte, und
 * X-Forwarded-Proto nur mit TRUST_PROXY=true (hinter eigenem Reverse Proxy).
 */
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN
  ? new URL(process.env.PUBLIC_ORIGIN).origin
  : null;
const TRUST_PROXY = process.env.TRUST_PROXY === 'true';
const HOST_PATTERN = /^[a-z0-9.-]+(:\d{1,5})?$/i;

function requestOrigin(req) {
  if (PUBLIC_ORIGIN) return PUBLIC_ORIGIN;
  const forwarded = String(req.headers['x-forwarded-proto'] ?? '')
    .split(',')[0]
    .trim();
  const proto =
    TRUST_PROXY && (forwarded === 'https' || forwarded === 'http')
      ? forwarded
      : 'http';
  const host = String(req.headers.host ?? '');
  return `${proto}://${HOST_PATTERN.test(host) ? host : `localhost:${port}`}`;
}

const COMPRESSIBLE =
  /^(text\/|application\/(json|javascript|xml)|image\/svg\+xml)/;

/** Antwort-Stream je nach Accept-Encoding mit Brotli/Gzip komprimieren. */
function encode(req, headers, type) {
  const accept = String(req.headers['accept-encoding'] ?? '');
  if (!type || !COMPRESSIBLE.test(type) || headers['content-encoding'])
    return null;
  delete headers['content-length'];
  headers['vary'] = headers['vary']
    ? `${headers['vary']}, Accept-Encoding`
    : 'Accept-Encoding';
  if (/\bbr\b/.test(accept)) {
    headers['content-encoding'] = 'br';
    return zlib.createBrotliCompress({
      // Flush je Chunk, damit gestreamtes SSR-HTML sofort ankommt
      flush: zlib.constants.BROTLI_OPERATION_FLUSH,
      params: {[zlib.constants.BROTLI_PARAM_QUALITY]: 5},
    });
  }
  if (/\bgzip\b/.test(accept)) {
    headers['content-encoding'] = 'gzip';
    return zlib.createGzip({level: 6, flush: zlib.constants.Z_SYNC_FLUSH});
  }
  return null;
}

function send(req, res, status, headers, body) {
  const encoder = encode(req, headers, headers['content-type']);
  res.writeHead(status, headers);
  if (!body || req.method === 'HEAD') return res.end();
  if (encoder) body.pipe(encoder).pipe(res);
  else body.pipe(res);
}

// Worker-APIs, die Oxygen bereitstellt
globalThis.caches ??= {
  open: async () => ({
    match: async () => undefined,
    put: async () => {},
    delete: async () => false,
  }),
};

const {default: worker} = await import(
  new URL('../dist/server/index.js', import.meta.url).href
);

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

async function serveStatic(pathname, req, res) {
  if (pathname === '/' || pathname.endsWith('/')) return false;
  const file = normalize(join(clientDir, decodeURIComponent(pathname)));
  if (!file.startsWith(clientDir)) return false;
  try {
    const info = await stat(file);
    if (!info.isFile()) return false;
    const hashed =
      pathname.startsWith('/assets/') && /-[\w-]{8,}\.\w+$/.test(pathname);
    send(
      req,
      res,
      200,
      {
        'content-type':
          MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
        'content-length': String(info.size),
        'cache-control': hashed
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=3600',
      },
      createReadStream(file),
    );
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', requestOrigin(req));

    if (
      (req.method === 'GET' || req.method === 'HEAD') &&
      (await serveStatic(url.pathname, req, res))
    )
      return;

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
      waitUntil: (promise) =>
        Promise.resolve(promise).catch((err) => console.error(err)),
      passThroughOnException: () => {},
    });

    const outHeaders = {};
    response.headers.forEach((value, key) => {
      if (key !== 'set-cookie') outHeaders[key] = value;
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) outHeaders['set-cookie'] = cookies;
    send(
      req,
      res,
      response.status,
      outHeaders,
      response.body ? Readable.fromWeb(response.body) : null,
    );
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Internal Server Error');
  }
});

server.listen(port, () =>
  console.log(`ateso läuft auf http://localhost:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => server.close(() => process.exit(0)));
