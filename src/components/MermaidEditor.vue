<script setup lang="ts">
defineProps<{
  modelValue: string
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'copy-source'): void
  (e: 'download-source'): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <section class="editor">
    <div class="panel-head">
      <h2 class="panel-title">Mermaid source</h2>
      <div class="panel-actions">
        <button type="button" @click="emit('copy-source')">Copy source</button>
        <button type="button" @click="emit('download-source')">Download .mmd</button>
      </div>
    </div>

    <textarea
      class="code-area"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      :value="modelValue"
      placeholder="Type or paste Mermaid here…"
      @input="onInput"
    ></textarea>

    <p v-if="error" class="error" role="alert">
      <strong>Render error:</strong> {{ error }}
    </p>
  </section>
</template>
