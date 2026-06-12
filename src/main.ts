import { createApp } from 'vue'
import type { Component } from 'vue'
import App from './App.vue'
import MermaidRenderer from './components/MermaidRenderer.vue'
import { parseRenderParams } from './lib/share'
import './styles.css'

// Static-hosting friendly "routing": pick the root component from the URL query.
// `?view=render` serves the embeddable render-only endpoint; otherwise the editor.
const root: Component = parseRenderParams().isRenderView ? MermaidRenderer : App

createApp(root).mount('#app')
