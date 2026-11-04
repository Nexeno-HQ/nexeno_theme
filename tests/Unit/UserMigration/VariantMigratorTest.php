<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\UserMigration;

use OCA\NexenoTheme\ThemeConfig;
use OCA\NexenoTheme\UserMigration\VariantMigrator;
use OCP\Config\IUserConfig;
use OCP\IUser;
use OCP\UserMigration\IExportDestination;
use OCP\UserMigration\IImportSource;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Output\OutputInterface;

final class VariantMigratorTest extends TestCase {
	private const PATH = 'nexeno_theme/variant.json';

	private function user(): IUser {
		$user = $this->createStub(IUser::class);
		$user->method('getUID')->willReturn('alice');
		return $user;
	}

	private function storedSettings(string $variant, string $lastVariant): IUserConfig {
		$config = $this->createStub(IUserConfig::class);
		$config->method('getValueString')->willReturnMap([
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, 'off', false, $variant],
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, 'light', false, $lastVariant],
		]);
		return $config;
	}

	private function source(?string $contents): IImportSource {
		$source = $this->createStub(IImportSource::class);
		$source->method('pathExists')->willReturnMap([[self::PATH, $contents !== null]]);
		$source->method('getFileContents')->willReturnMap([[self::PATH, (string)$contents]]);
		return $source;
	}

	public function testExportSkipsDefaultSettings(): void {
		$destination = $this->createMock(IExportDestination::class);
		$destination->expects(self::never())->method('addFileContents');

		(new VariantMigrator($this->storedSettings('off', 'light')))
			->export($this->user(), $destination, $this->createStub(OutputInterface::class));
	}

	public function testExportWritesSettings(): void {
		$destination = $this->createMock(IExportDestination::class);
		$destination->expects(self::once())->method('addFileContents')
			->with(self::PATH, '{"variant":"off","last_variant":"dark"}');

		(new VariantMigrator($this->storedSettings('off', 'dark')))
			->export($this->user(), $destination, $this->createStub(OutputInterface::class));
	}

	public function testImportRestoresSettings(): void {
		$saved = [];
		$config = $this->createStub(IUserConfig::class);
		$config->method('setValueString')->willReturnCallback(
			static function (string $user, string $app, string $key, string $value) use (&$saved): bool {
				$saved[$user . '/' . $app . '/' . $key] = $value;
				return true;
			},
		);
		$migrator = new VariantMigrator($config);
		$source = $this->source('{"variant":"dark","last_variant":"dark"}');

		self::assertTrue($migrator->canImport($source));
		$migrator->import($this->user(), $source, $this->createStub(OutputInterface::class));

		self::assertSame([
			'alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_VARIANT => 'dark',
			'alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_LAST_VARIANT => 'dark',
		], $saved);
	}

	public function testImportWithoutFileDoesNothing(): void {
		$config = $this->createMock(IUserConfig::class);
		$config->expects(self::never())->method('setValueString');
		$migrator = new VariantMigrator($config);
		$source = $this->source(null);

		self::assertFalse($migrator->canImport($source));
		$migrator->import($this->user(), $source, $this->createStub(OutputInterface::class));
	}
}
