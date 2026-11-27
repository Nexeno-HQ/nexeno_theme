<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Settings;

use OCA\NexenoTheme\Service\AppMenuEntry;
use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\Service\LoginStyle;
use OCA\NexenoTheme\Service\PrimaryColour;
use OCA\NexenoTheme\ThemeConfig;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IGroupManager;
use OCP\IUserSession;
use OCP\Settings\ISettings;

class Personal implements ISettings {
	public function __construct(
		private IUserSession $userSession,
		private CoreTheming $coreTheming,
		private IAppManager $appManager,
		private IGroupManager $groupManager,
		private LoginStyle $loginStyle,
		private PrimaryColour $primaryColour,
		private AppMenuEntry $appMenuEntry,
	) {
	}

	public function getForm(): TemplateResponse {
		$user = $this->userSession->getUser();
		$variant = $user === null ? ThemeConfig::VARIANT_OFF : $this->coreTheming->variant($user->getUID());
		$lastVariant = $user === null ? ThemeConfig::DEFAULT_LAST_VARIANT : $this->coreTheming->lastVariant($user->getUID());
		return new TemplateResponse(ThemeConfig::APP_ID, 'settings-personal', [
			'variant' => $variant,
			'lastVariant' => $lastVariant,
			'highContrastOn' => $user !== null && $this->coreTheming->chosenHighContrast($user->getUID()) !== null,
			'excludedApps' => $this->excludedAppNames(),
			// The login page switch is site-wide, so only admins see it.
			'isAdmin' => $user !== null && $this->groupManager->isAdmin($user->getUID()),
			'loginStyleEnabled' => $this->loginStyle->isEnabled(),
			'organisationColourEnabled' => $this->primaryColour->isOrganisationColourEnabled(),
			'appMenuShown' => $this->appMenuEntry->isShown(),
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
