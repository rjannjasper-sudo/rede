/**
 * api-logger.ts
 * Wraps the native fetch with basic request / response logging.
 * Import `apiFetch` anywhere instead of raw `fetch`.
 */

// ── Log levels ────────────────────────────────────────────
type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, data?: unknown): void {
  const ts = new Date().toISOString();
  const prefix = `[API][${ts}]`;

  switch (level) {
    case 'info':  console.info( `%c${prefix} ${message}`, 'color:#6366f1;font-weight:600', data ?? ''); break;
    case 'warn':  console.warn( `${prefix} ${message}`, data ?? ''); break;
    case 'error': console.error(`${prefix} ${message}`, data ?? ''); break;
  }
}

// ── Request logger ────────────────────────────────────────
function logRequest(method: string, url: string, body?: unknown): void {
  log('info', `→ ${method.toUpperCase()} ${url}`, body ? { body } : undefined);
}

// ── Response logger ───────────────────────────────────────
function logResponse(
  method: string,
  url: string,
  status: number,
  durationMs: number,
  body?: unknown
): void {
  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  const icon = status >= 400 ? '✗' : '✓';
  log(level, `${icon} ${method.toUpperCase()} ${url} — ${status} (${durationMs}ms)`, body);
}

// ── apiFetch ──────────────────────────────────────────────
/**
 * Drop-in replacement for `fetch` with automatic request/response logging.
 *
 * @example
 * const res = await apiFetch('/api/records');
 * const data = await res.json();
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const url    = input instanceof Request ? input.url : String(input);

  // Parse request body for logging (JSON only)
  let requestBody: unknown;
  if (init.body) {
    try { requestBody = JSON.parse(init.body as string); } catch { requestBody = '[non-JSON body]'; }
  }

  logRequest(method, url, requestBody);

  const start = performance.now();

  try {
    const response = await fetch(input, init);
    const durationMs = Math.round(performance.now() - start);

    // Clone so the caller can still consume the body
    const clone = response.clone();
    let responseBody: unknown;
    try {
      const text = await clone.text();
      responseBody = text ? JSON.parse(text) : undefined;
    } catch {
      responseBody = '[non-JSON response]';
    }

    logResponse(method, url, response.status, durationMs, responseBody);

    return response;
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    log('error', `✗ ${method} ${url} — Network error (${durationMs}ms)`, err);
    throw err;
  }
}

// ── Optional: intercept global fetch ─────────────────────
/**
 * Call once (e.g. in main.ts) to patch the global `fetch`
 * so ALL requests are logged automatically — no code changes needed.
 *
 * @example
 * import { installGlobalFetchLogger } from './utils/api-logger';
 * installGlobalFetchLogger();
 */
export function installGlobalFetchLogger(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const method = (init.method ?? 'GET').toUpperCase();
    const url    = input instanceof Request ? input.url : String(input);

    let requestBody: unknown;
    if (init.body) {
      try { requestBody = JSON.parse(init.body as string); } catch { requestBody = '[non-JSON body]'; }
    }

    logRequest(method, url, requestBody);

    const start = performance.now();

    try {
      const response = await originalFetch(input, init);
      const durationMs = Math.round(performance.now() - start);

      const clone = response.clone();
      let responseBody: unknown;
      try {
        const text = await clone.text();
        responseBody = text ? JSON.parse(text) : undefined;
      } catch {
        responseBody = '[non-JSON response]';
      }

      logResponse(method, url, response.status, durationMs, responseBody);
      return response;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      log('error', `✗ ${method} ${url} — Network error (${durationMs}ms)`, err);
      throw err;
    }
  };

  console.info('[API Logger] Global fetch interceptor installed.');
}
