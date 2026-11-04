/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'
	const LIST = '.files-list'
	const TBODY = 'tbody.files-list__tbody'
	const PATCHED = ['itemWidth', 'itemHeight']

	const states = new WeakMap()

	function isThemed() {
		const body = document.body
		return !!body && (
			body.hasAttribute('data-nexeno-light')
			|| body.hasAttribute('data-nexeno-dark')
		)
	}
	function fileListWidth() {
		const el = document.getElementById('app-content-vue') || document.body
		const style = window.getComputedStyle(el)
		const width = el.clientWidth
			- (parseFloat(style.paddingInlineStart || style.paddingLeft) || 0)
			- (parseFloat(style.paddingInlineEnd || style.paddingRight) || 0)
		return width > 0 ? width : 0
	}

	function columnCount(tbody) {
		const tracks = window.getComputedStyle(tbody).gridTemplateColumns
		if (!tracks || tracks === 'none') {
			return 1
		}
		return tracks.trim().split(/\s+/).length
	}
	function rowPitch(tbody, columns) {
		const rows = tbody.children
		if (!rows.length) {
			return 0
		}
		if (rows.length > columns) {
			const delta = rows[columns].offsetTop - rows[0].offsetTop
			if (delta > 0) {
				return delta
			}
		}
		const height = rows[0].offsetHeight
		if (!height) {
			return 0
		}
		return height + (parseFloat(window.getComputedStyle(tbody).rowGap) || 0)
	}

	function measure(tbody) {
		const columns = columnCount(tbody)
		const width = fileListWidth()
		const pitch = rowPitch(tbody, columns)
		if (!columns || !width || !pitch) {
			return null
		}
		return {
			itemWidth: Math.max(1, width / columns - 0.5),
			itemHeight: pitch,
		}
	}
	function invalidate(vm) {
		const watchers = vm._computedWatchers
		for (const key in watchers) {
			watchers[key].dirty = true
		}
		if (vm.$forceUpdate) {
			vm.$forceUpdate()
		}
	}

	function patch(vm, metrics) {
		let state = states.get(vm)
		if (!state) {
			state = { originals: {}, metrics }
			for (let i = 0; i < PATCHED.length; i++) {
				(function(key) {
					state.originals[key] = Object.getOwnPropertyDescriptor(vm, key)
					Object.defineProperty(vm, key, {
						configurable: true,
						enumerable: true,
						get: function() {
							return state.metrics[key]
						},
					})
				})(PATCHED[i])
			}
			states.set(vm, state)
			invalidate(vm)
			return
		}
		if (Math.abs(metrics.itemWidth - state.metrics.itemWidth) < 0.5
			&& Math.abs(metrics.itemHeight - state.metrics.itemHeight) < 0.5) {
			return
		}
		state.metrics = metrics
		invalidate(vm)
	}

	function unpatch(vm) {
		const state = states.get(vm)
		if (!state) {
			return
		}
		for (let i = 0; i < PATCHED.length; i++) {
			const key = PATCHED[i]
			if (state.originals[key]) {
				Object.defineProperty(vm, key, state.originals[key])
			} else {
				delete vm[key]
			}
		}
		states.delete(vm)
		invalidate(vm)
	}

	function sync() {
		const lists = document.querySelectorAll(LIST)
		const themed = isThemed()
		for (let i = 0; i < lists.length; i++) {
			const vm = lists[i].__vue__
			if (!vm) {
				continue
			}
			if (!themed) {
				unpatch(vm)
				continue
			}
			const tbody = lists[i].querySelector(TBODY)
			if (!tbody) {
				continue
			}
			const metrics = measure(tbody)
			if (metrics) {
				patch(vm, metrics)
			}
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
			attributes: true,
			attributeFilter: ['class', 'data-nexeno-light', 'data-nexeno-dark'],
		})

		window.addEventListener('resize', scheduleSync, { passive: true })
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start)
	} else {
		start()
	}
})()
