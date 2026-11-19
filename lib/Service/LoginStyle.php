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
 * The site-wide switch for the Nexeno look on the login page. It is one value for the whole instance,
 * because the login page is shown before anyone signs in. Admins can also set it with
 * `occ config:app:set nexeno_theme login_style --value=no`.
 */
class LoginStyle {
	public function __construct(
		private IAppConfig $appConfig,
	) {
	}

	/**
	 * Anything other than an explicit "no" counts as on, so a mistyped occ value never silently
	 * removes the styling admins expect.
	 */
	public function isEnabled(): bool {
		return $this->appConfig->getValueString(
			ThemeConfig::APP_ID,
			ThemeConfig::APP_CONFIG_KEY_LOGIN_STYLE,
			ThemeConfig::DEFAULT_LOGIN_STYLE,
		) !== ThemeConfig::LOGIN_STYLE_OFF;
	}

	public function setEnabled(bool $enabled): void {
		$this->appConfig->setValueString(
			ThemeConfig::APP_ID,
			ThemeConfig::APP_CONFIG_KEY_LOGIN_STYLE,
			$enabled ? ThemeConfig::LOGIN_STYLE_ON : ThemeConfig::LOGIN_STYLE_OFF,
		);
	}
}
