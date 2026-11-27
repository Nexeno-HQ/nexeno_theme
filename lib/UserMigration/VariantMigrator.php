<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\UserMigration;

use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\IUser;
use OCP\UserMigration\IExportDestination;
use OCP\UserMigration\IImportSource;
use OCP\UserMigration\IMigrator;
use Symfony\Component\Console\Output\OutputInterface;

class VariantMigrator implements IMigrator {
	private const EXPORT_PATH = ThemeConfig::APP_ID . '/variant.json';

	public function __construct(
		private IUserConfig $userConfig,
		private CoreTheming $coreTheming,
	) {
	}

	public function export(IUser $user, IExportDestination $exportDestination, OutputInterface $output): void {
		$userId = $user->getUID();
		$data = [
			'variant' => $this->coreTheming->variant($userId),
			'last_variant' => $this->coreTheming->lastVariant($userId),
		];
		// The answer to the "Rate this app" popup is the user's data too; only written once they answered.
		if ($this->userConfig->getValueBool($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_DONE, false)) {
			$data['rate_prompt_done'] = true;
		}
		$snoozedUntil = $this->userConfig->getValueInt($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL, 0);
		if ($snoozedUntil > 0) {
			$data['rate_prompt_snoozed_until'] = $snoozedUntil;
		}

		if ($data === ['variant' => ThemeConfig::VARIANT_OFF, 'last_variant' => ThemeConfig::DEFAULT_LAST_VARIANT]) {
			return;
		}

		$exportDestination->addFileContents(self::EXPORT_PATH, json_encode($data, JSON_THROW_ON_ERROR));
	}

	public function import(IUser $user, IImportSource $importSource, OutputInterface $output): void {
		if (!$importSource->pathExists(self::EXPORT_PATH)) {
			return;
		}

		// The file comes from outside, so broken JSON and unknown values fall back to the defaults instead of
		// stopping the import of the whole account.
		$data = json_decode($importSource->getFileContents(self::EXPORT_PATH), true);
		$data = is_array($data) ? $data : [];
		$variant = in_array($data['variant'] ?? null, ThemeConfig::VARIANTS, true) ? $data['variant'] : ThemeConfig::VARIANT_OFF;
		$lastVariant = in_array($data['last_variant'] ?? null, ThemeConfig::ENABLED_VARIANTS, true) ? $data['last_variant'] : ThemeConfig::DEFAULT_LAST_VARIANT;
		$userId = $user->getUID();

		$this->userConfig->setValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, $variant);
		$this->userConfig->setValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, $lastVariant);
		// Files from older versions have no answer: the popup then behaves as for a new user.
		if (($data['rate_prompt_done'] ?? null) === true) {
			$this->userConfig->setValueBool($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_DONE, true);
		}
		if (is_int($data['rate_prompt_snoozed_until'] ?? null) && $data['rate_prompt_snoozed_until'] > 0) {
			$this->userConfig->setValueInt($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL, $data['rate_prompt_snoozed_until']);
		}
	}

	public function getId(): string {
		return ThemeConfig::APP_ID;
	}

	public function getDisplayName(): string {
		return 'Nexeno theme';
	}

	public function getDescription(): string {
		return 'Your selected Nexeno theme variant (system/light/dark/off) and your answer to its rating popup.';
	}

	public function getVersion(): int {
		return 1;
	}

	public function canImport(IImportSource $importSource): bool {
		return $importSource->pathExists(self::EXPORT_PATH);
	}
}
