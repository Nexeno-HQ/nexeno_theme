/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import axios from '@nextcloud/axios'
import { translate as t } from '@nextcloud/l10n'
import { generateOcsUrl, generateUrl } from '@nextcloud/router'
import { reactive } from 'vue'

const API_BASE = generateUrl('/apps/nexeno_theme')

export const state = reactive({
	themeVariant: 'off',
	themeLastVariant: 'system',
	// Installed version, read from the server (appinfo/info.xml).
	appVersion: '',
	themeSaving: false,
	// The server decides: 7 days after install, and not closed in the last 7 days or turned off.
	ratePromptVisible: false,
	// The high-contrast theme chosen in Nextcloud ('light-highcontrast' or 'dark-highcontrast'), or null. It is
	// applied instead of the Nexeno variant until the user picks one, which turns it off (setThemeVariant()).
	highContrastTheme: null,
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
	state.highContrastTheme = typeof data.highContrastTheme === 'string' ? data.highContrastTheme : null
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
	// Another tab (or the settings page) changed the variant: show it here too, otherwise a click on the
	// option still shown as selected is ignored (DashboardView's selectVariant() skips the current variant).
	// A channel never receives its own messages, so this tab's saves do not come back here.
	variantChannel.onmessage = (event) => {
		const variant = event.data && typeof event.data === 'object' ? event.data.variant : event.data
		// Only this app's own pages post on this channel; they check the variant before sending it.
		if (typeof variant !== 'string') {
			return
		}
		state.themeVariant = variant
		if (variant !== 'off') {
			state.themeLastVariant = variant
		}
	}
} catch {
	variantChannel = null
}

function applyVariantInPlace(variant, enabledThemes, userThemes) {
	// js/nexeno-state.js, loaded on every page including this one, applies the variant and theme markers
	// when this message arrives, and resolves the theme ids itself (normalizeThemes). userThemes tells it the
	// user's Nextcloud themes, which change when high contrast was turned off. A channel also delivers to the
	// other listeners in the same tab.
	// Nextcloud's own theme stylesheets are not reloaded: they are all on the page already and follow the
	// data-theme-* markers.
	variantChannel?.postMessage({ variant, themes: enabledThemes, userThemes })
}

/**
 * Turns Nextcloud's high contrast off the way Nextcloud's own theme list does: its default theme on, the
 * high-contrast theme off. Picking a Nexeno option is the way out of high contrast (the last click wins).
 */
async function leaveHighContrast() {
	const chosen = state.highContrastTheme
	if (!chosen) {
		return
	}
	await axios.put(generateOcsUrl('apps/theming/api/v1/theme/{themeId}/enable', { themeId: 'default' }))
	await axios.delete(generateOcsUrl('apps/theming/api/v1/theme/{themeId}', { themeId: chosen }))
	state.highContrastTheme = null
}

export async function setThemeVariant(variant) {
	const previous = state.themeVariant
	const previousLast = state.themeLastVariant

	state.themeVariant = variant
	if (variant !== 'off') {
		state.themeLastVariant = variant
	}

	state.themeSaving = true
	try {
		// Only when a Nexeno option is picked while the theme is on (also the one saved before, which is not
		// shown as chosen during high contrast); turning the theme on or off keeps the user's high contrast.
		if (variant !== 'off' && previous !== 'off') {
			await leaveHighContrast()
		}
		const { data } = await axios.put(`${API_BASE}/variant`, { variant })
		applyVariantInPlace(variant, data.enabledThemes, data.userThemes)
	} catch (e) {
		state.themeVariant = previous
		state.themeLastVariant = previousLast
		// The same toast the settings page shows (OCP.Toast is Nextcloud core's).
		window.OCP?.Toast?.error(e.response?.data?.message || t('nexeno_theme', 'Could not save the theme setting.'))
	} finally {
		state.themeSaving = false
	}
}
