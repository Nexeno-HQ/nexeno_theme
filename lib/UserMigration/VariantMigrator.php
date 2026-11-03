<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\UserMigration;

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
	) {
	}

	public function export(IUser $user, IExportDestination $exportDestination, OutputInterface $output): void {
		$userId = $user->getUID();
		$variant = $this->userConfig->getValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, 'off');
		$lastVariant = $this->userConfig->getValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, 'light');

		if ($variant === 'off' && $lastVariant === 'light') {
			return;
		}

		$exportDestination->addFileContents(self::EXPORT_PATH, json_encode([
			'variant' => $variant,
			'last_variant' => $lastVariant,
		], JSON_THROW_ON_ERROR));
	}

	public function import(IUser $user, IImportSource $importSource, OutputInterface $output): void {
		if (!$importSource->pathExists(self::EXPORT_PATH)) {
			return;
		}

		$data = json_decode($importSource->getFileContents(self::EXPORT_PATH), true, flags: JSON_THROW_ON_ERROR);
		$userId = $user->getUID();

		$this->userConfig->setValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, $data['variant'] ?? 'off');
		$this->userConfig->setValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, $data['last_variant'] ?? 'light');
	}

	public function getId(): string {
		return ThemeConfig::APP_ID;
	}

	public function getDisplayName(): string {
		return 'Nexeno theme';
	}

	public function getDescription(): string {
		return 'Your selected Nexeno theme variant (light/dark/off).';
	}

	public function getVersion(): int {
		return 1;
	}

	public function canImport(IImportSource $importSource): bool {
		return $importSource->pathExists(self::EXPORT_PATH);
	}
}
