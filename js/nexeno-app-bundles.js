/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';
	var CLASS_NAME = 'table-wrapper-section';
	var CONTENT_SELECTOR = '[class*="appstoreApp__content"]';
	var ARROW = '↗';
	var APPSTORE_SIDEBAR_CLASS = 'appstore-sidebar';
	var APPSTORE_SIDEBAR_SELECTOR = '.app-appstore .app-sidebar';

	function wrapArrow(content) {
		var texts = content.querySelectorAll('.button-vue__text');
		for (var i = 0; i < texts.length; i++) {
			var el = texts[i];
			if (el.querySelector('.text-arrow-icon')) {
				continue;
			}
			var text = el.textContent;
			var idx = text.indexOf(ARROW);
			if (idx === -1) {
				continue;
			}
			var before = text.slice(0, idx);
			var after = text.slice(idx + 1);
			el.textContent = '';
			el.appendChild(document.createTextNode(before));
			var span = document.createElement('span');
			span.className = 'text-arrow-icon';
			span.textContent = ARROW;
			el.appendChild(span);
			if (after) {
				el.appendChild(document.createTextNode(after));
			}
		}
	}

	function wrapTables(content) {
		var tables = content.querySelectorAll('table');
		for (var i = 0; i < tables.length; i++) {
			var table = tables[i];
			if (table.closest('.table-wrapper')) {
				continue;
			}
			var wrapper = document.createElement('div');
			wrapper.className = 'table-wrapper';
			table.parentNode.insertBefore(wrapper, table);
			wrapper.appendChild(table);
		}
	}

	function markAppstoreSidebar() {
		var sidebars = document.querySelectorAll(APPSTORE_SIDEBAR_SELECTOR);
		for (var i = 0; i < sidebars.length; i++) {
			sidebars[i].classList.add(APPSTORE_SIDEBAR_CLASS);
		}
	}

	function sync() {
		markAppstoreSidebar();
		var content = document.querySelector(CONTENT_SELECTOR);
		if (!content) {
			return;
		}
		wrapTables(content);
		wrapArrow(content);
		var sections = content.querySelectorAll('section');
		for (var i = 0; i < sections.length; i++) {
			sections[i].classList.add(CLASS_NAME);
		}
	}

	var scheduled = false;
	var defer = window.requestAnimationFrame
		? function (cb) { window.requestAnimationFrame(cb); }
		: function (cb) { window.setTimeout(cb, 0); };

	function scheduleSync() {
		if (scheduled) {
			return;
		}
		scheduled = true;
		defer(function () {
			scheduled = false;
			sync();
		});
	}

	function start() {
		scheduleSync();

		if (typeof MutationObserver === 'undefined') {
			return;
		}
		new MutationObserver(scheduleSync).observe(document.body, {
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
