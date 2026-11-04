/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';

	var VARIANTS = ['off', 'light', 'dark'];

	var CORE_THEME_INPUTS = ['default', 'light', 'dark', 'light-highcontrast', 'dark-highcontrast', 'opendyslexic']
		.map(function (id) {
			return '.theming__preview--' + id + ' input';
		})
		.join(', ');

	var currentVariant = null;

	var channel = null;
	try {
		channel = new BroadcastChannel('nexeno_theme-variant');
	} catch (e) {
		channel = null;
	}

	function readVariant() {
		var el = document.getElementById('initial-state-nexeno_theme-variant');
		if (!el) {
			return null;
		}
		try {
			return JSON.parse(atob(el.value));
		} catch (e) {
			return null;
		}
	}

	function syncCoreThemeLock() {
		var locked = currentVariant === 'light' || currentVariant === 'dark';
		var inputs = document.querySelectorAll(CORE_THEME_INPUTS);
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].disabled = locked;
		}
	}

	function syncSubOptionLock() {
		var enabled = currentVariant === 'light' || currentVariant === 'dark';
		var radios = document.querySelectorAll('input[name="nexeno_theme-variant"]');
		for (var i = 0; i < radios.length; i++) {
			radios[i].disabled = !enabled;
		}
		var toggle = document.getElementById('nexeno_theme-enabled');
		if (toggle) {
			toggle.checked = enabled;
		}
	}

	function updateFontOverrideGuard() {
		var body = document.body;
		if (!body) {
			return;
		}
		document.documentElement.toggleAttribute('data-nexeno-no-font-override', body.hasAttribute('data-theme-opendyslexic'));
	}

	function setVariant(variant) {
		var body = document.body;
		if (!body) {
			return;
		}
		currentVariant = variant;
		var html = document.documentElement;
		body.removeAttribute('data-nexeno');
		body.removeAttribute('data-nexeno-light');
		body.removeAttribute('data-nexeno-dark');
		html.removeAttribute('data-nexeno');
		html.removeAttribute('data-nexeno-light');
		html.removeAttribute('data-nexeno-dark');
		if (variant === 'light') {
			body.setAttribute('data-nexeno', '');
			body.setAttribute('data-nexeno-light', '');
			html.setAttribute('data-nexeno', '');
			html.setAttribute('data-nexeno-light', '');
		} else if (variant === 'dark') {
			body.setAttribute('data-nexeno', '');
			body.setAttribute('data-nexeno-dark', '');
			html.setAttribute('data-nexeno', '');
			html.setAttribute('data-nexeno-dark', '');
		}
		updateFontOverrideGuard();
		syncCoreThemeLock();
		syncSubOptionLock();
	}

	function apply() {
		setVariant(readVariant());

		var mount = document.getElementById('settings-personal-theming');
		if (mount && window.MutationObserver) {
			new MutationObserver(syncCoreThemeLock).observe(mount, { childList: true, subtree: true });
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', apply);
	} else {
		apply();
	}

	/**
	 * Put Nextcloud's own theme markers on <body> (data-theme-<id> and data-themes). Nextcloud's colour
	 * variables (--color-main-background and the rest) follow these, so without this step the page
	 * stays half in the old variant until it is reloaded.
	 *
	 * @param {string[]} themes Theme ids from the server, e.g. ['dark', 'opendyslexic'].
	 */
	function setBodyThemes(themes) {
		var body = document.body;
		if (!body || !Array.isArray(themes) || themes.length === 0) {
			return;
		}
		Array.prototype.slice.call(body.attributes)
			.map(function (attribute) { return attribute.name; })
			.filter(function (name) { return name.indexOf('data-theme-') === 0; })
			.forEach(function (name) { body.removeAttribute(name); });
		themes.forEach(function (id) {
			if (/^[a-z0-9-]+$/.test(id)) {
				body.setAttribute('data-theme-' + id, '');
			}
		});
		body.setAttribute('data-themes', themes.join(','));
		updateFontOverrideGuard();
	}

	if (channel) {
		// Other tabs send {variant, themes}; older pages send the variant name only.
		channel.onmessage = function (event) {
			var data = event.data;
			var variant = data && typeof data === 'object' ? data.variant : data;
			if (VARIANTS.indexOf(variant) !== -1) {
				setVariant(variant);
				if (data && typeof data === 'object') {
					setBodyThemes(data.themes);
				}
			}
		};
	}

	function toast(message) {
		if (window.OC && OC.Notification && OC.Notification.showTemporary) {
			OC.Notification.showTemporary(message);
		}
	}

	function refreshThemeStyles() {
		var links = document.head.querySelectorAll('link.theme');
		Array.prototype.forEach.call(links, function (link) {
			var url = new URL(link.href);
			url.searchParams.set('v', String(Date.now()));
			var clone = link.cloneNode();
			clone.href = url.toString();
			clone.onload = function () {
				link.remove();
			};
			document.head.appendChild(clone);
		});
	}

	function persistVariant(variant) {
		if (VARIANTS.indexOf(variant) === -1) {
			return;
		}

		setVariant(variant);

		fetch(OC.generateUrl('/apps/nexeno_theme/variant'), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				requesttoken: OC.requestToken,
			},
			body: JSON.stringify({ variant: variant }),
		})
			.then(function (response) {
				if (!response.ok) {
					throw new Error('HTTP ' + response.status);
				}
				return response.json();
			})
			.then(function (data) {
				// The server answers with the theme ids <body> needs for this variant.
				setBodyThemes(data.enabledThemes);
				if (channel) {
					channel.postMessage({ variant: variant, themes: data.enabledThemes });
				}
				refreshThemeStyles();
			})
			.catch(function (error) {
				console.warn('[nexeno] variant save failed:', error);
				toast(t('nexeno_theme', 'Could not save the Nexeno theme setting.'));
			});
	}

	document.addEventListener('change', function (event) {
		var input = event.target;
		if (!input) {
			return;
		}

		if (input.id === 'nexeno_theme-enabled' && input.type === 'checkbox') {
			if (input.checked) {
				var selected = document.querySelector('input[name="nexeno_theme-variant"]:checked');
				persistVariant(selected ? selected.value : 'light');
			} else {
				persistVariant('off');
			}
			return;
		}

		if (input.type === 'radio' && input.name === 'nexeno_theme-variant') {
			persistVariant(input.value);
		}
	});
})();
