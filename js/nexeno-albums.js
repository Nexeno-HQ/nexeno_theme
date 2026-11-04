/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'

	const COVER_SELECTOR = '.collections.albums-list .collections__list li a > img.collection-cover__image,'
		+ '.collections.albums-list .collections__list li a > div.collection-cover__image--placeholder,'
		+ '.collections.places-list .collections__list li a > img.collection-cover__image,'
		+ '.collections.places-list .collections__list li a > div.collection-cover__image--placeholder,'
		+ '.grid-container--folders .grid-item-wrapper a > img.folder__image,'
		+ 'a.tag-cover > img.tag-cover__image'
	const CLASS_MERGE_SELECTOR = '.grid-container--folders .grid-item-wrapper a > span.transition-group'
	const WRAPPER_CLASS = 'album-img-wrapper'

	const PHOTOS_MAIN_SELECTOR = 'main#app-content-vue'
	const TAG_ROOT_SELECTOR = '[roottitle="Tagged photos"]'
	const TAG_VIEW_CLASS = 'tag-view'
	const FOLDER_INNER_PATH = /^\/apps\/photos\/folders\/./
	const FOLDER_INNER_CLASS = 'folder-inner-view'
	const SHARED_VIEW_PATH = /^\/apps\/photos\/shared(\/|$)/
	const SHARED_VIEW_CLASS = 'shared-view'
	function markTagView() {
		const main = document.querySelector(PHOTOS_MAIN_SELECTOR)
		if (!main) {
			return
		}
		main.classList.toggle(TAG_VIEW_CLASS, !!main.querySelector(TAG_ROOT_SELECTOR))
		main.classList.toggle(FOLDER_INNER_CLASS, FOLDER_INNER_PATH.test(window.location.pathname))
		main.classList.toggle(SHARED_VIEW_CLASS, SHARED_VIEW_PATH.test(window.location.pathname))
	}

	function wrapAlbumCovers() {
		markTagView()

		const covers = document.querySelectorAll(COVER_SELECTOR)
		for (let i = 0; i < covers.length; i++) {
			const cover = covers[i]
			const parent = cover.parentNode
			if (!parent || (parent.classList && parent.classList.contains(WRAPPER_CLASS))) {
				continue
			}
			const wrapper = document.createElement('div')
			wrapper.className = WRAPPER_CLASS
			parent.insertBefore(wrapper, cover)
			wrapper.appendChild(cover)
		}

		const mergeTargets = document.querySelectorAll(CLASS_MERGE_SELECTOR)
		for (let j = 0; j < mergeTargets.length; j++) {
			mergeTargets[j].classList.add(WRAPPER_CLASS)
		}
	}

	let scheduled = false
	const defer = window.requestAnimationFrame
		? function(cb) { window.requestAnimationFrame(cb) }
		: function(cb) { window.setTimeout(cb, 0) }
	function scheduleWrap() {
		if (scheduled) {
			return
		}
		scheduled = true
		defer(function() {
			scheduled = false
			wrapAlbumCovers()
		})
	}

	function start() {
		wrapAlbumCovers()

		if (typeof MutationObserver === 'undefined') {
			return
		}
		new MutationObserver(scheduleWrap).observe(document.body, {
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
