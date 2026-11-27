/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'

	const VARIANTS = ['off', 'system', 'light', 'dark']
	const ENABLED_VARIANTS = ['system', 'light', 'dark']

	// "system" follows the device's light or dark setting, also when it changes while the page is open.
	const darkSchemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
	// The device's "increase contrast" setting turns high contrast on, as it does for Nextcloud's own themes.
	const moreContrastQuery = window.matchMedia ? window.matchMedia('(prefers-contrast: more)') : null

	let currentVariant = null
	// The variant last turned on in this page. During high contrast no option is selected, so turning the theme
	// off and on again falls back to this instead of "system".
	let lastEnabledVariant = null
	// The user's own Nextcloud themes (initial state), kept up to date when they change them on this page.
	let userThemes = null
	// What setBodyThemes() last wrote, so onNextcloudThemeChange() can tell its own change from Nextcloud's.
	let lastWrittenThemes = null

	function isEnabled(variant) {
		return ENABLED_VARIANTS.indexOf(variant) !== -1
	}

	/**
	 * The high-contrast theme the user chose in Nextcloud (light-highcontrast or dark-highcontrast), or null.
	 * userThemes, the user's own Nextcloud themes, is the source; the given list only before it is known.
	 *
	 * @param {string[]} [themes] Theme ids to fall back on.
	 */
	function chosenHighContrast(themes) {
		const source = Array.isArray(userThemes) ? userThemes : (themes || [])
		return source.filter(function(id) {
			return /-highcontrast$/.test(id)
		})[0] || null
	}

	/**
	 * Light or dark for a variant. A high-contrast theme chosen in Nextcloud says light or dark in its name
	 * ("Dark theme with high contrast mode"), so it decides; otherwise the Nexeno variant does, and "system"
	 * follows the device.
	 *
	 * @param {string} variant 'off', 'system', 'light' or 'dark'.
	 * @param {string[]} [themes] Theme ids to look for a chosen high-contrast theme in, before userThemes is known.
	 */
	function resolveVariant(variant, themes) {
		const chosen = isEnabled(variant) ? chosenHighContrast(themes) : null
		if (chosen) {
			return chosen.indexOf('dark') === 0 ? 'dark' : 'light'
		}
		if (variant !== 'system') {
			return variant
		}
		return darkSchemeQuery && darkSchemeQuery.matches ? 'dark' : 'light'
	}

	/**
	 * The Nextcloud theme ids <body> gets while a Nexeno variant is on: the theme for the resolved light or dark
	 * (resolveVariant(); for "system" the server sends Nextcloud's "default" as a placeholder), its high-contrast
	 * version when the user chose one of Nextcloud's high-contrast themes or the device asks for more contrast,
	 * and OpenDyslexic. Only one light or dark theme, so Nextcloud's colours never mix with the other variant's.
	 * The first-paint script (BeforeTemplateRenderedListener::firstPaintScript()) applies the same rule.
	 *
	 * @param {string[]} themes Theme ids, e.g. ['default', 'light-highcontrast', 'opendyslexic'].
	 * @param {string} variant 'off', 'system', 'light' or 'dark'.
	 * @return {string[]} Theme ids to put on <body>; unchanged while the theme is off.
	 */
	function normalizeThemes(themes, variant) {
		if (!isEnabled(variant) || !Array.isArray(themes)) {
			return themes
		}
		const highContrast = !!chosenHighContrast(themes) || !!(moreContrastQuery && moreContrastQuery.matches)
		return [resolveVariant(variant, themes) + (highContrast ? '-highcontrast' : '')].concat(themes.filter(function(id) {
			return id === 'opendyslexic'
		}))
	}

	// Nextcloud's own themes, locked while the Nexeno theme is on. High contrast stays the user's own choice in
	// Nextcloud, so its two buttons are not in this list; picking a Nexeno option turns it off (leaveHighContrast()).
	const CORE_THEME_INPUTS = ['default', 'light', 'dark', 'opendyslexic']
		.map(function(id) {
			return '.theming__preview--' + id + ' input'
		})
		.join(', ')

	// Nextcloud themes passed on while a Nexeno variant is active (mirrors CoreTheming::KEEP_THEMES).
	const KEEP_THEMES = ['opendyslexic', 'light-highcontrast', 'dark-highcontrast']

	let channel = null
	try {
		channel = new BroadcastChannel('nexeno_theme-variant')
	} catch {
		channel = null
	}

	function readInitialState(key) {
		const el = document.getElementById('initial-state-nexeno_theme-' + key)
		if (!el) {
			return null
		}
		try {
			return JSON.parse(atob(el.value))
		} catch {
			return null
		}
	}

	/** Whether a high-contrast theme chosen in Nextcloud is applied over the Nexeno variant right now. */
	function isHighContrastOn() {
		return isEnabled(currentVariant) && !!chosenHighContrast()
	}

	function syncCoreThemeLock() {
		const locked = isEnabled(currentVariant)
		const inputs = document.querySelectorAll(CORE_THEME_INPUTS)
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].disabled = locked
		}
	}

	function syncSubOptionLock() {
		const enabled = isEnabled(currentVariant)
		// High contrast chosen in Nextcloud is applied instead of the Nexeno variant: no option shows as chosen, and
		// the hint says that picking one turns high contrast off (leaveHighContrast()).
		const highContrastOn = isHighContrastOn()
		const hint = document.getElementById('nexeno_theme-high-contrast-hint')
		if (hint) {
			hint.hidden = !highContrastOn
		}
		const radios = document.querySelectorAll('input[name="nexeno_theme-variant"]')
		for (let i = 0; i < radios.length; i++) {
			radios[i].disabled = !enabled
			// Only while the hint shows: a screen reader also reads a hidden description.
			if (hint && highContrastOn) {
				radios[i].setAttribute('aria-describedby', hint.id)
			} else {
				radios[i].removeAttribute('aria-describedby')
			}
			// Follows a change from another tab too: a browser sends no change event for a click on the
			// option that is already selected, so a stale selection would swallow that click. That is also
			// why none is selected during high contrast. While the theme is off the last variant stays
			// selected, to come back when it is turned on.
			if (enabled) {
				radios[i].checked = !highContrastOn && radios[i].value === currentVariant
			}
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

	// While the theme is off the server leaves out its styles and page scripts and sends their addresses
	// instead ({styles, scripts}); null when they are already on the page or have been added.
	let pendingAssets = null

	/**
	 * Adds the theme's styles and page scripts the first time it is turned on in this page.
	 * The page scripts all start on their own when they are added after the page has loaded.
	 */
	function loadThemeAssets() {
		const assets = pendingAssets
		pendingAssets = null
		if (!assets) {
			return
		}
		// Skips files already on the page, e.g. after a second turn-on in the same tab.
		const loaded = Array.prototype.map.call(document.querySelectorAll('link[href], script[src]'), function(el) {
			return new URL(el.href || el.src, location.href).pathname
		})
		const isNew = function(url) {
			return loaded.indexOf(new URL(url, location.href).pathname) === -1
		}
		// Nextcloud's script policy wants the page's nonce on every script.
		const nonced = document.querySelector('script[nonce]')
		const nonce = nonced ? nonced.nonce || nonced.getAttribute('nonce') : ''
		;(assets.styles || []).filter(isNew).forEach(function(url) {
			const link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = url
			document.head.appendChild(link)
		})
		;(assets.scripts || []).filter(isNew).forEach(function(url) {
			const script = document.createElement('script')
			script.src = url
			// Run in list order, as the server would have loaded them.
			script.async = false
			if (nonce) {
				script.nonce = nonce
			}
			document.head.appendChild(script)
		})
	}

	/**
	 * Puts the open app's id on <html> as data-nexeno-app, as the first-paint script does. The stylesheets use
	 * it in place of :has(.app-<id>) (scripts/lower-app-has.mjs). Needed when the theme is turned on in an open
	 * tab, where the first-paint script did not run. Nextcloud puts "app-<id>" on #content.
	 *
	 * @param {HTMLElement} html The <html> element.
	 */
	function markOpenApp(html) {
		const content = document.getElementById('content')
		const match = content ? /(?:^|\s)app-([a-z0-9_]+)(?:\s|$)/.exec(content.className) : null
		if (match) {
			html.dataset.nexenoApp = match[1]
		}
	}

	function setVariant(variant) {
		const body = document.body
		if (!body) {
			return
		}
		if (isEnabled(variant)) {
			loadThemeAssets()
		}
		currentVariant = variant
		if (isEnabled(variant)) {
			lastEnabledVariant = variant
		}
		const resolved = resolveVariant(variant)
		const html = document.documentElement
		body.removeAttribute('data-nexeno')
		body.removeAttribute('data-nexeno-light')
		body.removeAttribute('data-nexeno-dark')
		html.removeAttribute('data-nexeno')
		html.removeAttribute('data-nexeno-light')
		html.removeAttribute('data-nexeno-dark')
		if (!isEnabled(variant)) {
			html.removeAttribute('data-nexeno-hc')
		}
		if (resolved === 'light' || resolved === 'dark') {
			markOpenApp(html)
		}
		if (resolved === 'light') {
			body.setAttribute('data-nexeno', '')
			body.setAttribute('data-nexeno-light', '')
			html.setAttribute('data-nexeno', '')
			html.setAttribute('data-nexeno-light', '')
		} else if (resolved === 'dark') {
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
		pendingAssets = readInitialState('assets')
		setVariant(readInitialState('variant'))

		// The core theme inputs exist only on the Appearance settings page, where the Nexeno section is.
		// Elsewhere nothing is watched, so apps such as Files and Talk do no extra work on each change.
		if (!document.getElementById('nexeno_theme-settings')) {
			return
		}
		// NC33+ wraps the Appearance section in #settings-personal-theming. NC32 mounts it
		// over <span id="theming">, which Vue 2 replaces, so watch the settings content instead.
		const mount = document.getElementById('settings-personal-theming')
			|| document.getElementById('app-content')
		if (mount && window.MutationObserver) {
			new MutationObserver(scheduleCoreThemeLock).observe(mount, { childList: true, subtree: true })
			new MutationObserver(onNextcloudThemeChange).observe(document.body, { attributes: true, attributeFilter: ['data-themes'] })
		}
	}

	/**
	 * Nextcloud's own theme picker on this page (now only high contrast is open while the theme is on) writes
	 * the user's Nextcloud themes straight onto <body>. Remember them, as the themes to go back to when the
	 * theme is turned off, and put the Nexeno variant's themes back, with or without high contrast.
	 */
	function onNextcloudThemeChange() {
		const live = currentBodyThemes()
		if (!isEnabled(currentVariant) || live.join(',') === lastWrittenThemes) {
			return
		}
		userThemes = live
		// The chosen high-contrast theme can switch light and dark, so the Nexeno markers follow too.
		setVariant(currentVariant)
		setBodyThemes(bodyThemesFor(currentVariant))
		// Other open tabs follow at once, as they do for a Nexeno option.
		if (channel) {
			channel.postMessage({ variant: currentVariant, themes: currentBodyThemes(), userThemes })
		}
	}

	// At most once per frame: the observer also fires on every change inside apps such as Files and Talk.
	let lockScheduled = false
	function scheduleCoreThemeLock() {
		if (lockScheduled) {
			return
		}
		lockScheduled = true
		requestAnimationFrame(function() {
			lockScheduled = false
			syncCoreThemeLock()
		})
	}

	// Marks an area with data-nexeno-scrolling while it scrolls and briefly after, so its scroll bar shows only
	// then (same as Nexeno Project's useScrollingMark). Scroll events do not bubble, so listen in the capture phase.
	const SCROLLBAR_LINGER = 800
	const scrollTimers = new Map()
	document.addEventListener('scroll', function(event) {
		if (!document.documentElement.hasAttribute('data-nexeno')) {
			return
		}
		const area = event.target instanceof Element ? event.target : document.scrollingElement
		if (!area) {
			return
		}
		area.setAttribute('data-nexeno-scrolling', '')
		clearTimeout(scrollTimers.get(area))
		scrollTimers.set(area, setTimeout(function() {
			area.removeAttribute('data-nexeno-scrolling')
			scrollTimers.delete(area)
		}, SCROLLBAR_LINGER))
	}, { capture: true, passive: true })

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', apply)
	} else {
		apply()
	}

	if (darkSchemeQuery && darkSchemeQuery.addEventListener) {
		darkSchemeQuery.addEventListener('change', function() {
			if (currentVariant === 'system') {
				setVariant('system')
				setBodyThemes(bodyThemesFor('system'))
			}
		})
	}

	if (moreContrastQuery && moreContrastQuery.addEventListener) {
		moreContrastQuery.addEventListener('change', function() {
			if (isEnabled(currentVariant)) {
				setBodyThemes(bodyThemesFor(currentVariant))
			}
		})
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
		themes = normalizeThemes(themes, currentVariant)
		if (isEnabled(currentVariant)) {
			document.documentElement.toggleAttribute('data-nexeno-hc', /-highcontrast$/.test(themes[0]))
		}
		lastWrittenThemes = themes.join(',')
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
			// The user's Nextcloud themes travel with each message, as they decide high contrast (chosenHighContrast()).
			if (data && Array.isArray(data.userThemes)) {
				userThemes = data.userThemes
			}
			if (VARIANTS.indexOf(variant) !== -1) {
				setVariant(variant)
				if (data && typeof data === 'object') {
					setBodyThemes(data.themes)
				}
			}
		}
	}

	/**
	 * Shows a Nextcloud toast (top right). OCP.Toast is core's wrapper around @nextcloud/dialogs; the
	 * older OC.Notification is only a fallback and has no success or error styling.
	 *
	 * @param {string} message The translated text.
	 * @param {'success'|'error'} type The toast style.
	 */
	function toast(message, type = 'success') {
		// This file is a plain script (not bundled), so it cannot import @nextcloud/dialogs.
		// eslint-disable-next-line @nextcloud/no-deprecated-globals
		if (window.OCP && OCP.Toast && typeof OCP.Toast[type] === 'function') {
			// eslint-disable-next-line @nextcloud/no-deprecated-globals
			OCP.Toast[type](message)
		} else if (window.OC && OC.Notification && OC.Notification.showTemporary) {
			OC.Notification.showTemporary(message)
		}
	}

	function currentBodyThemes() {
		const value = document.body ? document.body.getAttribute('data-themes') : null
		return value ? value.split(',').filter(Boolean) : []
	}

	/**
	 * The theme ids <body> needs for a variant, worked out in the browser so the whole page switches at
	 * once. The server sends the same list back (CoreTheming::bodyThemes) and that answer wins.
	 *
	 * @param {string} variant 'off', 'system', 'light' or 'dark'.
	 * @return {string[]|null} Theme ids, or null when they are not known yet.
	 */
	function bodyThemesFor(variant) {
		if (isEnabled(variant)) {
			const kept = (userThemes || currentBodyThemes()).filter(function(id) {
				return KEEP_THEMES.indexOf(id) !== -1
			})
			return [resolveVariant(variant)].concat(kept)
		}
		return Array.isArray(userThemes) && userThemes.length > 0 ? userThemes : null
	}

	/**
	 * Turns Nextcloud's high contrast off when the user picks a Nexeno option, so the option they picked is what
	 * they see. It clicks Nextcloud's own "Default" theme on this page, so Nextcloud saves it and updates its theme
	 * list itself; before that list is on the page, it calls the same Nextcloud API the list uses.
	 */
	function leaveHighContrast() {
		const chosen = chosenHighContrast()
		if (!chosen) {
			return
		}
		// Applied at once; Nextcloud's list writes the same to <body> when it has saved it (onNextcloudThemeChange()).
		userThemes = ['default'].concat(userThemes.filter(function(id) {
			return id !== chosen && id !== 'default' && id !== 'light' && id !== 'dark'
		}))
		const nextcloudDefault = document.querySelector('.theming__preview--default input')
		if (nextcloudDefault) {
			nextcloudDefault.disabled = false
			nextcloudDefault.click()
			syncCoreThemeLock()
			return
		}
		const ocs = function(method, path) {
			// Plain script, cannot import @nextcloud/router.
			// eslint-disable-next-line @nextcloud/no-deprecated-globals
			return fetch(OC.linkToOCS('apps/theming/api/v1', 2) + path, { method, headers: { 'OCS-APIRequest': 'true', requesttoken: OC.requestToken } })
				.then(function(response) {
					// fetch() only rejects on network errors; an HTTP error must stop the chain and show the toast too.
					if (!response.ok) {
						throw new Error('HTTP ' + response.status)
					}
					return response
				})
		}
		ocs('PUT', 'theme/default/enable')
			.then(function() {
				return ocs('DELETE', 'theme/' + chosen)
			})
			.catch(function() {
				toast(t('nexeno_theme', 'Could not save the Nexeno theme setting.'), 'error')
			})
	}

	let saveQueue = Promise.resolve()
	let saveId = 0

	/**
	 * @param {string} variant 'off', 'system', 'light' or 'dark'.
	 * @param {string} [successMessage] Toast shown once the server has saved it (the on/off switch only).
	 */
	function persistVariant(variant, successMessage) {
		if (VARIANTS.indexOf(variant) === -1) {
			return
		}

		// While the theme is off, <body> shows the user's own themes; they may have changed them on this page.
		if (!isEnabled(currentVariant)) {
			const live = currentBodyThemes()
			if (live.length > 0) {
				userThemes = live
			}
		}

		const previousVariant = currentVariant
		const previousThemes = currentBodyThemes()
		const id = ++saveId

		setVariant(variant)
		const themes = bodyThemesFor(variant)
		if (themes) {
			setBodyThemes(themes)
			if (channel) {
				channel.postMessage({ variant, themes, userThemes })
			}
		}

		// One save at a time, so the server keeps the last click, not whichever request lands last.
		saveQueue = saveQueue.then(function() {
			// Plain script, cannot import @nextcloud/router.
			// eslint-disable-next-line @nextcloud/no-deprecated-globals
			return fetch(OC.generateUrl('/apps/nexeno_theme/variant'), {
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
					if (id !== saveId) {
						// A newer click is waiting; its answer wins.
						return
					}
					// The server answers with the theme ids <body> needs for this variant; setBodyThemes() resolves them.
					setBodyThemes(data.enabledThemes)
					const themes = currentBodyThemes()
					if (channel) {
						channel.postMessage({ variant, themes, userThemes })
					}
					if (successMessage) {
						toast(successMessage)
					}
				})
				.catch(function() {
					if (id === saveId) {
						// Show what the server still has, as the login page switch does.
						setVariant(previousVariant)
						setBodyThemes(previousThemes)
						if (channel) {
							channel.postMessage({ variant: previousVariant, themes: previousThemes, userThemes })
						}
					}
					toast(t('nexeno_theme', 'Could not save the Nexeno theme setting.'), 'error')
				})
		})
	}

	/**
	 * A site-wide switch only admins see: where it saves, and what to tell the admin. Built on use, so the
	 * messages are translated once Nextcloud has loaded the translations.
	 *
	 * @param {string} inputId The checkbox id.
	 * @return {{path: string, onMessage: string, offMessage: string, errorMessage: string}|undefined}
	 */
	function adminSwitchFor(inputId) {
		const adminSwitches = {
			'nexeno_theme-login-style-enabled': {
				path: '/apps/nexeno_theme/login-style',
				onMessage: t('nexeno_theme', 'The login page now shows the Nexeno look for everyone.'),
				offMessage: t('nexeno_theme', 'The login page now shows the standard Nextcloud look.'),
				errorMessage: t('nexeno_theme', 'Could not save the login page setting.'),
			},
			'nexeno_theme-organisation-colour-enabled': {
				path: '/apps/nexeno_theme/organisation-colour',
				// The colour is put on the page when it loads, so it shows from the next page on.
				onMessage: t('nexeno_theme', "The Nexeno theme now uses the organisation's colour. Reload the page to see it."),
				offMessage: t('nexeno_theme', 'The Nexeno theme now uses the Nexeno blue. Reload the page to see it.'),
				errorMessage: t('nexeno_theme', "Could not save the organisation's colour setting."),
			},
			'nexeno_theme-app-menu-enabled': {
				path: '/apps/nexeno_theme/app-menu',
				// The app menu is built when the page loads, so the change shows from the next page on.
				onMessage: t('nexeno_theme', 'Nexeno Theme is now shown in the app menu. Reload the page to see it.'),
				offMessage: t('nexeno_theme', 'Nexeno Theme is now hidden from the app menu. Reload the page to see it.'),
				errorMessage: t('nexeno_theme', 'Could not save the app menu setting.'),
			},
		}
		return Object.hasOwn(adminSwitches, inputId) ? adminSwitches[inputId] : undefined
	}

	/**
	 * Saves a site-wide admin switch. On failure the switch flips back, so it always shows what the
	 * server actually stores.
	 *
	 * @param {HTMLInputElement} input The checkbox.
	 * @param {{path: string, onMessage: string, offMessage: string, errorMessage: string}} adminSwitch From adminSwitchFor().
	 */
	function persistAdminSwitch(input, adminSwitch) {
		const enabled = input.checked
		input.disabled = true
		// Plain script, cannot import @nextcloud/router.
		// eslint-disable-next-line @nextcloud/no-deprecated-globals
		fetch(OC.generateUrl(adminSwitch.path), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				requesttoken: OC.requestToken,
			},
			body: JSON.stringify({ enabled }),
		})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('HTTP ' + response.status)
				}
				toast(enabled ? adminSwitch.onMessage : adminSwitch.offMessage)
			})
			.catch(function() {
				input.checked = !enabled
				toast(adminSwitch.errorMessage, 'error')
			})
			.finally(function() {
				input.disabled = false
			})
	}

	document.addEventListener('change', function(event) {
		const input = event.target
		if (!input) {
			return
		}

		const adminSwitch = input.type === 'checkbox' ? adminSwitchFor(input.id) : undefined
		if (adminSwitch) {
			persistAdminSwitch(input, adminSwitch)
			return
		}

		if (input.id === 'nexeno_theme-enabled' && input.type === 'checkbox') {
			if (input.checked) {
				const selected = document.querySelector('input[name="nexeno_theme-variant"]:checked')
				const message = t('nexeno_theme', 'Nexeno theme turned on. Your account now uses the Nexeno look.')
				persistVariant(selected ? selected.value : (lastEnabledVariant || 'system'), message)
			} else {
				const message = t('nexeno_theme', 'Nexeno theme turned off. Your standard Nextcloud appearance is back.')
				persistVariant('off', message)
			}
			return
		}

		if (input.type === 'radio' && input.name === 'nexeno_theme-variant') {
			// Picking a Nexeno option is the way out of Nextcloud's high contrast (the last click wins).
			leaveHighContrast()
			persistVariant(input.value)
		}
	})
})()
