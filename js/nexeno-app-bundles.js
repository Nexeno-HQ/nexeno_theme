/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'
	const CLASS_NAME = 'table-wrapper-section'
	const CONTENT_SELECTOR = '[class*="appstoreApp__content"]'
	const ARROW = '↗'
	const APPSTORE_SIDEBAR_CLASS = 'appstore-sidebar'
	const APPSTORE_SIDEBAR_SELECTOR = '.app-appstore .app-sidebar'

	function wrapArrow(content) {
		const texts = content.querySelectorAll('.button-vue__text')
		for (let i = 0; i < texts.length; i++) {
			const el = texts[i]
			if (el.querySelector('.text-arrow-icon')) {
				continue
			}
			const text = el.textContent
			const idx = text.indexOf(ARROW)
			if (idx === -1) {
				continue
			}
			const before = text.slice(0, idx)
			const after = text.slice(idx + 1)
			el.textContent = ''
			el.appendChild(document.createTextNode(before))
			const span = document.createElement('span')
			span.className = 'text-arrow-icon'
			span.textContent = ARROW
			el.appendChild(span)
			if (after) {
				el.appendChild(document.createTextNode(after))
			}
		}
	}

	function wrapTables(content) {
		const tables = content.querySelectorAll('table')
		for (let i = 0; i < tables.length; i++) {
			const table = tables[i]
			if (table.closest('.table-wrapper')) {
				continue
			}
			const wrapper = document.createElement('div')
			wrapper.className = 'table-wrapper'
			table.parentNode.insertBefore(wrapper, table)
			wrapper.appendChild(table)
		}
	}

	function markAppstoreSidebar() {
		const sidebars = document.querySelectorAll(APPSTORE_SIDEBAR_SELECTOR)
		for (let i = 0; i < sidebars.length; i++) {
			sidebars[i].classList.add(APPSTORE_SIDEBAR_CLASS)
		}
	}

	function sync() {
		markAppstoreSidebar()
		const content = document.querySelector(CONTENT_SELECTOR)
		if (!content) {
			return
		}
		wrapTables(content)
		wrapArrow(content)
		const sections = content.querySelectorAll('section')
		for (let i = 0; i < sections.length; i++) {
			sections[i].classList.add(CLASS_NAME)
		}
	}

	let scheduled = false
	const defer = window.requestAnimationFrame
		? function(cb) { window.requestAnimationFrame(cb) }
		: function(cb) { window.setTimeout(cb, 0) }

	function scheduleSync() {
		if (scheduled) {
			return
		}
		scheduled = true
		defer(function() {
			scheduled = false
			sync()
		})
	}

	function start() {
		scheduleSync()

		if (typeof MutationObserver === 'undefined') {
			return
		}
		new MutationObserver(scheduleSync).observe(document.body, {
			childList: true,
			subtree: true,
		})
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start)
	} else {
		start()
	}
})()
