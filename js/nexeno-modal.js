/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';

	var MODAL = '.modal-container';
	var FILES_APP = '.app-files';
	var OFFICE_APP = '.office-overview__content';
	var PHOTOS_APP = '.app-photos';
	var USERS_SETTINGS_PATH = /\/settings\/users/;
	var GROUPWARE_SETTINGS_PATH = /\/settings\/admin\/groupware/;
	var GROUPWARE_DIALOG_SELECTOR = '.dialog__name';
	var CLASS = 'general-popup';
	var SECTION = 'section[id^="settings-section_"]';
	var SECTION_ID_PREFIX = 'settings-section_';
	var SECONDARY_CLASS = 'secondary-popup';
	var SECONDARY_SELECTORS = [
		'.new-node-dialog__form',
		'.custom-reminder-modal',
		'.systemtags-picker__input',
		'.nc-generic-dialog',
		'.office-overview__create-form',
		'.version-label-modal',
		'.reference-picker-modal--content',
		'.collective-members',
		'.modal-collective-wrapper',
		'.modal-collective-members',
		'.file-request-dialog__form',
	];
	var VIEWER_FILE_WRAPPER = '.viewer__file-wrapper';
	var PHOTOS_SETTINGS_CLASS = 'photos-setting-modal';
	var PHOTOS_SETTINGS_SELECTOR = '.app-settings__content';
	var ALBUM_POPUP_CLASS = 'album-popup';
	var ALBUM_POPUP_SELECTOR = '.album-form, .manage-collaborators';
	var CUSTOM_DATE_POPUP_CLASS = 'custom-date-popup';
	var CUSTOM_DATE_POPUP_SELECTOR = '.date-range-picker-dialog';
	var ADD_PHOTOS_POPUP_CLASS = 'add-photos-popup';
	var ADD_PHOTOS_POPUP_SELECTOR = '.photos-picker';
	var ADD_TEAM_POPUP_CLASS = 'add-team-popup';
	var ADD_TEAM_POPUP_SELECTOR = 'input[placeholder="New team name"]';
	var APP_API_POPUP_CLASS = 'app-api-popup';
	var APP_API_POPUP_SELECTOR = '.register-daemon-config-body, .daemon-config-modal-details';
	var APP_API_INFO_DIALOG_SELECTOR = '.dialog__name';
	var PHOTOS_SETTING_INNER_CLASS = 'photos-setting-inner';
	var PHOTOS_SETTING_INNER_SELECTOR = '.file-picker';
	var MOVE_COPY_MODAL_CLASS = 'move-copy-modal';
	var ACCOUNT_POPUP_CLASS = 'account-popup';
	var ACCOUNT_MGT_POPUP_CLASS = 'account-mgt-popup';
	var CONFIRM_DIALOG_SELECTOR = '.modal__header, .modal__button-row';
	var DELETE_POPUP_CLASS = 'delete-popup';
	var AUTH_POPUP_CLASS = 'auth-popup';
	var PASSWORD_CONFIRM_DIALOG_SELECTOR = '.dialog__name';
	var PASSWORD_CONFIRM_DIALOG_TEXT = t('nexeno_theme', 'Authentication required');
	var GLOBAL_SEARCH_CLASS = 'global-search';
	var GLOBAL_SEARCH_SELECTOR = '.unified-search-modal';
	var ENCRYPTION_POPUP_CLASS = 'encryption-popup';
	var ENCRYPTION_DIALOG_NAME_SELECTOR = '.dialog__name';
	var ENCRYPTION_DIALOG_TEXT = t('nexeno_theme', 'Confirm enabling encryption');
	var IMAGE_PREVIEW_POPUP_CLASS = 'image-preview-popup';
	var IMAGE_PREVIEW_POPUP_SELECTOR = '.preview-modal__content';
	var LOG_READER_POPUP_CLASS = 'log-reader-popup';
	var LOG_READER_DIALOG_NAME_SELECTOR = '.dialog__name';
	var LOG_READER_DIALOG_TEXT = t('nexeno_theme', 'Log reader settings');

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

	var FILE_PICKER_ROW = 'tr.file-picker__row';
	var FILE_PICKER_FOLDER_ICONS = '.folder-icon, .folder-open-icon';
	var PICKER_MARK_ATTR = 'data-nexeno-type';
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

	function classOfPickerRow(row) {
		if (row.querySelector(FILE_PICKER_FOLDER_ICONS)) {
			return 'folder';
		}
		return classOfFile(row.getAttribute('data-filename') || '');
	}

	function markPicker(el, next) {
		var previous = el.getAttribute(PICKER_MARK_ATTR) || '';
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
		el.setAttribute(PICKER_MARK_ATTR, next);
	}

	function markFilePickerRows(modal) {
		var rows = modal.querySelectorAll(FILE_PICKER_ROW);
		for (var i = 0; i < rows.length; i++) {
			markPicker(rows[i], classOfPickerRow(rows[i]));
		}
	}

	function isEncryptionConfirmDialog(modal) {
		var name = modal.querySelector(ENCRYPTION_DIALOG_NAME_SELECTOR);
		return !!name && (name.textContent || '').trim() === ENCRYPTION_DIALOG_TEXT;
	}

	function isLogReaderSettingsDialog(modal) {
		var name = modal.querySelector(LOG_READER_DIALOG_NAME_SELECTOR);
		return !!name && (name.textContent || '').trim() === LOG_READER_DIALOG_TEXT;
	}

	function isPasswordConfirmDialog(modal) {
		var name = modal.querySelector(PASSWORD_CONFIRM_DIALOG_SELECTOR);
		return !!name && (name.textContent || '').trim() === PASSWORD_CONFIRM_DIALOG_TEXT;
	}

	function isSecondaryPopup(modal) {
		for (var i = 0; i < SECONDARY_SELECTORS.length; i++) {
			var selector = SECONDARY_SELECTORS[i];
			if (modal.matches(selector) || modal.querySelector(selector)) {
				return true;
			}
		}
		return false;
	}

	function markSections(modal) {
		var sections = modal.querySelectorAll(SECTION);
		for (var i = 0; i < sections.length; i++) {
			var key = sections[i].id.slice(SECTION_ID_PREFIX.length);
			if (key) {
				sections[i].classList.add(key + '-section');
			}
		}
	}

	function mark() {
		if (!document.querySelector(MODAL)) {
			return;
		}

		var onUsersSettingsPage = USERS_SETTINGS_PATH.test(window.location.pathname);
		var onGroupwareSettingsPage = GROUPWARE_SETTINGS_PATH.test(window.location.pathname);
		var modals = document.querySelectorAll(MODAL);
		for (var i = 0; i < modals.length; i++) {
			if (modals[i].querySelector(VIEWER_FILE_WRAPPER)) {
				modals[i].classList.remove(CLASS);
				continue;
			}
			var isAccountSettingsDialog = onUsersSettingsPage && modals[i].querySelector(PHOTOS_SETTINGS_SELECTOR);
			var isConfirmDialog = onUsersSettingsPage && modals[i].querySelector(CONFIRM_DIALOG_SELECTOR);
			var isPasswordConfirm = isPasswordConfirmDialog(modals[i]);
			modals[i].classList.add(CLASS);
			if (onUsersSettingsPage && !isAccountSettingsDialog && !isConfirmDialog && !isPasswordConfirm) {
				modals[i].classList.add(ACCOUNT_POPUP_CLASS);
			} else {
				modals[i].classList.remove(ACCOUNT_POPUP_CLASS);
			}
			if (isAccountSettingsDialog) {
				modals[i].classList.add(ACCOUNT_MGT_POPUP_CLASS);
			} else {
				modals[i].classList.remove(ACCOUNT_MGT_POPUP_CLASS);
			}
			var isAppApiInfoDialog = document.querySelector('.' + APP_API_POPUP_CLASS) && modals[i].querySelector(APP_API_INFO_DIALOG_SELECTOR);
			var isGroupwareDialog = onGroupwareSettingsPage && modals[i].querySelector(GROUPWARE_DIALOG_SELECTOR);
			if (isConfirmDialog) {
				modals[i].classList.add(DELETE_POPUP_CLASS);
			} else if (isSecondaryPopup(modals[i]) || isAppApiInfoDialog || isPasswordConfirm || isGroupwareDialog) {
				modals[i].classList.add(SECONDARY_CLASS);
			}
			if (isPasswordConfirm) {
				modals[i].classList.add(AUTH_POPUP_CLASS);
			} else {
				modals[i].classList.remove(AUTH_POPUP_CLASS);
			}
			if (document.querySelector(PHOTOS_APP) && modals[i].querySelector(PHOTOS_SETTINGS_SELECTOR)) {
				modals[i].classList.add(PHOTOS_SETTINGS_CLASS);
			}
			if (modals[i].querySelector(ALBUM_POPUP_SELECTOR)) {
				modals[i].classList.add(ALBUM_POPUP_CLASS);
			}
			if (modals[i].querySelector(CUSTOM_DATE_POPUP_SELECTOR)) {
				modals[i].classList.add(CUSTOM_DATE_POPUP_CLASS);
			}
			if (modals[i].querySelector(ADD_PHOTOS_POPUP_SELECTOR)) {
				modals[i].classList.add(ADD_PHOTOS_POPUP_CLASS);
			}
			if (modals[i].querySelector(ADD_TEAM_POPUP_SELECTOR)) {
				modals[i].classList.add(ADD_TEAM_POPUP_CLASS);
			}
			if (modals[i].querySelector(APP_API_POPUP_SELECTOR)) {
				modals[i].classList.add(APP_API_POPUP_CLASS);
			}
			if (document.querySelector(PHOTOS_APP) && modals[i].querySelector(PHOTOS_SETTING_INNER_SELECTOR)) {
				modals[i].classList.add(PHOTOS_SETTING_INNER_CLASS);
			}
			if (document.querySelector(FILES_APP) && modals[i].querySelector(PHOTOS_SETTING_INNER_SELECTOR)) {
				modals[i].classList.add(MOVE_COPY_MODAL_CLASS);
			}
			if (isEncryptionConfirmDialog(modals[i])) {
				modals[i].classList.add(ENCRYPTION_POPUP_CLASS);
			}
			if (modals[i].querySelector(IMAGE_PREVIEW_POPUP_SELECTOR)) {
				modals[i].classList.add(IMAGE_PREVIEW_POPUP_CLASS);
			}
			if (isLogReaderSettingsDialog(modals[i])) {
				modals[i].classList.add(LOG_READER_POPUP_CLASS);
			}
			if (modals[i].querySelector(GLOBAL_SEARCH_SELECTOR)) {
				modals[i].classList.add(GLOBAL_SEARCH_CLASS);
			}
			markFilePickerRows(modals[i]);
			markSections(modals[i]);
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
			mark();
		});
	}

	function start() {
		scheduleMark();

		if (typeof MutationObserver === 'undefined') {
			return;
		}
		new MutationObserver(scheduleMark).observe(document.body, {
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
