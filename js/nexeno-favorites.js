/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'

	// Images the browser shows as a preview in the widget lists. Narrower than the icon rule in
	// nexeno-filetypes.js on purpose: a .psd or .eps has no preview unless the server makes one.
	const IMAGE_EXTS = [
		'jpg',
		'jpeg',
		'png',
		'gif',
		'webp',
		'svg',
		'bmp',
		'ico',
		'tiff',
		'tif',
		'heic',
		'heif',
		'avif',
	]
	const FOLDER_ICON = 'filetypes/folder.svg'
	const FOLDER_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
		+ '<path fill="currentColor" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />'
		+ '</svg>'
	const FOLDER_ICON_CLASS = 'nexeno-folder-icon'
	// Shared rule, from nexeno-filetypes.js (loaded first).
	const classOfFile = window.nexenoFileType

	const favPreview = {}

	const iconSvgCache = {}
	const ACTIVITY_ICON_CLASS = 'nexeno-activity-icon'

	function extensionOf(name) {
		const dot = name.lastIndexOf('.')
		if (dot <= 0 || dot === name.length - 1) {
			return ''
		}
		return name.slice(dot + 1).toLowerCase()
	}

	function isImageName(name) {
		const ext = extensionOf(name)
		return !!ext && IMAGE_EXTS.indexOf(ext) !== -1
	}

	function isFolderEntry(entry) {
		if (entry.querySelector('.' + FOLDER_ICON_CLASS)) {
			return true
		}
		const img = entry.querySelector('img')
		const src = img && img.getAttribute('src')
		return !!src && src.indexOf(FOLDER_ICON) !== -1
	}

	function replaceFolderIcon(entry) {
		const img = entry.querySelector('img')
		if (!img || !img.parentNode) {
			return
		}
		const span = document.createElement('span')
		span.className = FOLDER_ICON_CLASS
		span.innerHTML = FOLDER_SVG
		img.parentNode.replaceChild(span, img)
	}

	function getFavoritePreviewState(entry) {
		const img = entry.querySelector('img')
		const src = img && img.getAttribute('src')
		if (!src || src.indexOf('/core/preview') === -1) {
			return false
		}
		const probe = src.replace(/[?&]mimeFallback=[^&]*/i, '')
		const cached = favPreview[probe]
		if (cached === true || cached === false) {
			return cached
		}
		if (cached === 'pending') {
			return null
		}
		favPreview[probe] = 'pending'
		const im = new Image()
		im.onload = function() {
			favPreview[probe] = true
			scheduleMark()
		}
		im.onerror = function() {
			favPreview[probe] = false
			scheduleMark()
		}
		im.src = probe
		return null
	}

	function isAvatarEntry(entry) {
		if (entry.querySelector('.avatardiv')) {
			return true
		}
		const img = entry.querySelector('img')
		const src = img && img.getAttribute('src')
		return !!src && src.indexOf('/avatar/') !== -1
	}

	function isFolderRecommendation(entry) {
		const thumb = entry.querySelector('.thumbnail')
		return !!thumb && !thumb.style.backgroundImage
	}

	function hasRecommendationPreview(entry) {
		const thumb = entry.querySelector('.thumbnail')
		const bg = thumb ? (thumb.style.backgroundImage || '') : ''
		return bg.indexOf('/core/preview') !== -1
	}

	function markFileListEntries() {
		const entries = document.querySelectorAll('.item-list__entry')
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i]
			const title = entry.querySelector('h3')
			if (!title) {
				continue
			}
			const name = (title.textContent || '').trim()
			if (!name) {
				continue
			}
			const avatar = isAvatarEntry(entry)
			entry.classList.toggle('avatar-list', avatar)
			if (avatar) {
				entry.classList.remove('file-list')
				entry.classList.remove('folder')
				continue
			}
			const folder = isFolderEntry(entry)
			if (folder) {
				replaceFolderIcon(entry)
			}
			const preview = folder
				? false
				: isImageName(name)
					? true
					: getFavoritePreviewState(entry) === true
			entry.classList.toggle('file-list', folder || !preview)
			entry.classList.toggle('folder', folder)
		}
	}

	function markRecommendationEntries() {
		const entries = document.querySelectorAll('a.recommendation')
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i]
			const thumb = entry.querySelector('.thumbnail')
			if (!thumb) {
				continue
			}
			const folder = isFolderRecommendation(entry)
			const preview = hasRecommendationPreview(entry)
			entry.classList.toggle('file-list', folder || !preview)
			entry.classList.toggle('folder', folder)
		}
	}

	function inlineActivityIcons() {
		if (typeof fetch === 'undefined') {
			return
		}
		const imgs = document.querySelectorAll('.item-list__entry img.item-icon')
		for (let i = 0; i < imgs.length; i++) {
			const img = imgs[i]
			const src = img.getAttribute('src')
			if (!src || !/\.svg(\?|#|$)/i.test(src)) {
				continue
			}
			const cached = iconSvgCache[src]
			if (cached === 'pending' || cached === 'failed') {
				continue
			}
			if (typeof cached === 'string') {
				replaceIconImg(img, cached)
				continue
			}
			iconSvgCache[src] = 'pending';
			(function(url) {
				fetch(url, { credentials: 'same-origin' })
					.then(function(r) { return r.ok ? r.text() : Promise.reject() })
					.then(function(text) {
						const s = text.indexOf('<svg')
						const e = text.lastIndexOf('</svg>')
						if (s === -1 || e === -1) {
							throw new Error('not svg')
						}
						iconSvgCache[url] = text.slice(s, e + 6)
						scheduleMark()
					})
					.catch(function() { iconSvgCache[url] = 'failed' })
			})(src)
		}
	}

	function replaceIconImg(img, svgText) {
		if (!img.parentNode) {
			return
		}
		// Parsed in a separate document, where nothing runs or loads, and cleaned before it joins the page:
		// the icon comes from whichever app provides the widget.
		const svg = new DOMParser().parseFromString(svgText, 'text/html').body.firstElementChild
		if (!svg || svg.nodeName.toLowerCase() !== 'svg') {
			return
		}
		// <style> inside inline SVG applies to the whole page, and the theme colours these icons itself.
		svg.querySelectorAll('script, foreignObject, style').forEach(function(node) {
			node.remove()
		})
		const elements = [svg].concat(Array.from(svg.querySelectorAll('*')))
		elements.forEach(function(element) {
			Array.from(element.attributes).forEach(function(attribute) {
				// Browsers skip spaces and control characters inside a link scheme ("java\tscript:" still runs), so test without them.
				const compact = Array.from(attribute.value).filter(function(c) {
					return c > ' '
				}).join('')
				if (/^on/i.test(attribute.name) || /javascript:/i.test(compact)) {
					element.removeAttribute(attribute.name)
				}
			})
		})
		const span = document.createElement('span')
		span.className = ACTIVITY_ICON_CLASS
		span.appendChild(document.importNode(svg, true))
		img.parentNode.replaceChild(span, img)
	}

	function activityIconClass(src) {
		const m = /\/([a-z0-9_-]+)\.svg(?:[?#]|$)/i.exec(src || '')
		return m ? m[1].toLowerCase() + '-icon' : null
	}

	function tagActivityIcons() {
		const imgs = document.querySelectorAll('.activity-icon img[src]')
		for (let i = 0; i < imgs.length; i++) {
			const cls = activityIconClass(imgs[i].getAttribute('src'))
			if (cls) {
				imgs[i].classList.add(cls)
			}
		}
	}

	function tagActivityPreviews() {
		const imgs = document.querySelectorAll('.activity-entry__preview-image[src]')
		for (let i = 0; i < imgs.length; i++) {
			const img = imgs[i]
			const src = img.getAttribute('src') || ''
			let cls
			if (src.indexOf(FOLDER_ICON) !== -1) {
				cls = 'folder'
			} else {
				const alt = (img.getAttribute('alt') || '').replace(/^Open\s+/i, '')
				cls = classOfFile(alt)
			}
			img.classList.add(cls)
		}
	}

	function tagSystemTagChips() {
		const chips = document.querySelectorAll('.rich-text--component[type="systemtag"]')
		for (let i = 0; i < chips.length; i++) {
			chips[i].classList.add('tag-chip')
		}
	}

	function tagWidgetModal() {
		const body = document.body
		if (!body || (!body.hasAttribute('data-nexeno-light') && !body.hasAttribute('data-nexeno-dark'))) {
			return
		}
		const contents = document.querySelectorAll('.modal-container .modal__content')
		for (let i = 0; i < contents.length; i++) {
			if (!contents[i].querySelector('ol.panels')) {
				continue
			}
			const container = contents[i].closest('.modal-container')
			if (container) {
				container.classList.add('ctm-widget-modal')
			}
		}
	}

	function tagStatusModal() {
		const body = document.body
		if (!body || (!body.hasAttribute('data-nexeno-light') && !body.hasAttribute('data-nexeno-dark'))) {
			return
		}
		const modals = document.querySelectorAll('.set-status-modal')
		for (let i = 0; i < modals.length; i++) {
			const container = modals[i].closest('.modal-container')
			if (container) {
				container.classList.add('status-modal')
			}
		}
	}

	const ACTION_INPUT_SELECTOR = '.action-input__container .input-field__input'

	function syncActionInputValue(input) {
		// The Nexeno styles only apply while the theme is on, so leave the page as Nextcloud made it otherwise.
		if (!document.documentElement.hasAttribute('data-nexeno')) {
			return
		}
		const filled = (input.value || '').length > 0
		input.classList.toggle('has-value', filled)
	}

	function markActionInputs() {
		const inputs = document.querySelectorAll(ACTION_INPUT_SELECTOR)
		for (let i = 0; i < inputs.length; i++) {
			syncActionInputValue(inputs[i])
		}
	}

	function markEntries() {
		// The Nexeno styles only apply while the theme is on, so leave the page as Nextcloud made it otherwise.
		if (!document.documentElement.hasAttribute('data-nexeno')) {
			return
		}
		markFileListEntries()
		markRecommendationEntries()
		inlineActivityIcons()
		tagActivityIcons()
		tagActivityPreviews()
		tagSystemTagChips()
		tagWidgetModal()
		tagStatusModal()
		markActionInputs()
	}

	let scheduled = false
	const defer = window.requestAnimationFrame
		? function(cb) { window.requestAnimationFrame(cb) }
		: function(cb) { window.setTimeout(cb, 0) }
	function scheduleMark() {
		if (scheduled) {
			return
		}
		scheduled = true
		defer(function() {
			scheduled = false
			markEntries()
		})
	}

	function start() {
		markEntries()

		document.addEventListener('input', function(event) {
			const t = event.target
			if (t && t.matches && t.matches(ACTION_INPUT_SELECTOR)) {
				syncActionInputValue(t)
			}
		})

		if (typeof MutationObserver === 'undefined') {
			return
		}
		const observer = new MutationObserver(function(records) {
			// Text changes matter only for the file names in widget lists (markFileListEntries); typing in
			// Talk or Text elsewhere on the page must not re-run every check on each key press.
			for (let i = 0; i < records.length; i++) {
				const parent = records[i].type === 'characterData' ? records[i].target.parentElement : null
				if (records[i].type !== 'characterData' || (parent && parent.closest('.item-list__entry'))) {
					scheduleMark()
					return
				}
			}
		})
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['src', 'style'],
		})
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start)
	} else {
		start()
	}
})()
