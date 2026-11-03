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


	public const CONFIG_KEY_VARIANT = 'variant';
	public const CONFIG_KEY_LAST_VARIANT = 'last_variant';
	public const CONFIG_KEY_BG_BACKED_UP = 'bg_backed_up';
	public const CONFIG_KEY_BG_BACKUP_IMAGE = 'bg_backup_image';
	public const CONFIG_KEY_BG_BACKUP_COLOR = 'bg_backup_color';
	public const CONFIG_KEY_BG_BACKUP_PRIMARY = 'bg_backup_primary';
	public const CONFIG_KEY_BG_BACKUP_THEMES = 'bg_backup_themes';
}
