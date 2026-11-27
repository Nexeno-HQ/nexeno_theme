<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme;

class ThemeConfig {
	public const APP_ID = 'nexeno_theme';
	public const THEMING_APP_ID = 'theming';

	/**
	 * Apps rendered without the Nexeno theme (matches the `app-<id>` class on #content).
	 */
	public const EXCLUDED_APPS = [
		'nexeno_project',
	];

	/**
	 * Saved variants. "system" follows the device's light or dark setting and is resolved in the browser.
	 */
	public const VARIANT_OFF = 'off';
	public const VARIANT_SYSTEM = 'system';
	public const VARIANTS = [self::VARIANT_OFF, self::VARIANT_SYSTEM, 'light', 'dark'];
	public const ENABLED_VARIANTS = [self::VARIANT_SYSTEM, 'light', 'dark'];
	/** Variant preselected for users who have not chosen one yet. */
	public const DEFAULT_LAST_VARIANT = self::VARIANT_SYSTEM;

	public const CONFIG_KEY_VARIANT = 'variant';
	public const CONFIG_KEY_LAST_VARIANT = 'last_variant';
	public const CONFIG_KEY_BG_BACKED_UP = 'bg_backed_up';
	public const CONFIG_KEY_BG_BACKUP_IMAGE = 'bg_backup_image';
	public const CONFIG_KEY_BG_BACKUP_COLOR = 'bg_backup_color';
	public const CONFIG_KEY_BG_BACKUP_PRIMARY = 'bg_backup_primary';
	public const CONFIG_KEY_BG_BACKUP_THEMES = 'bg_backup_themes';

	/**
	 * Site-wide switch (app config, "yes" or "no") for the Nexeno look on the login page. The login page
	 * is shown before anyone signs in, so it cannot follow a per-user choice. Only admins can change it.
	 */
	public const APP_CONFIG_KEY_LOGIN_STYLE = 'login_style';
	public const LOGIN_STYLE_ON = 'yes';
	public const LOGIN_STYLE_OFF = 'no';
	/** On by default, so existing installs keep the styled login page. */
	public const DEFAULT_LOGIN_STYLE = self::LOGIN_STYLE_ON;

	/**
	 * Site-wide switch (app config, "yes" or "no") for the "Nexeno Theme" entry in the app menu. Hiding it only
	 * removes the entry; the theme and its settings under Personal settings → Appearance and accessibility stay.
	 */
	public const APP_CONFIG_KEY_APP_MENU = 'app_menu';
	public const APP_MENU_SHOWN = 'yes';
	public const APP_MENU_HIDDEN = 'no';
	/** Shown by default, so existing installs keep the entry. */
	public const DEFAULT_APP_MENU = self::APP_MENU_SHOWN;

	/**
	 * Site-wide switch (app config, "yes" or "no"): show the organisation's colour from Administration settings
	 * → Theming in place of the Nexeno blue. Off by default, so existing installs stay blue. Only admins can change it.
	 */
	public const APP_CONFIG_KEY_ORGANISATION_COLOUR = 'organisation_colour';
	public const ORGANISATION_COLOUR_ON = 'yes';
	public const ORGANISATION_COLOUR_OFF = 'no';

	/**
	 * "Rate this app" popup. The instance install time (app config, Unix seconds) starts the clock;
	 * each user then sees the popup once RATE_PROMPT_DELAY has passed, again RATE_PROMPT_DELAY after
	 * closing it, and never after "Rate it" or "Do not show again".
	 */
	public const APP_CONFIG_KEY_INSTALLED_AT = 'installed_at';
	public const CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL = 'rate_prompt_snoozed_until';
	public const CONFIG_KEY_RATE_PROMPT_DONE = 'rate_prompt_done';
	public const RATE_PROMPT_DELAY = 7 * 24 * 60 * 60;
	/** Answers the popup sends: "later" (close button), "never" (do not show again), "rated" (rate it). */
	public const RATE_PROMPT_ACTIONS = ['later', 'never', 'rated'];

	/** Initial state with the user's own Nextcloud theme ids, so the browser can switch to "off" without waiting for the server. */
	public const INITIAL_STATE_USER_THEMES = 'user-themes';

	/**
	 * Initial state, only while the theme is off: {styles: string[], scripts: string[]}, the addresses of the
	 * theme's files, which nexeno-state.js adds to the page when the user turns the theme on.
	 */
	public const INITIAL_STATE_ASSETS = 'assets';
}
