/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'
	const WRAPPER_CLASS = 'activitysettings-table-wrapper'

	function wrapTables() {
		const tables = document.querySelectorAll('table.activitysettings')
		for (let i = 0; i < tables.length; i++) {
			const table = tables[i]
			if (table.closest('.' + WRAPPER_CLASS)) {
				continue
			}
			const wrapper = document.createElement('div')
			wrapper.className = WRAPPER_CLASS
			table.parentNode.insertBefore(wrapper, table)
			wrapper.appendChild(table)
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
			wrapTables()
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
