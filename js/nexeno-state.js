/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'

	const VARIANTS = ['off', 'light', 'dark']

	const CORE_THEME_INPUTS = ['default', 'light', 'dark', 'light-highcontrast', 'dark-highcontrast', 'opendyslexic']
		.map(function(id) {
			return '.theming__preview--' + id + ' input'
		})
		.join(', ')

	// Nextcloud themes that stay on while a Nexeno variant is active (mirrors CoreTheming::KEEP_THEMES).
	const KEEP_THEMES = ['opendyslexic']

	let currentVariant = null
	let userThemes = null

	let channel = null
	try {
		channel = new BroadcastChannel('nexeno_theme-variant')
	} catch (e) {
		channel = null
	}

	function readInitialState(key) {
		const el = document.getElementById('initial-state-nexeno_theme-' + key)
		if (!el) {
			return null
		}
		try {
			return JSON.parse(atob(el.value))
		} catch (e) {
			return null
		}
	}

	function syncCoreThemeLock() {
		const locked = currentVariant === 'light' || currentVariant === 'dark'
		const inputs = document.querySelectorAll(CORE_THEME_INPUTS)
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].disabled = locked
		}
	}

	function syncSubOptionLock() {
		const enabled = currentVariant === 'light' || currentVariant === 'dark'
		const radios = document.querySelectorAll('input[name="nexeno_theme-variant"]')
		for (let i = 0; i < radios.length; i++) {
			radios[i].disabled = !enabled
		}
		const toggle = document.getElementById('nexeno_theme-enabled')
		if (toggle) {
			toggle.checked = enabled
		}
	}

	function updateFontOverrideGuard() {
		const body = document.body
		if (!body) {
			return
		}
		document.documentElement.toggleAttribute('data-nexeno-no-font-override', body.hasAttribute('data-theme-opendyslexic'))
	}

	function setVariant(variant) {
		const body = document.body
		if (!body) {
			return
		}
		currentVariant = variant
		const html = document.documentElement
		body.removeAttribute('data-nexeno')
		body.removeAttribute('data-nexeno-light')
		body.removeAttribute('data-nexeno-dark')
		html.removeAttribute('data-nexeno')
		html.removeAttribute('data-nexeno-light')
		html.removeAttribute('data-nexeno-dark')
		if (variant === 'light') {
			body.setAttribute('data-nexeno', '')
			body.setAttribute('data-nexeno-light', '')
			html.setAttribute('data-nexeno', '')
			html.setAttribute('data-nexeno-light', '')
		} else if (variant === 'dark') {
			body.setAttribute('data-nexeno', '')
			body.setAttribute('data-nexeno-dark', '')
			html.setAttribute('data-nexeno', '')
			html.setAttribute('data-nexeno-dark', '')
		}
		updateFontOverrideGuard()
		syncCoreThemeLock()
		syncSubOptionLock()
	}

	function apply() {
		userThemes = readInitialState('user-themes')
		setVariant(readInitialState('variant'))

		const mount = document.getElementById('settings-personal-theming')
		if (mount && window.MutationObserver) {
			new MutationObserver(syncCoreThemeLock).observe(mount, { childList: true, subtree: true })
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', apply)
	} else {
		apply()
	}

	/**
	 * Put Nextcloud's own theme markers on <body> (data-theme-<id> and data-themes). Nextcloud's colour
	 * variables (--color-main-background and the rest) follow these, so without this step the page
	 * stays half in the old variant until it is reloaded.
	 *
	 * @param {string[]} themes Theme ids from the server, e.g. ['dark', 'opendyslexic'].
	 */
	function setBodyThemes(themes) {
		const body = document.body
		if (!body || !Array.isArray(themes) || themes.length === 0) {
			return
		}
		Array.prototype.slice.call(body.attributes)
			.map(function(attribute) { return attribute.name })
			.filter(function(name) { return name.indexOf('data-theme-') === 0 })
			.forEach(function(name) { body.removeAttribute(name) })
		themes.forEach(function(id) {
			if (/^[a-z0-9-]+$/.test(id)) {
				body.setAttribute('data-theme-' + id, '')
			}
		})
		body.setAttribute('data-themes', themes.join(','))
		updateFontOverrideGuard()
	}

	if (channel) {
		// Other tabs send {variant, themes}; older pages send the variant name only.
		channel.onmessage = function(event) {
			const data = event.data
			const variant = data && typeof data === 'object' ? data.variant : data
			if (VARIANTS.indexOf(variant) !== -1) {
				setVariant(variant)
				if (data && typeof data === 'object') {
					setBodyThemes(data.themes)
				}
			}
		}
	}

	function toast(message) {
		if (window.OC && OC.Notification && OC.Notification.showTemporary) {
			OC.Notification.showTemporary(message)
		}
	}

	function refreshThemeStyles() {
		const links = document.head.querySelectorAll('link.theme')
		Array.prototype.forEach.call(links, function(link) {
			const url = new URL(link.href)
			url.searchParams.set('v', String(Date.now()))
			const clone = link.cloneNode()
			clone.href = url.toString()
			clone.onload = function() {
				link.remove()
			}
			document.head.appendChild(clone)
		})
	}

	function currentBodyThemes() {
		const value = document.body ? document.body.getAttribute('data-themes') : null
		return value ? value.split(',').filter(Boolean) : []
	}

	/**
	 * The theme ids <body> needs for a variant, worked out in the browser so the whole page switches at
	 * once. The server sends the same list back (CoreTheming::bodyThemes) and that answer wins.
	 *
	 * @param {string} variant 'off', 'light' or 'dark'.
	 * @return {string[]|null} Theme ids, or null when they are not known yet.
	 */
	function bodyThemesFor(variant) {
		if (variant === 'light' || variant === 'dark') {
			const kept = (userThemes || currentBodyThemes()).filter(function(id) {
				return KEEP_THEMES.indexOf(id) !== -1
			})
			return [variant].concat(kept)
		}
		return Array.isArray(userThemes) && userThemes.length > 0 ? userThemes : null
	}

	function persistVariant(variant) {
		if (VARIANTS.indexOf(variant) === -1) {
			return
		}

		// While the theme is off, <body> shows the user's own themes; they may have changed them on this page.
		if (currentVariant !== 'light' && currentVariant !== 'dark') {
			const live = currentBodyThemes()
			if (live.length > 0) {
				userThemes = live
			}
		}

		setVariant(variant)
		const themes = bodyThemesFor(variant)
		if (themes) {
			setBodyThemes(themes)
			if (channel) {
				channel.postMessage({ variant, themes })
			}
		}

		fetch(OC.generateUrl('/apps/nexeno_theme/variant'), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				requesttoken: OC.requestToken,
			},
			body: JSON.stringify({ variant }),
		})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('HTTP ' + response.status)
				}
				return response.json()
			})
			.then(function(data) {
				// The server answers with the theme ids <body> needs for this variant.
				setBodyThemes(data.enabledThemes)
				if (channel) {
					channel.postMessage({ variant, themes: data.enabledThemes })
				}
				refreshThemeStyles()
			})
			.catch(function(error) {
				console.warn('[nexeno] variant save failed:', error)
				toast(t('nexeno_theme', 'Could not save the Nexeno theme setting.'))
			})
	}

	document.addEventListener('change', function(event) {
		const input = event.target
		if (!input) {
			return
		}

		if (input.id === 'nexeno_theme-enabled' && input.type === 'checkbox') {
			if (input.checked) {
				const selected = document.querySelector('input[name="nexeno_theme-variant"]:checked')
				persistVariant(selected ? selected.value : 'light')
			} else {
				persistVariant('off')
			}
			return
		}

		if (input.type === 'radio' && input.name === 'nexeno_theme-variant') {
			persistVariant(input.value)
		}
	})
})()
