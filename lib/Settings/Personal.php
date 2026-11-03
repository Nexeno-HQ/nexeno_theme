<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Settings;

use OCA\NexenoTheme\ThemeConfig;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Config\IUserConfig;
use OCP\IUserSession;
use OCP\Settings\ISettings;

class Personal implements ISettings {
	public function __construct(
		private IUserSession $userSession,
		private IUserConfig $userConfig,
		private IAppManager $appManager,
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
		$lastVariant = $user === null ? 'light' : $this->userConfig->getValueString(
			$user->getUID(),
			ThemeConfig::APP_ID,
			ThemeConfig::CONFIG_KEY_LAST_VARIANT,
			'light',
		);
		return new TemplateResponse(ThemeConfig::APP_ID, 'settings-personal', [
			'variant' => $variant,
			'lastVariant' => $lastVariant,
			'excludedApps' => $this->excludedAppNames(),
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
