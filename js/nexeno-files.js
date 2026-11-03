/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';

	var IMAGE_EXT = [
		'jpg', 'jpeg', 'jpe', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
		'tif', 'tiff', 'heic', 'heif', 'avif', 'psd', 'ai', 'eps',
	];

	var VIDEO_EXT = [
		'mp4', 'm4v', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'flv',
		'mpg', 'mpeg', 'ogv',
	];

	var GROUPED = {};
	IMAGE_EXT.forEach(function (ext) { GROUPED[ext] = 'image'; });
	VIDEO_EXT.forEach(function (ext) { GROUPED[ext] = 'video'; });

	var FOLDER_ICONS = '.folder-icon, .folder-open-icon';
	var SHARE_OVERLAYS = ['account-plus-icon', 'account-group-icon', 'link-icon']
		.map(function (icon) {
			return '.files-list__row-icon-overlay:not(.files-list__row-icon-overlay--file).' + icon;
		})
		.join(', ');

	var SHARE_BUTTON = '[data-cy-files-list-row-action="sharing-status"]';
	var RESTORE_BUTTON = '[data-cy-files-list-row-action="restore"], [data-cy-files-list-row-action="restore-share"]';
	var SHARED_CLASS = 'is-shared';
	var FILES_LIST = '.files-list';
	var DELETED_FILES_CLASS = 'deleted-files';
	var TRASHBIN_PATH = /\/apps\/files\/trashbin(\/|$)/;
	var AVATAR_SVG = 'svg.sharing-status__avatar';
	var AVATAR_CLASS = 'avatar-view';
	var MARK_ATTR = 'data-nexeno-type';

	var TRASHBIN_SUFFIX = /\.d\d+$/;

	function extensionOf(name) {
		name = name.replace(TRASHBIN_SUFFIX, '');
		var dot = name.lastIndexOf('.');
		if (dot <= 0 || dot === name.length - 1) {
			return '';
		}
		return name.slice(dot + 1).toLowerCase();
	}

	function classOfFile(name) {
		var ext = extensionOf(name);
		if (GROUPED[ext]) {
			return GROUPED[ext];
		}
		return /^[a-z0-9][a-z0-9-]*$/.test(ext) ? ext : 'file';
	}

	function isVisible(el) {
		return !!el && el.offsetWidth > 0 && el.offsetHeight > 0;
	}

	function hasVisibleShareOverlay(icon) {
		var overlays = icon.querySelectorAll(SHARE_OVERLAYS);
		for (var i = 0; i < overlays.length; i++) {
			if (isVisible(overlays[i])) {
				return true;
			}
		}
		return false;
	}

	function classOfRow(row) {
		var icon = row.querySelector('.files-list__row-icon');
		if (icon && icon.querySelector(FOLDER_ICONS)) {
			return hasVisibleShareOverlay(icon) ? 'folder-shared' : 'folder';
		}
		return classOfFile(row.getAttribute('data-cy-files-list-row-name') || '');
	}

	function classOfRecommendation(item) {
		var a = item.querySelector('a');
		if (!a) {
			return 'file';
		}
		var thumb = a.querySelector('.thumbnail');
		if (thumb && thumb.querySelector('svg')) {
			return 'folder';
		}
		var path = a.getAttribute('title') || '';
		return classOfFile(path.slice(path.lastIndexOf('/') + 1));
	}

	function mark(el, next) {
		var previous = el.getAttribute(MARK_ATTR) || '';
		if (previous === next) {
			if (!el.classList.contains(next)) {
				el.classList.add(next);
			}
			return;
		}
		if (previous) {
			el.classList.remove(previous);
		}
		el.classList.add(next);
		el.setAttribute(MARK_ATTR, next);
	}

	function markShared(row) {
		var button = row.querySelector(SHARE_BUTTON);
		if (button) {
			var text = (button.textContent || '').trim();
			button.classList.toggle(SHARED_CLASS, text === 'Shared');
			button.classList.toggle(AVATAR_CLASS, !!button.querySelector(AVATAR_SVG));
		}
		var restore = row.querySelector(RESTORE_BUTTON);
		if (restore) {
			restore.classList.add(SHARED_CLASS);
		}
	}

	function markFilesList() {
		var list = document.querySelector(FILES_LIST);
		if (!list) {
			return;
		}
		list.classList.toggle(DELETED_FILES_CLASS, TRASHBIN_PATH.test(window.location.pathname));
	}

	function markRows() {
		markFilesList();

		var rows = document.querySelectorAll('tr.files-list__row');
		for (var i = 0; i < rows.length; i++) {
			mark(rows[i], classOfRow(rows[i]));
			markShared(rows[i]);
		}

		var items = document.querySelectorAll('li.recommendation-item');
		for (var j = 0; j < items.length; j++) {
			mark(items[j], classOfRecommendation(items[j]));
		}
	}

	var scheduled = false;
	var defer = window.requestAnimationFrame
		? function (cb) { window.requestAnimationFrame(cb); }
		: function (cb) { window.setTimeout(cb, 0); };
	function scheduleMark() {
		if (scheduled) {
			return;
		}
		scheduled = true;
		defer(function () {
			scheduled = false;
			markRows();
		});
	}

	function start() {
		markRows();

		if (typeof MutationObserver === 'undefined') {
			return;
		}
		var observer = new MutationObserver(scheduleMark);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['data-cy-files-list-row-name', 'class', 'title'],
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
