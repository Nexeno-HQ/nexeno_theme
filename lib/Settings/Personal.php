<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Settings;

use OCA\NexenoTheme\Service\LoginStyle;
use OCA\NexenoTheme\ThemeConfig;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Config\IUserConfig;
use OCP\IGroupManager;
use OCP\IUserSession;
use OCP\Settings\ISettings;

class Personal implements ISettings {
	public function __construct(
		private IUserSession $userSession,
		private IUserConfig $userConfig,
		private IAppManager $appManager,
		private IGroupManager $groupManager,
		private LoginStyle $loginStyle,
	) {
	}

	public function getForm(): TemplateResponse {
		$user = $this->userSession->getUser();
		$variant = $user === null ? 'off' : $this->userConfig->getValueString(
			$user->getUID(),
			ThemeConfig::APP_ID,
			ThemeConfig::CONFIG_KEY_VARIANT,
			'off',
		);
		$lastVariant = $user === null ? ThemeConfig::DEFAULT_LAST_VARIANT : $this->userConfig->getValueString(
			$user->getUID(),
			ThemeConfig::APP_ID,
			ThemeConfig::CONFIG_KEY_LAST_VARIANT,
			ThemeConfig::DEFAULT_LAST_VARIANT,
		);
		return new TemplateResponse(ThemeConfig::APP_ID, 'settings-personal', [
			'variant' => $variant,
			'lastVariant' => $lastVariant,
			'excludedApps' => $this->excludedAppNames(),
			// The login page switch is site-wide, so only admins see it.
			'isAdmin' => $user !== null && $this->groupManager->isAdmin($user->getUID()),
			'loginStyleEnabled' => $this->loginStyle->isEnabled(),
		]);
	}

	private function excludedAppNames(): array {
		$names = [];
		foreach (ThemeConfig::EXCLUDED_APPS as $appId) {
			if ($this->appManager->isInstalled($appId)) {
				$names[] = $this->appManager->getAppInfo($appId)['name'] ?? $appId;
			}
		}
		return $names;
	}

	public function getSection(): string {
		return 'theming';
	}

	public function getPriority(): int {
		return 10;
	}
}
