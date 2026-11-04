/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'

	const IMAGE_EXT = [
		'jpg',
		'jpeg',
		'jpe',
		'png',
		'gif',
		'webp',
		'svg',
		'bmp',
		'ico',
		'tif',
		'tiff',
		'heic',
		'heif',
		'avif',
		'psd',
		'ai',
		'eps',
	]

	const VIDEO_EXT = [
		'mp4',
		'm4v',
		'mkv',
		'mov',
		'avi',
		'webm',
		'wmv',
		'flv',
		'mpg',
		'mpeg',
		'ogv',
	]

	const GROUPED = {}
	IMAGE_EXT.forEach(function(ext) { GROUPED[ext] = 'image' })
	VIDEO_EXT.forEach(function(ext) { GROUPED[ext] = 'video' })

	const FOLDER_ICONS = '.folder-icon, .folder-open-icon'
	const SHARE_OVERLAYS = ['account-plus-icon', 'account-group-icon', 'link-icon']
		.map(function(icon) {
			return '.files-list__row-icon-overlay:not(.files-list__row-icon-overlay--file).' + icon
		})
		.join(', ')

	const SHARE_BUTTON = '[data-cy-files-list-row-action="sharing-status"]'
	const RESTORE_BUTTON = '[data-cy-files-list-row-action="restore"], [data-cy-files-list-row-action="restore-share"]'
	const SHARED_CLASS = 'is-shared'
	const FILES_LIST = '.files-list'
	const DELETED_FILES_CLASS = 'deleted-files'
	const TRASHBIN_PATH = /\/apps\/files\/trashbin(\/|$)/
	const AVATAR_SVG = 'svg.sharing-status__avatar'
	const AVATAR_CLASS = 'avatar-view'
	const MARK_ATTR = 'data-nexeno-type'

	const TRASHBIN_SUFFIX = /\.d\d+$/

	function extensionOf(name) {
		name = name.replace(TRASHBIN_SUFFIX, '')
		const dot = name.lastIndexOf('.')
		if (dot <= 0 || dot === name.length - 1) {
			return ''
		}
		return name.slice(dot + 1).toLowerCase()
	}

	function classOfFile(name) {
		const ext = extensionOf(name)
		if (GROUPED[ext]) {
			return GROUPED[ext]
		}
		return /^[a-z0-9][a-z0-9-]*$/.test(ext) ? ext : 'file'
	}

	function isVisible(el) {
		return !!el && el.offsetWidth > 0 && el.offsetHeight > 0
	}

	function hasVisibleShareOverlay(icon) {
		const overlays = icon.querySelectorAll(SHARE_OVERLAYS)
		for (let i = 0; i < overlays.length; i++) {
			if (isVisible(overlays[i])) {
				return true
			}
		}
		return false
	}

	function classOfRow(row) {
		const icon = row.querySelector('.files-list__row-icon')
		if (icon && icon.querySelector(FOLDER_ICONS)) {
			return hasVisibleShareOverlay(icon) ? 'folder-shared' : 'folder'
		}
		return classOfFile(row.getAttribute('data-cy-files-list-row-name') || '')
	}

	function classOfRecommendation(item) {
		const a = item.querySelector('a')
		if (!a) {
			return 'file'
		}
		const thumb = a.querySelector('.thumbnail')
		if (thumb && thumb.querySelector('svg')) {
			return 'folder'
		}
		const path = a.getAttribute('title') || ''
		return classOfFile(path.slice(path.lastIndexOf('/') + 1))
	}

	function mark(el, next) {
		const previous = el.getAttribute(MARK_ATTR) || ''
		if (previous === next) {
			if (!el.classList.contains(next)) {
				el.classList.add(next)
			}
			return
		}
		if (previous) {
			el.classList.remove(previous)
		}
		el.classList.add(next)
		el.setAttribute(MARK_ATTR, next)
	}

	function markShared(row) {
		const button = row.querySelector(SHARE_BUTTON)
		if (button) {
			const text = (button.textContent || '').trim()
			button.classList.toggle(SHARED_CLASS, text === 'Shared')
			button.classList.toggle(AVATAR_CLASS, !!button.querySelector(AVATAR_SVG))
		}
		const restore = row.querySelector(RESTORE_BUTTON)
		if (restore) {
			restore.classList.add(SHARED_CLASS)
		}
	}

	function markFilesList() {
		const list = document.querySelector(FILES_LIST)
		if (!list) {
			return
		}
		list.classList.toggle(DELETED_FILES_CLASS, TRASHBIN_PATH.test(window.location.pathname))
	}

	function markRows() {
		markFilesList()

		const rows = document.querySelectorAll('tr.files-list__row')
		for (let i = 0; i < rows.length; i++) {
			mark(rows[i], classOfRow(rows[i]))
			markShared(rows[i])
		}

		const items = document.querySelectorAll('li.recommendation-item')
		for (let j = 0; j < items.length; j++) {
			mark(items[j], classOfRecommendation(items[j]))
		}
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
			markRows()
		})
	}

	function start() {
		markRows()

		if (typeof MutationObserver === 'undefined') {
			return
		}
		const observer = new MutationObserver(scheduleMark)
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['data-cy-files-list-row-name', 'class', 'title'],
		})
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start)
	} else {
		start()
	}
})()
