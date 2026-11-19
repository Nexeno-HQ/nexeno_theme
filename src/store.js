/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import axios from '@nextcloud/axios'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { reactive } from 'vue'

const API_BASE = generateUrl('/apps/nexeno_theme')

export const state = reactive({
	themeVariant: 'off',
	themeLastVariant: 'system',
	// Installed version, read from the server (appinfo/info.xml).
	appVersion: '',
	themeSaving: false,
	themeError: '',
	// The server decides: 7 days after install, and not closed in the last 7 days or turned off.
	ratePromptVisible: false,
	// "Nexeno project coming soon" bar; false once the user closed it in this browser.
	projectBannerVisible: !isProjectBannerDismissed(),
})

/**
 * localStorage key for the closed Nexeno project bar. It includes the user id (Nextcloud puts it on
 * <head data-user>), so people sharing a browser each decide for themselves.
 */
function projectBannerKey() {
	return `nexeno_theme:project-banner-dismissed:${document.head?.dataset?.user ?? ''}`
}

function isProjectBannerDismissed() {
	try {
		return window.localStorage.getItem(projectBannerKey()) === '1'
	} catch {
		return false
	}
}

export async function refresh() {
	const { data } = await axios.get(`${API_BASE}/api/status`)
	state.themeVariant = data.themeVariant ?? 'off'
	state.themeLastVariant = data.themeLastVariant ?? 'system'
	state.appVersion = data.appVersion ?? ''
	state.ratePromptVisible = data.ratePromptVisible === true
}

/**
 * Hides the Nexeno project bar and remembers it in this browser, so it never comes back here.
 */
export function dismissProjectBanner() {
	state.projectBannerVisible = false
	try {
		window.localStorage.setItem(projectBannerKey(), '1')
	} catch {
		// Storage blocked (private window, site data off): the bar comes back next visit, which is harmless.
	}
}

/**
 * Hides the rating popup at once and saves the answer: "later", "never" or "rated".
 * If saving fails the popup simply returns on the next visit, so the error is not shown.
 *
 * @param {'later'|'never'|'rated'} action The user's answer
 */
export async function answerRatePrompt(action) {
	state.ratePromptVisible = false
	try {
		await axios.put(`${API_BASE}/rate-prompt`, { action })
	} catch {
		// Not saved: the popup comes back next time, which is harmless.
	}
}

let variantChannel = null
try {
	variantChannel = new BroadcastChannel('nexeno_theme-variant')
} catch {
	variantChannel = null
}

const NEXENO_VARIANT_ATTRIBUTES = ['data-nexeno', 'data-nexeno-light', 'data-nexeno-dark']

function applyVariantInPlace(variant, enabledThemes) {
	// "system" shows Nexeno light or dark to match the device setting.
	const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
	const resolved = variant === 'system' ? (prefersDark ? 'dark' : 'light') : variant
	// The server sends Nextcloud's "default" theme for "system"; use the same light or dark theme as the Nexeno option.
	if (variant === 'system' && Array.isArray(enabledThemes)) {
		enabledThemes = enabledThemes.map((id) => (id === 'default' ? resolved : id))
	}

	// Other tabs (js/nexeno-state.js) apply the same variant and theme markers.
	variantChannel?.postMessage({ variant, themes: enabledThemes })

	for (const element of [document.documentElement, document.body]) {
		NEXENO_VARIANT_ATTRIBUTES.forEach((attribute) => element.removeAttribute(attribute))
		if (resolved === 'light' || resolved === 'dark') {
			element.setAttribute('data-nexeno', '')
			element.setAttribute(`data-nexeno-${resolved}`, '')
		}
	}

	if (Array.isArray(enabledThemes) && enabledThemes.length > 0) {
		const body = document.body
		Array.from(body.attributes)
			.map((attribute) => attribute.name)
			.filter((name) => name.startsWith('data-theme-'))
			.forEach((name) => body.removeAttribute(name))
		enabledThemes.forEach((id) => body.setAttribute(`data-theme-${id}`, ''))
		body.dataset.themes = enabledThemes.join(',')
	}

	document.head.querySelectorAll('link.theme').forEach((link) => {
		const url = new URL(link.href)
		url.searchParams.set('v', String(Date.now()))
		const replacement = link.cloneNode()
		replacement.href = url.toString()
		replacement.onload = () => link.remove()
		document.head.appendChild(replacement)
	})
}

export async function setThemeVariant(variant) {
	const previous = state.themeVariant

	state.themeVariant = variant
	if (variant !== 'off') {
		state.themeLastVariant = variant
	}

	state.themeSaving = true
	try {
		const { data } = await axios.put(`${API_BASE}/variant`, { variant })
		applyVariantInPlace(variant, data.enabledThemes)
	} catch (e) {
		state.themeVariant = previous
		state.themeError = e.response?.data?.message || t('nexeno_theme', 'Could not save the theme setting.')
	} finally {
		state.themeSaving = false
	}
}
