/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Must run before any module that imports an image, so it stays first.
import './publicPath.js'
// eslint-disable-next-line perfectionist/sort-imports
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const mountPoint = document.getElementById('nexeno_theme')
if (mountPoint) {
	createApp(App).use(router).mount(mountPoint)
}
