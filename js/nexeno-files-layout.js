/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';
	var LIST = '.files-list';
	var TBODY = 'tbody.files-list__tbody';
	var PATCHED = ['itemWidth', 'itemHeight'];

	var states = new WeakMap();

	function isThemed() {
		var body = document.body;
		return !!body && (
			body.hasAttribute('data-nexeno-light')
			|| body.hasAttribute('data-nexeno-dark')
		);
	}
	function fileListWidth() {
		var el = document.getElementById('app-content-vue') || document.body;
		var style = window.getComputedStyle(el);
		var width = el.clientWidth
			- (parseFloat(style.paddingInlineStart || style.paddingLeft) || 0)
			- (parseFloat(style.paddingInlineEnd || style.paddingRight) || 0);
		return width > 0 ? width : 0;
	}

	function columnCount(tbody) {
		var tracks = window.getComputedStyle(tbody).gridTemplateColumns;
		if (!tracks || tracks === 'none') {
			return 1;
		}
		return tracks.trim().split(/\s+/).length;
	}
	function rowPitch(tbody, columns) {
		var rows = tbody.children;
		if (!rows.length) {
			return 0;
		}
		if (rows.length > columns) {
			var delta = rows[columns].offsetTop - rows[0].offsetTop;
			if (delta > 0) {
				return delta;
			}
		}
		var height = rows[0].offsetHeight;
		if (!height) {
			return 0;
		}
		return height + (parseFloat(window.getComputedStyle(tbody).rowGap) || 0);
	}

	function measure(tbody) {
		var columns = columnCount(tbody);
		var width = fileListWidth();
		var pitch = rowPitch(tbody, columns);
		if (!columns || !width || !pitch) {
			return null;
		}
		return {
			itemWidth: Math.max(1, width / columns - 0.5),
			itemHeight: pitch,
		};
	}
	function invalidate(vm) {
		var watchers = vm._computedWatchers;
		for (var key in watchers) {
			watchers[key].dirty = true;
		}
		if (vm.$forceUpdate) {
			vm.$forceUpdate();
		}
	}

	function patch(vm, metrics) {
		var state = states.get(vm);
		if (!state) {
			state = { originals: {}, metrics: metrics };
			for (var i = 0; i < PATCHED.length; i++) {
				(function (key) {
					state.originals[key] = Object.getOwnPropertyDescriptor(vm, key);
					Object.defineProperty(vm, key, {
						configurable: true,
						enumerable: true,
						get: function () {
							return state.metrics[key];
						},
					});
				})(PATCHED[i]);
			}
			states.set(vm, state);
			invalidate(vm);
			return;
		}
		if (Math.abs(metrics.itemWidth - state.metrics.itemWidth) < 0.5
			&& Math.abs(metrics.itemHeight - state.metrics.itemHeight) < 0.5) {
			return;
		}
		state.metrics = metrics;
		invalidate(vm);
	}

	function unpatch(vm) {
		var state = states.get(vm);
		if (!state) {
			return;
		}
		for (var i = 0; i < PATCHED.length; i++) {
			var key = PATCHED[i];
			if (state.originals[key]) {
				Object.defineProperty(vm, key, state.originals[key]);
			} else {
				delete vm[key];
			}
		}
		states.delete(vm);
		invalidate(vm);
	}

	function sync() {
		var lists = document.querySelectorAll(LIST);
		var themed = isThemed();
		for (var i = 0; i < lists.length; i++) {
			var vm = lists[i].__vue__;
			if (!vm) {
				continue;
			}
			if (!themed) {
				unpatch(vm);
				continue;
			}
			var tbody = lists[i].querySelector(TBODY);
			if (!tbody) {
				continue;
			}
			var metrics = measure(tbody);
			if (metrics) {
				patch(vm, metrics);
			}
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
			attributes: true,
			attributeFilter: ['class', 'data-nexeno-light', 'data-nexeno-dark'],
		});

		window.addEventListener('resize', scheduleSync, { passive: true });
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
