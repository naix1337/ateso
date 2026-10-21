import {redirect} from 'react-router';

export function redirectIfHandleIsLocalized(
  request: Request,
  ...localizedResources: Array<{
    handle: string;
    data: {handle: string} & unknown;
  }>
) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  localizedResources.forEach(({handle, data}) => {
    if (handle !== data.handle) {
      url.pathname = url.pathname.replace(handle, data.handle);
      shouldRedirect = true;
    }
  });

  if (shouldRedirect) {
    throw redirect(url.toString());
  }
}

/**
 * Nur relative Pfade derselben Origin zulassen (Schutz vor Open Redirects).
 * Gibt Pfad + Query zurück oder `fallback`.
 */
export function safeLocalPath(value: unknown, requestUrl: string, fallback = '/') {
  if (typeof value !== 'string' || !value.startsWith('/') || /[\\\u0000-\u001f]/.test(value)) {
    return fallback;
  }
  try {
    const origin = new URL(requestUrl).origin;
    const target = new URL(value, origin);
    return target.origin === origin ? `${target.pathname}${target.search}` : fallback;
  } catch {
    return fallback;
  }
}
