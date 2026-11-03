/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const mountPoint = document.getElementById('nexeno_theme')
if (mountPoint) {
	createApp(App).use(router).mount(mountPoint)
}
