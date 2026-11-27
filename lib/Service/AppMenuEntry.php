<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCA\NexenoTheme\ThemeConfig;
use OCP\IAppConfig;

/**
 * The site-wide switch for the "Nexeno Theme" entry in the app menu. Admins can also set it with
 * `occ config:app:set nexeno_theme app_menu --value=no`.
 */
class AppMenuEntry {
	public function __construct(
		private IAppConfig $appConfig,
	) {
	}

	/**
	 * Anything other than an explicit "no" counts as shown, as for the login page switch.
	 */
	public function isShown(): bool {
		return $this->appConfig->getValueString(
			ThemeConfig::APP_ID,
			ThemeConfig::APP_CONFIG_KEY_APP_MENU,
			ThemeConfig::DEFAULT_APP_MENU,
		) !== ThemeConfig::APP_MENU_HIDDEN;
	}

	public function setShown(bool $shown): void {
		$this->appConfig->setValueString(
			ThemeConfig::APP_ID,
			ThemeConfig::APP_CONFIG_KEY_APP_MENU,
			$shown ? ThemeConfig::APP_MENU_SHOWN : ThemeConfig::APP_MENU_HIDDEN,
		);
	}
}
