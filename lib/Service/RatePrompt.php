<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Config\IUserConfig;
use OCP\IAppConfig;

/**
 * Decides when a user sees the "Rate this app" popup and stores their answer.
 */
class RatePrompt {
	public function __construct(
		private IAppConfig $appConfig,
		private IUserConfig $userConfig,
		private ITimeFactory $timeFactory,
	) {
	}

	/**
	 * Saves the install time once. The install repair step calls this; for instances that installed
	 * the app before the popup existed, the first check calls it instead, so the 7 days start then.
	 */
	public function installedAt(): int {
		$installedAt = $this->appConfig->getValueInt(ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT, 0);
		if ($installedAt <= 0) {
			$installedAt = $this->timeFactory->getTime();
			$this->appConfig->setValueInt(ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT, $installedAt);
		}
		return $installedAt;
	}

	public function isVisible(string $userId): bool {
		if ($this->userConfig->getValueBool($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_DONE, false)) {
			return false;
		}
		$now = $this->timeFactory->getTime();
		if ($now < $this->installedAt() + ThemeConfig::RATE_PROMPT_DELAY) {
			return false;
		}
		$snoozedUntil = $this->userConfig->getValueInt($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL, 0);
		return $now >= $snoozedUntil;
	}

	/**
	 * "later" hides the popup for another 7 days; "never" and "rated" hide it for good.
	 */
	public function answer(string $userId, string $action): void {
		if ($action === 'later') {
			$this->userConfig->setValueInt(
				$userId,
				ThemeConfig::APP_ID,
				ThemeConfig::CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL,
				$this->timeFactory->getTime() + ThemeConfig::RATE_PROMPT_DELAY,
			);
			return;
		}
		$this->userConfig->setValueBool($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_DONE, true);
	}
}
