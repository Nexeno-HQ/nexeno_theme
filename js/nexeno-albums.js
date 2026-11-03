/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';

	var COVER_SELECTOR = '.collections.albums-list .collections__list li a > img.collection-cover__image,'
		+ '.collections.albums-list .collections__list li a > div.collection-cover__image--placeholder,'
		+ '.collections.places-list .collections__list li a > img.collection-cover__image,'
		+ '.collections.places-list .collections__list li a > div.collection-cover__image--placeholder,'
		+ '.grid-container--folders .grid-item-wrapper a > img.folder__image,'
		+ 'a.tag-cover > img.tag-cover__image';
	var CLASS_MERGE_SELECTOR = '.grid-container--folders .grid-item-wrapper a > span.transition-group';
	var WRAPPER_CLASS = 'album-img-wrapper';

	var PHOTOS_MAIN_SELECTOR = 'main#app-content-vue';
	var TAG_ROOT_SELECTOR = '[roottitle="Tagged photos"]';
	var TAG_VIEW_CLASS = 'tag-view';
	var FOLDER_INNER_PATH = /^\/apps\/photos\/folders\/./;
	var FOLDER_INNER_CLASS = 'folder-inner-view';
	var SHARED_VIEW_PATH = /^\/apps\/photos\/shared(\/|$)/;
	var SHARED_VIEW_CLASS = 'shared-view';
	function markTagView() {
		var main = document.querySelector(PHOTOS_MAIN_SELECTOR);
		if (!main) {
			return;
		}
		main.classList.toggle(TAG_VIEW_CLASS, !!main.querySelector(TAG_ROOT_SELECTOR));
		main.classList.toggle(FOLDER_INNER_CLASS, FOLDER_INNER_PATH.test(window.location.pathname));
		main.classList.toggle(SHARED_VIEW_CLASS, SHARED_VIEW_PATH.test(window.location.pathname));
	}

	function wrapAlbumCovers() {
		markTagView();

		var covers = document.querySelectorAll(COVER_SELECTOR);
		for (var i = 0; i < covers.length; i++) {
			var cover = covers[i];
			var parent = cover.parentNode;
			if (!parent || (parent.classList && parent.classList.contains(WRAPPER_CLASS))) {
				continue;
			}
			var wrapper = document.createElement('div');
			wrapper.className = WRAPPER_CLASS;
			parent.insertBefore(wrapper, cover);
			wrapper.appendChild(cover);
		}

		var mergeTargets = document.querySelectorAll(CLASS_MERGE_SELECTOR);
		for (var j = 0; j < mergeTargets.length; j++) {
			mergeTargets[j].classList.add(WRAPPER_CLASS);
		}
	}

	var scheduled = false;
	var defer = window.requestAnimationFrame
		? function (cb) { window.requestAnimationFrame(cb); }
		: function (cb) { window.setTimeout(cb, 0); };
	function scheduleWrap() {
		if (scheduled) {
			return;
		}
		scheduled = true;
		defer(function () {
			scheduled = false;
			wrapAlbumCovers();
		});
	}

	function start() {
		wrapAlbumCovers();

		if (typeof MutationObserver === 'undefined') {
			return;
		}
		new MutationObserver(scheduleWrap).observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
