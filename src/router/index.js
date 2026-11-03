/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createRouter, createWebHistory } from 'vue-router'
import { generateUrl } from '@nextcloud/router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
	history: createWebHistory(generateUrl('/apps/nexeno_theme')),
	routes: [
		{ path: '/', name: 'dashboard', component: DashboardView },
	],
	scrollBehavior() {
		return { top: 0 }
	},
})

export default router
