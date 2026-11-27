<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\IConfig;

/**
 * The Nexeno look is applied with CSS only, so the user's own Nextcloud
 * theming settings stay untouched and still apply to excluded apps.
 */
class CoreTheming {
	/**
	 * Nextcloud themes passed on while a Nexeno variant is active. OpenDyslexic only changes the font. A
	 * high-contrast theme is a marker: the browser swaps it for the one that matches the Nexeno variant
	 * (light-highcontrast or dark-highcontrast), see nexeno-state.js normalizeThemes().
	 */
	private const KEEP_THEMES = ['opendyslexic', 'light-highcontrast', 'dark-highcontrast'];

	public function __construct(
		private IUserConfig $userConfig,
		private IConfig $config,
	) {
	}

	/** The user's saved Nexeno variant, "off" until they turn the theme on. */
	public function variant(string $userId): string {
		return $this->userConfig->getValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, ThemeConfig::VARIANT_OFF);
	}

	/** The variant last turned on, preselected when the theme is off. */
	public function lastVariant(string $userId): string {
		return $this->userConfig->getValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, ThemeConfig::DEFAULT_LAST_VARIANT);
	}

	public function enabledThemes(string $userId): array {
		$raw = $this->config->getUserValue($userId, ThemeConfig::THEMING_APP_ID, 'enabled-themes', '');
		$themes = $raw === '' ? null : json_decode($raw, true);

		return \is_array($themes) && $themes !== [] ? $themes : ['default'];
	}

	/**
	 * The high-contrast theme the user chose in Nextcloud (light-highcontrast or dark-highcontrast), or null. It
	 * decides light or dark while the Nexeno theme is on, until the user picks a Nexeno option, which turns it off.
	 */
	public function chosenHighContrast(string $userId): ?string {
		foreach ($this->enabledThemes($userId) as $themeId) {
			if (is_string($themeId) && str_ends_with($themeId, '-highcontrast')) {
				return $themeId;
			}
		}
		return null;
	}

	/**
	 * Theme ids to put on <body> while the given Nexeno variant is active.
	 * For "system" the browser swaps the "default" placeholder for "light" or "dark" once it knows the device setting.
	 */
	public function bodyThemes(string $userId, string $variant): array {
		$themes = $this->enabledThemes($userId);
		if (!in_array($variant, ThemeConfig::ENABLED_VARIANTS, true)) {
			return $themes;
		}
		$base = $variant === ThemeConfig::VARIANT_SYSTEM ? 'default' : $variant;

		return array_values(array_merge([$base], array_intersect($themes, self::KEEP_THEMES)));
	}

	/**
	 * Gives back the backups older versions kept, for every user who still has one.
	 *
	 * @return int How many users got their appearance back.
	 */
	public function restoreAllBackups(): int {
		$userIds = array_keys($this->userConfig->getValuesByUsers(ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKED_UP));
		foreach ($userIds as $userId) {
			// PHP turns numeric user ids used as array keys into ints.
			$this->restoreBackup((string)$userId);
		}
		return count($userIds);
	}

	/**
	 * Undo the theming values older versions of the theme wrote for the user.
	 */
	public function restoreBackup(string $userId): void {
		if (!$this->userConfig->getValueBool($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKED_UP, false)) {
			return;
		}

		foreach ([
			ThemeConfig::CONFIG_KEY_BG_BACKUP_IMAGE => 'background_image',
			ThemeConfig::CONFIG_KEY_BG_BACKUP_COLOR => 'background_color',
			ThemeConfig::CONFIG_KEY_BG_BACKUP_PRIMARY => 'primary_color',
			ThemeConfig::CONFIG_KEY_BG_BACKUP_THEMES => 'enabled-themes',
		] as $backupKey => $themingKey) {
			$value = $this->userConfig->getValueString($userId, ThemeConfig::APP_ID, $backupKey, '');
			if ($value === '') {
				$this->config->deleteUserValue($userId, ThemeConfig::THEMING_APP_ID, $themingKey);
			} else {
				$this->config->setUserValue($userId, ThemeConfig::THEMING_APP_ID, $themingKey, $value);
			}
			$this->userConfig->deleteUserConfig($userId, ThemeConfig::APP_ID, $backupKey);
		}
		$this->userConfig->deleteUserConfig($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKED_UP);

		$version = (int)$this->config->getUserValue($userId, ThemeConfig::THEMING_APP_ID, 'userCacheBuster', '0');
		$this->config->setUserValue($userId, ThemeConfig::THEMING_APP_ID, 'userCacheBuster', (string)($version + 1));
	}
}
