<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DEFAULT_THEME_ID, renderDiagram } from '../lib/renderMermaid'
import { buildEditorLink, parseRenderParams } from '../lib/share'

const params = parseRenderParams()

const source = ref(params.source ?? '')
const themeId = ref(params.theme ?? DEFAULT_THEME_ID)
const paramError = ref(params.error)
const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const result = computed(() => renderDiagram(source.value, themeId.value))
const svg = computed(() => result.value.svg)
const renderError = computed(() => result.value.error)

const errorMessage = computed(() => paramError.value ?? renderError.value)

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

function copySource() {
  if (source.value) void writeClipboard(source.value, 'Source')
}

function downloadSvg() {
  if (svg.value) downloadBlob(svg.value, 'image/svg+xml', 'diagram.svg')
}

function openInEditor() {
  // Full navigation so main.ts re-evaluates and mounts the editor (no view=render).
  // The source travels in the hash and is restored by the editor on load.
  window.location.assign(buildEditorLink(source.value))
}

onMounted(() => {
  if (!params.source && !params.error) {
    paramError.value =
      'No diagram provided. Pass it via ?data=<JSON>, e.g. data="graph TD\\n  A-->B". ' +
      'Note: the diagram header (e.g. "graph TD") must be on its own line.'
  }
})
</script>

<template>
  <div class="render-only">
    <div class="render-toolbar">
      <button type="button" :disabled="!svg" @click="copySvg">Copy SVG</button>
      <button type="button" :disabled="!source" @click="copySource">Copy source</button>
      <button type="button" :disabled="!svg" @click="downloadSvg">Download SVG</button>
      <button type="button" :disabled="!source" @click="openInEditor">Open in editor</button>
    </div>

    <div class="render-stage">
      <div v-if="svg" class="svg-host" v-html="svg"></div>
      <p v-else-if="errorMessage" class="render-error" role="alert">{{ errorMessage }}</p>
      <p v-else class="render-empty">Nothing to render.</p>
    </div>

    <transition name="fade">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </transition>
  </div>
</template>

<style scoped>
.render-only {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.render-toolbar {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.75rem;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.render-stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: safe center;
  justify-content: safe center;
  padding: 1rem;
  background:
    repeating-conic-gradient(#eef0f3 0% 25%, #f7f8fa 0% 50%) 50% / 24px 24px;
}

.svg-host :deep(svg) {
  max-width: 100%;
  height: auto;
  display: block;
}

.render-error {
  color: var(--error);
  font-size: 0.9rem;
  max-width: 40rem;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
}

.render-empty {
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
