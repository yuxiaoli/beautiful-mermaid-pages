<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import MermaidEditor from './components/MermaidEditor.vue'
import SvgPreview from './components/SvgPreview.vue'
import {
  DEFAULT_THEME_ID,
  SAMPLE_DIAGRAM,
  THEME_OPTIONS,
  renderDiagram,
} from './lib/renderMermaid'
import {
  buildRenderLink,
  buildShareLink,
  resolveInitialSource,
  saveToStorage,
  updateHash,
} from './lib/share'

const source = ref(resolveInitialSource(SAMPLE_DIAGRAM))
const themeId = ref(DEFAULT_THEME_ID)
const svg = ref<string | null>(null)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined

const themeOptions = THEME_OPTIONS

function render() {
  const result = renderDiagram(source.value, themeId.value)
  svg.value = result.svg
  error.value = result.error
}

function scheduleRender() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(render, 300)
}

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2000)
}

async function writeClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToast(`${label} copied`)
  } catch {
    showToast(`Could not copy ${label.toLowerCase()}`)
  }
}

function downloadBlob(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function copySvg() {
  if (svg.value) void writeClipboard(svg.value, 'SVG')
}

function downloadSvg() {
  if (svg.value) downloadBlob(svg.value, 'image/svg+xml', 'diagram.svg')
}

function copySource() {
  void writeClipboard(source.value, 'Source')
}

function downloadSource() {
  downloadBlob(source.value, 'text/plain', 'diagram.mmd')
}

function copyShareLink() {
  void writeClipboard(buildShareLink(source.value), 'Share link')
}

function copyRenderLink() {
  void writeClipboard(buildRenderLink(source.value, themeId.value), 'Render link')
}

// React to source changes: persist, update hash, debounce-render.
watch(source, (value) => {
  saveToStorage(value)
  updateHash(value)
  scheduleRender()
})

// Re-render immediately when the theme changes.
watch(themeId, render)

onMounted(render)

const currentThemeLabel = computed(
  () => themeOptions.find((t) => t.id === themeId.value)?.label ?? themeId.value,
)
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Beautiful Mermaid Renderer</h1>
      <div class="header-controls">
        <label class="theme-select">
          <span class="sr-only">Theme</span>
          <select v-model="themeId" :title="`Theme: ${currentThemeLabel}`">
            <option v-for="opt in themeOptions" :key="opt.id" :value="opt.id">
              {{ opt.label }}
            </option>
          </select>
        </label>
        <button type="button" @click="copyShareLink">Copy share link</button>
        <button type="button" @click="copyRenderLink">Copy render link</button>
      </div>
    </header>

    <main class="app-main">
      <MermaidEditor
        v-model="source"
        :error="error"
        @copy-source="copySource"
        @download-source="downloadSource"
      />
      <SvgPreview
        :svg="svg"
        :error="error"
        @copy-svg="copySvg"
        @download-svg="downloadSvg"
      />
    </main>

    <footer class="app-footer">
      <span>Fully client-side — no backend, no server, no external rendering API.</span>
      <span class="footer-links">
        <a href="https://www.npmjs.com/package/beautiful-mermaid" target="_blank" rel="noopener noreferrer">
          beautiful-mermaid
        </a>
        <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer">Mermaid docs</a>
      </span>
    </footer>

    <transition name="fade">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </transition>
  </div>
</template>
