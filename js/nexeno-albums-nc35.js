/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'

	if (!document.querySelector('.app-photos')) {
		return
	}

	const SHARED_VIEW_PATH = /^\/apps\/photos\/shared(\/|$)/

	function labelFileTiles() {
		const shared = SHARED_VIEW_PATH.test(window.location.pathname)

		document.querySelectorAll('.nodes-container li').forEach(function(tile) {
			const link = tile.querySelector(':scope > .file-container a.file')
			let label = tile.querySelector(':scope > .nexeno-file-name')

			if (!link || shared) {
				if (label) {
					label.remove()
				}
				return
			}

			if (!label) {
				label = document.createElement('p')
				label.className = 'nexeno-file-name'
				tile.appendChild(label)
			}

			const name = decodeURIComponent(link.pathname.split('/').pop())
			if (label.textContent !== name) {
				label.textContent = name
				label.title = name
			}
		})
	}

	let pending = false
	new MutationObserver(function() {
		if (pending) {
			return
		}
		pending = true
		requestAnimationFrame(function() {
			pending = false
			labelFileTiles()
		})
	}).observe(document.body, { childList: true, subtree: true })

	labelFileTiles()
})()
