/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Must run before any module that imports an image, so it stays first.
/* eslint-disable perfectionist/sort-imports */
import './publicPath.js'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
/* eslint-enable perfectionist/sort-imports */

const mountPoint = document.getElementById('nexeno_theme')
if (mountPoint) {
	createApp(App).use(router).mount(mountPoint)
}
