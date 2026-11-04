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
	themeLastVariant: 'light',
	themeSaving: false,
	themeError: '',
})

export async function refresh() {
	const { data } = await axios.get(`${API_BASE}/api/status`)
	state.themeVariant = data.themeVariant ?? 'off'
	state.themeLastVariant = data.themeLastVariant ?? 'light'
}

let variantChannel = null
try {
	variantChannel = new BroadcastChannel('nexeno_theme-variant')
} catch (e) {
	variantChannel = null
}

const NEXENO_VARIANT_ATTRIBUTES = ['data-nexeno', 'data-nexeno-light', 'data-nexeno-dark']

function applyVariantInPlace(variant, enabledThemes) {
	// Other tabs (js/nexeno-state.js) apply the same variant and theme markers.
	variantChannel?.postMessage({ variant, themes: enabledThemes })

	for (const element of [document.documentElement, document.body]) {
		NEXENO_VARIANT_ATTRIBUTES.forEach((attribute) => element.removeAttribute(attribute))
		if (variant === 'light' || variant === 'dark') {
			element.setAttribute('data-nexeno', '')
			element.setAttribute(`data-nexeno-${variant}`, '')
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
