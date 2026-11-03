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
	private const KEEP_THEMES = ['opendyslexic'];

	public function __construct(
		private IUserConfig $userConfig,
		private IConfig $config,
	) {
	}

	public function enabledThemes(string $userId): array {
		$raw = $this->config->getUserValue($userId, ThemeConfig::THEMING_APP_ID, 'enabled-themes', '');
		$themes = $raw === '' ? null : json_decode($raw, true);

		return \is_array($themes) && $themes !== [] ? $themes : ['default'];
	}

	/**
	 * Theme ids to put on <body> while the given Nexeno variant is active.
	 */
	public function bodyThemes(string $userId, string $variant): array {
		$themes = $this->enabledThemes($userId);
		if ($variant !== 'light' && $variant !== 'dark') {
			return $themes;
		}

		return array_values(array_merge([$variant], array_intersect($themes, self::KEEP_THEMES)));
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
