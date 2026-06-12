<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  /** Pre-sanitized SVG markup, safe for v-html. */
  svg: string | null
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'copy-svg'): void
  (e: 'download-svg'): void
}>()

// Simple pan/zoom state applied via CSS transform.
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isPanning = ref(false)
let startX = 0
let startY = 0

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY < 0 ? 1.1 : 0.9
  scale.value = Math.min(8, Math.max(0.2, scale.value * delta))
}

function onPointerDown(event: PointerEvent) {
  isPanning.value = true
  startX = event.clientX - offsetX.value
  startY = event.clientY - offsetY.value
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isPanning.value) return
  offsetX.value = event.clientX - startX
  offsetY.value = event.clientY - startY
}

function onPointerUp() {
  isPanning.value = false
}

function reset() {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}
</script>

<template>
  <section class="preview">
    <div class="panel-head">
      <h2 class="panel-title">Preview</h2>
      <div class="panel-actions">
        <button type="button" @click="reset">Reset view</button>
        <button type="button" :disabled="!svg" @click="emit('copy-svg')">Copy SVG</button>
        <button type="button" :disabled="!svg" @click="emit('download-svg')">Download SVG</button>
      </div>
    </div>

    <div
      class="preview-stage"
      :class="{ panning: isPanning }"
      @wheel="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div
        v-if="svg"
        class="svg-host"
        :style="{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }"
        v-html="svg"
      ></div>
      <p v-else-if="error" class="preview-empty error">Cannot render — fix the source to see a preview.</p>
      <p v-else class="preview-empty">Nothing to preview yet.</p>
    </div>
  </section>
</template>
