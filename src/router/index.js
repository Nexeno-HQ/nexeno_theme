/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createRouter, createWebHistory } from 'vue-router'
import { generateUrl } from '@nextcloud/router'
import DashboardView from '../views/DashboardView.vue'

/**
 * The page can be opened as /apps/nexeno_theme/ or /index.php/apps/nexeno_theme/ (also under a
 * sub-folder webroot). generateUrl() returns only one of the two forms, and a base that does not
 * match the address in the browser leaves the page blank, so take the base from the address itself.
 *
 * @param {string} pathname The path the page was opened at.
 */
export function routerBase(pathname = window.location.pathname) {
	const match = pathname.match(/^(.*?\/apps\/nexeno_theme)(?:\/|$)/)
	return match ? match[1] : generateUrl('/apps/nexeno_theme')
}

const router = createRouter({
	history: createWebHistory(routerBase()),
	routes: [
		{ path: '/', name: 'dashboard', component: DashboardView },
	],
	scrollBehavior() {
		return { top: 0 }
	},
})

export default router
