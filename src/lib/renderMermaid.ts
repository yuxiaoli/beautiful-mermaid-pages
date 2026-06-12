import { renderMermaidSVG, THEMES, type DiagramColors } from 'beautiful-mermaid'
import DOMPurify from 'dompurify'

/**
 * Theme options surfaced in the UI. Keys must exist in `beautiful-mermaid`'s THEMES map.
 * We include at least a light, dark, neutral and one colorful theme.
 */
export interface ThemeOption {
  /** Key passed to beautiful-mermaid THEMES. */
  id: string
  /** Human readable label for the selector. */
  label: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'github-light', label: 'Light (GitHub)' },
  { id: 'github-dark', label: 'Dark (GitHub)' },
  { id: 'nord', label: 'Neutral (Nord)' },
  { id: 'dracula', label: 'Colorful (Dracula)' },
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
  { id: 'solarized-light', label: 'Solarized Light' },
]

export const DEFAULT_THEME_ID = 'github-light'

/** Default sample diagram shown on first load. */
export const SAMPLE_DIAGRAM = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Ship it]
    B -->|No| D[Debug]
    D --> B
    C --> E[Celebrate]`

export interface RenderResult {
  /** Sanitized SVG markup safe for v-html, or null when rendering failed. */
  svg: string | null
  /** Readable error message when rendering failed, otherwise null. */
  error: string | null
}

/**
 * Resolve theme colors from a theme id. Unknown ids fall back to the default theme.
 */
function resolveThemeColors(themeId: string): DiagramColors {
  return THEMES[themeId] ?? THEMES[DEFAULT_THEME_ID]
}

/**
 * Render Mermaid source to a sanitized SVG string.
 *
 * Rendering is fully synchronous (beautiful-mermaid runs the ELK layout engine
 * synchronously) and runs entirely in the browser — no backend involved.
 * The output is sanitized with DOMPurify before it is injected via `v-html`.
 */
export function renderDiagram(source: string, themeId: string): RenderResult {
  const trimmed = source.trim()
  if (!trimmed) {
    return { svg: null, error: null }
  }

  try {
    const rawSvg = renderMermaidSVG(trimmed, resolveThemeColors(themeId))
    const clean = DOMPurify.sanitize(rawSvg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      // Mermaid SVGs use foreignObject/style for labels; keep them but sanitized.
      ADD_TAGS: ['foreignObject', 'style'],
      ADD_ATTR: ['dominant-baseline', 'pathLength'],
    })
    return { svg: clean, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { svg: null, error: message }
  }
}
