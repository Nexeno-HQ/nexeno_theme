/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';

	const SELECTORS = {
		navToggle: ['.app-navigation-toggle', '[data-cy-nav-toggle]', 'button[class*="navigation-toggle"]'],
		navSearchInput: ['.app-navigation-search input', '.app-navigation__search input', '.photos-filters-input input'],
		accountNav: ['.account-management__navigation', '[class*="account-management"] .app-navigation__content'],
		accountSettingsToggle: ['.account-management__settings-toggle', '[class*="settings-toggle"]'],
		appstoreMain: ['.app-appstore main'],
		appstoreTable: ['table'],
		appstoreGrid: ['ul[class*="appGrid"]', 'ul[class*="app-grid"]'],
		settingsMain: ['#app-content-vue.app-content', 'main.app-content', '.app-content', 'main#app-content[data-active-section-id]'],
		settingsSection: ['.settings-section', 'section[class*="settings-section"]:not([class*="loose-text"])'],
		tokensTable: ['table#app-tokens-table', 'table[id*="tokens-table"]'],
		textarea: ['.textarea__input', 'textarea[class*="textarea__"]'],
		generalPopup: ['.modal-container.general-popup'],
		popupActions: ['.dialog__actions'],
		popupSettingsNav: ['.app-settings__navigation', '.dialog__navigation'],
		secondaryPopupApps: ['#content.app-cookbook', '#content.app-news', '.app-cookbook', '.app-news'],
	};

	const CLASSES = {
		navFooter: 'app-navigation__footer',
		tableWrapper: 'table-wrapper',
		tokensWrapper: 'app-tokens-table-wrapper',
		looseText: 'settings-section__loose-text',
		hasValue: 'nexeno-has-value',
		secondaryPopup: 'secondary-popup',
		gridSizes: { s: 'small-view', m: 'medium-view', l: 'large-view' },
	};

	const BOUND_ATTR = 'data-nexeno-bound';
	const FOCUS_SUPPRESS_MS = 500;

	const query = (list) => list.join(', ');
	const find = (list, root) => (root || document).querySelector(query(list));
	const findAll = (list, root) => (root || document).querySelectorAll(query(list));

	const defer = window.requestAnimationFrame
		? (cb) => window.requestAnimationFrame(cb)
		: (cb) => window.setTimeout(cb, 0);

	function wrap(el, className) {
		if (!el || !el.parentNode || el.closest('.' + className)) {
			return;
		}
		const wrapper = document.createElement('div');
		wrapper.className = className;
		el.parentNode.insertBefore(wrapper, el);
		wrapper.appendChild(el);
	}

	function unwrap(el) {
		if (!el || !el.parentNode) {
			return;
		}
		while (el.firstChild) {
			el.parentNode.insertBefore(el.firstChild, el);
		}
		el.parentNode.removeChild(el);
	}

	function accountSettingsFooter() {
		const nav = find(SELECTORS.accountNav);
		if (!nav) {
			return;
		}
		const toggle = find(SELECTORS.accountSettingsToggle, nav);
		if (!toggle || !toggle.parentElement || toggle.parentElement.classList.contains(CLASSES.navFooter)) {
			return;
		}
		wrap(toggle, CLASSES.navFooter);
	}

	function appstoreTableWrapper() {
		const main = find(SELECTORS.appstoreMain);
		if (!main) {
			return;
		}
		const wrapper = main.querySelector('.' + CLASSES.tableWrapper);
		if (wrapper && !wrapper.querySelector('table')) {
			unwrap(wrapper);
		}
		const table = find(SELECTORS.appstoreTable, main);
		if (table && !table.parentElement.classList.contains(CLASSES.tableWrapper)) {
			wrap(table, CLASSES.tableWrapper);
		}
	}

	function appstoreGridSize() {
		const main = find(SELECTORS.appstoreMain);
		const grid = main && find(SELECTORS.appstoreGrid, main);
		if (!grid) {
			return;
		}
		const size = new URLSearchParams(window.location.search).get('grid');
		const active = CLASSES.gridSizes[size] || CLASSES.gridSizes.s;
		Object.values(CLASSES.gridSizes).forEach((name) => {
			grid.classList.toggle(name, name === active);
		});
	}

	const settingsRoutes = [
		{ className: 'admin-sharing', test: /\/settings\/admin\/sharing(?:\/|$)/i },
		{ className: 'admin-theming', test: /\/settings\/admin\/theming(?:\/|$)/i },
		{ className: 'admin-security', test: /\/settings\/admin\/security(?:\/|$)/i },
	];

	let appliedSectionClass = null;

	function sectionClassFromPath() {
		const path = window.location.pathname;
		const match = path.match(/\/settings\/(?:user|admin)\/([a-z0-9_-]+)/i);
		if (match) {
			return match[1];
		}
		if (/\/settings\/admin\/?$/i.test(path)) {
			return 'overview';
		}
		if (!/\/settings\/user\/?$/i.test(path)) {
			return null;
		}
		const original = document.getElementById('original-settings-content');
		return (original && original.dataset.activeSectionId) || 'personal-info';
	}

	function wrapLooseText(root) {
		findAll(SELECTORS.settingsSection, root).forEach((section) => {
			Array.from(section.childNodes).forEach((node) => {
				if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) {
					return;
				}
				const paragraph = document.createElement('p');
				paragraph.className = CLASSES.looseText;
				paragraph.textContent = node.nodeValue.trim();
				section.replaceChild(paragraph, node);
			});
		});
	}

	function settingsRouteClasses() {
		const main = find(SELECTORS.settingsMain);
		if (!main) {
			return;
		}
		const sectionClass = main.dataset.activeSectionId || sectionClassFromPath();
		if (sectionClass !== appliedSectionClass) {
			if (appliedSectionClass) {
				main.classList.remove(appliedSectionClass);
			}
			if (sectionClass) {
				main.classList.add(sectionClass);
			}
			appliedSectionClass = sectionClass;
		}
		settingsRoutes.forEach((route) => {
			main.classList.toggle(route.className, route.test.test(window.location.pathname));
		});
		if (main.classList.contains('admin-security')) {
			wrapLooseText(main);
		}
	}

	function tokensTableWrapper() {
		wrap(find(SELECTORS.tokensTable), CLASSES.tokensWrapper);
	}

	function textareaValueState() {
		findAll(SELECTORS.textarea).forEach((el) => {
			const sync = () => el.classList.toggle(CLASSES.hasValue, el.value.length > 0);
			if (el.hasAttribute(BOUND_ATTR)) {
				return;
			}
			el.setAttribute(BOUND_ATTR, '1');
			el.addEventListener('input', sync);
			sync();
		});
	}

	function secondaryPopupClass() {
		if (!find(SELECTORS.secondaryPopupApps)) {
			return;
		}
		findAll(SELECTORS.generalPopup).forEach((popup) => {
			const isDialog = !!find(SELECTORS.popupActions, popup) && !find(SELECTORS.popupSettingsNav, popup);
			popup.classList.toggle(CLASSES.secondaryPopup, isDialog);
		});
	}

	const tasks = [
		accountSettingsFooter,
		appstoreTableWrapper,
		appstoreGridSize,
		settingsRouteClasses,
		tokensTableWrapper,
		textareaValueState,
		secondaryPopupClass,
	];

	function runTasks() {
		tasks.forEach((task) => {
			try {
				task();
			} catch (e) {
				console.debug('[nexeno] navigation task skipped', task.name, e);
			}
		});
	}

	let scheduled = false;

	function schedule() {
		if (scheduled) {
			return;
		}
		scheduled = true;
		defer(() => {
			scheduled = false;
			runTasks();
		});
	}

	let suppressFocusUntil = 0;

	function onToggleClick(e) {
		if (e.target.closest(query(SELECTORS.navToggle))) {
			suppressFocusUntil = Date.now() + FOCUS_SUPPRESS_MS;
		}
	}

	function onFocusIn(e) {
		if (Date.now() > suppressFocusUntil) {
			return;
		}
		const input = e.target.closest(query(SELECTORS.navSearchInput));
		if (input) {
			input.blur();
		}
	}

	function start() {
		runTasks();
		document.addEventListener('click', onToggleClick, true);
		document.addEventListener('focusin', onFocusIn, true);
		window.addEventListener('popstate', schedule);
		if (typeof MutationObserver === 'undefined') {
			return;
		}
		new MutationObserver(schedule).observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['class', 'style'],
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
