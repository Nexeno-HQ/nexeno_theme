/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';

	var IMAGE_EXTS = [
		'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
		'tiff', 'tif', 'heic', 'heif', 'avif',
	];
	var VIDEO_EXTS = [
		'mp4', 'm4v', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'flv',
		'mpg', 'mpeg', 'ogv',
	];
	var FOLDER_ICON = 'filetypes/folder.svg';
	var FOLDER_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
		+ '<path fill="currentColor" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />'
		+ '</svg>';
	var FOLDER_ICON_CLASS = 'nexeno-folder-icon';

	var favPreview = {};

	var iconSvgCache = {};
	var ACTIVITY_ICON_CLASS = 'nexeno-activity-icon';

	function extensionOf(name) {
		var dot = name.lastIndexOf('.');
		if (dot <= 0 || dot === name.length - 1) {
			return '';
		}
		return name.slice(dot + 1).toLowerCase();
	}

	function isImageName(name) {
		var ext = extensionOf(name);
		return !!ext && IMAGE_EXTS.indexOf(ext) !== -1;
	}

	function classOfFile(name) {
		var ext = extensionOf(name);
		if (IMAGE_EXTS.indexOf(ext) !== -1) {
			return 'image';
		}
		if (VIDEO_EXTS.indexOf(ext) !== -1) {
			return 'video';
		}
		return /^[a-z0-9][a-z0-9-]*$/.test(ext) ? ext : 'file';
	}

	function isFolderEntry(entry) {
		if (entry.querySelector('.' + FOLDER_ICON_CLASS)) {
			return true;
		}
		var img = entry.querySelector('img');
		var src = img && img.getAttribute('src');
		return !!src && src.indexOf(FOLDER_ICON) !== -1;
	}

	function replaceFolderIcon(entry) {
		var img = entry.querySelector('img');
		if (!img || !img.parentNode) {
			return;
		}
		var span = document.createElement('span');
		span.className = FOLDER_ICON_CLASS;
		span.innerHTML = FOLDER_SVG;
		img.parentNode.replaceChild(span, img);
	}

	function getFavoritePreviewState(entry) {
		var img = entry.querySelector('img');
		var src = img && img.getAttribute('src');
		if (!src || src.indexOf('/core/preview') === -1) {
			return false;
		}
		var probe = src.replace(/[?&]mimeFallback=[^&]*/i, '');
		var cached = favPreview[probe];
		if (cached === true || cached === false) {
			return cached;
		}
		if (cached === 'pending') {
			return null;
		}
		favPreview[probe] = 'pending';
		var im = new Image();
		im.onload = function () { favPreview[probe] = true; scheduleMark(); };
		im.onerror = function () { favPreview[probe] = false; scheduleMark(); };
		im.src = probe;
		return null;
	}

	function isAvatarEntry(entry) {
		if (entry.querySelector('.avatardiv')) {
			return true;
		}
		var img = entry.querySelector('img');
		var src = img && img.getAttribute('src');
		return !!src && src.indexOf('/avatar/') !== -1;
	}

	function isFolderRecommendation(entry) {
		var thumb = entry.querySelector('.thumbnail');
		return !!thumb && !thumb.style.backgroundImage;
	}

	function hasRecommendationPreview(entry) {
		var thumb = entry.querySelector('.thumbnail');
		var bg = thumb ? (thumb.style.backgroundImage || '') : '';
		return bg.indexOf('/core/preview') !== -1;
	}

	function markFileListEntries() {
		var entries = document.querySelectorAll('.item-list__entry');
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i];
			var title = entry.querySelector('h3');
			if (!title) {
				continue;
			}
			var name = (title.textContent || '').trim();
			if (!name) {
				continue;
			}
			var avatar = isAvatarEntry(entry);
			entry.classList.toggle('avatar-list', avatar);
			if (avatar) {
				entry.classList.remove('file-list');
				entry.classList.remove('folder');
				continue;
			}
			var folder = isFolderEntry(entry);
			if (folder) {
				replaceFolderIcon(entry);
			}
			var preview = folder ? false
				: isImageName(name) ? true
					: getFavoritePreviewState(entry) === true;
			entry.classList.toggle('file-list', folder || !preview);
			entry.classList.toggle('folder', folder);
		}
	}

	function markRecommendationEntries() {
		var entries = document.querySelectorAll('a.recommendation');
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i];
			var thumb = entry.querySelector('.thumbnail');
			if (!thumb) {
				continue;
			}
			var folder = isFolderRecommendation(entry);
			var preview = hasRecommendationPreview(entry);
			entry.classList.toggle('file-list', folder || !preview);
			entry.classList.toggle('folder', folder);
		}
	}

	function inlineActivityIcons() {
		if (typeof fetch === 'undefined') {
			return;
		}
		var imgs = document.querySelectorAll('.item-list__entry img.item-icon');
		for (var i = 0; i < imgs.length; i++) {
			var img = imgs[i];
			var src = img.getAttribute('src');
			if (!src || !/\.svg(\?|#|$)/i.test(src)) {
				continue;
			}
			var cached = iconSvgCache[src];
			if (cached === 'pending' || cached === 'failed') {
				continue;
			}
			if (typeof cached === 'string') {
				replaceIconImg(img, cached);
				continue;
			}
			iconSvgCache[src] = 'pending';
			(function (url) {
				fetch(url, { credentials: 'same-origin' })
					.then(function (r) { return r.ok ? r.text() : Promise.reject(); })
					.then(function (text) {
						var s = text.indexOf('<svg');
						var e = text.lastIndexOf('</svg>');
						if (s === -1 || e === -1) {
							throw new Error('not svg');
						}
						iconSvgCache[url] = text.slice(s, e + 6);
						scheduleMark();
					})
					.catch(function () { iconSvgCache[url] = 'failed'; });
			})(src);
		}
	}

	function replaceIconImg(img, svgText) {
		if (!img.parentNode) {
			return;
		}
		var span = document.createElement('span');
		span.className = ACTIVITY_ICON_CLASS;
		span.innerHTML = svgText;
		img.parentNode.replaceChild(span, img);
	}

	function activityIconClass(src) {
		var m = /\/([a-z0-9_-]+)\.svg(?:[?#]|$)/i.exec(src || '');
		return m ? m[1].toLowerCase() + '-icon' : null;
	}

	function tagActivityIcons() {
		var imgs = document.querySelectorAll('.activity-icon img[src]');
		for (var i = 0; i < imgs.length; i++) {
			var cls = activityIconClass(imgs[i].getAttribute('src'));
			if (cls) {
				imgs[i].classList.add(cls);
			}
		}
	}

	function tagActivityPreviews() {
		var imgs = document.querySelectorAll('.activity-entry__preview-image[src]');
		for (var i = 0; i < imgs.length; i++) {
			var img = imgs[i];
			var src = img.getAttribute('src') || '';
			var cls;
			if (src.indexOf(FOLDER_ICON) !== -1) {
				cls = 'folder';
			} else {
				var alt = (img.getAttribute('alt') || '').replace(/^Open\s+/i, '');
				cls = classOfFile(alt);
			}
			img.classList.add(cls);
		}
	}

	function tagSystemTagChips() {
		var chips = document.querySelectorAll('.rich-text--component[type="systemtag"]');
		for (var i = 0; i < chips.length; i++) {
			chips[i].classList.add('tag-chip');
		}
	}

	function tagWidgetModal() {
		var body = document.body;
		if (!body || (!body.hasAttribute('data-nexeno-light') && !body.hasAttribute('data-nexeno-dark'))) {
			return;
		}
		var contents = document.querySelectorAll('.modal-container .modal__content');
		for (var i = 0; i < contents.length; i++) {
			if (!contents[i].querySelector('ol.panels')) {
				continue;
			}
			var container = contents[i].closest('.modal-container');
			if (container) {
				container.classList.add('ctm-widget-modal');
			}
		}
	}

	function tagStatusModal() {
		var body = document.body;
		if (!body || (!body.hasAttribute('data-nexeno-light') && !body.hasAttribute('data-nexeno-dark'))) {
			return;
		}
		var modals = document.querySelectorAll('.set-status-modal');
		for (var i = 0; i < modals.length; i++) {
			var container = modals[i].closest('.modal-container');
			if (container) {
				container.classList.add('status-modal');
			}
		}
	}

	var ACTION_INPUT_SELECTOR = '.action-input__container .input-field__input';

	function syncActionInputValue(input) {
		var filled = (input.value || '').length > 0;
		input.classList.toggle('has-value', filled);
		input.classList.toggle('has-no-value', !filled);
	}

	function markActionInputs() {
		var inputs = document.querySelectorAll(ACTION_INPUT_SELECTOR);
		for (var i = 0; i < inputs.length; i++) {
			syncActionInputValue(inputs[i]);
		}
	}

	function markEntries() {
		markFileListEntries();
		markRecommendationEntries();
		inlineActivityIcons();
		tagActivityIcons();
		tagActivityPreviews();
		tagSystemTagChips();
		tagWidgetModal();
		tagStatusModal();
		markActionInputs();
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
			markEntries();
		});
	}

	function start() {
		markEntries();

		document.addEventListener('input', function (event) {
			var t = event.target;
			if (t && t.matches && t.matches(ACTION_INPUT_SELECTOR)) {
				syncActionInputValue(t);
			}
		});

		if (typeof MutationObserver === 'undefined') {
			return;
		}
		var observer = new MutationObserver(scheduleMark);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['src', 'style'],
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
