/**
 * URL hash sharing + localStorage persistence helpers.
 *
 * The diagram source is encoded into `location.hash` so a diagram can be shared
 * by simply copying the URL. Encoding uses URI-safe base64 of the UTF-8 bytes.
 */

const HASH_PREFIX = '#src='
const STORAGE_KEY = 'beautiful-mermaid:last-source'

/** Encode a UTF-8 string to URL-safe base64. */
function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Decode URL-safe base64 back to a UTF-8 string. */
function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/** Read the diagram source from the URL hash, or null when absent/invalid. */
export function readSourceFromHash(): string | null {
  const hash = window.location.hash
  if (!hash.startsWith(HASH_PREFIX)) {
    return null
  }
  try {
    const encoded = hash.slice(HASH_PREFIX.length)
    return decodeBase64Url(encoded)
  } catch {
    return null
  }
}

/** Build a full shareable URL for the given source. */
export function buildShareLink(source: string): string {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname}${search}${HASH_PREFIX}${encodeBase64Url(source)}`
}

/** Update `location.hash` in place without adding a new history entry. */
export function updateHash(source: string): void {
  const newHash = `${HASH_PREFIX}${encodeBase64Url(source)}`
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`)
}

/** Persist the latest source to localStorage. */
export function saveToStorage(source: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, source)
  } catch {
    // Ignore quota / disabled-storage errors; persistence is best-effort.
  }
}

/** Read the previously saved source from localStorage, or null. */
export function readFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Resolve the initial source on load.
 * Preference order: URL hash > localStorage > provided fallback (sample).
 */
export function resolveInitialSource(fallback: string): string {
  return readSourceFromHash() ?? readFromStorage() ?? fallback
}

/**
 * Build a link to the render-only endpoint for the given source + theme.
 * Encodes the source as a JSON string in the `data` query param.
 */
export function buildRenderLink(source: string, theme: string): string {
  const { origin, pathname } = window.location
  const params = new URLSearchParams({
    view: 'render',
    data: JSON.stringify(source),
    theme,
  })
  return `${origin}${pathname}?${params.toString()}`
}

/* -------------------------------------------------------------------------- */
/* Render-only endpoint params                                                */
/* -------------------------------------------------------------------------- */

export interface RenderParams {
  /** Whether the render-only view was requested (?view=render). */
  isRenderView: boolean
  /** Mermaid source decoded from the `data` JSON param, or null. */
  source: string | null
  /** Theme id from the `theme` param (overrides any theme in `data`), or null. */
  theme: string | null
  /** Parse error message when the `data` param was malformed, or null. */
  error: string | null
}

/**
 * Parse the render-only endpoint parameters from the URL query string.
 *
 * Usage: `?view=render&data=<url-encoded JSON>&theme=<theme-id>`
 *
 * The `data` param is JSON and may be either:
 *   - a string — interpreted directly as the Mermaid source, or
 *   - an object — `{ "source": "...", "theme": "..." }`.
 *
 * A top-level `theme` query param always takes precedence over a theme inside `data`.
 */
export function parseRenderParams(): RenderParams {
  const params = new URLSearchParams(window.location.search)
  const isRenderView = params.get('view') === 'render'
  const themeParam = params.get('theme')
  const dataParam = params.get('data')

  const result: RenderParams = {
    isRenderView,
    source: null,
    theme: themeParam,
    error: null,
  }

  if (dataParam === null) {
    return result
  }

  try {
    const parsed: unknown = JSON.parse(dataParam)
    if (typeof parsed === 'string') {
      result.source = parsed
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      if (typeof obj.source === 'string') {
        result.source = obj.source
      } else if (typeof obj.code === 'string') {
        result.source = obj.code
      } else {
        result.error = 'JSON object must contain a "source" (or "code") string.'
      }
      if (!themeParam && typeof obj.theme === 'string') {
        result.theme = obj.theme
      }
    } else {
      result.error = 'JSON "data" must be a string or an object.'
    }
  } catch {
    result.error = 'Invalid JSON in "data" parameter.'
  }

  return result
}
