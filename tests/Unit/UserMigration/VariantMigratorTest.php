<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\UserMigration;

use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCA\NexenoTheme\UserMigration\VariantMigrator;
use OCP\Config\IUserConfig;
use OCP\IConfig;
use OCP\IUser;
use OCP\UserMigration\IExportDestination;
use OCP\UserMigration\IImportSource;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Output\OutputInterface;

final class VariantMigratorTest extends TestCase {
	private const PATH = 'nexeno_theme/variant.json';

	private function user(): IUser {
		$user = $this->createStub(IUser::class);
		$user->method('getUID')->willReturn('alice');
		return $user;
	}

	/** The export reads through CoreTheming, so both share the user config. */
	private function migrator(IUserConfig $config): VariantMigrator {
		return new VariantMigrator($config, new CoreTheming($config, $this->createStub(IConfig::class)));
	}

	private function storedSettings(string $variant, string $lastVariant): IUserConfig {
		$config = $this->createStub(IUserConfig::class);
		$config->method('getValueString')->willReturnMap([
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, 'off', false, $variant],
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, 'system', false, $lastVariant],
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

		($this->migrator($this->storedSettings('off', 'system')))
			->export($this->user(), $destination, $this->createStub(OutputInterface::class));
	}

	public function testExportWritesSettings(): void {
		$destination = $this->createMock(IExportDestination::class);
		$destination->expects(self::once())->method('addFileContents')
			->with(self::PATH, '{"variant":"off","last_variant":"dark"}');

		($this->migrator($this->storedSettings('off', 'dark')))
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
		$migrator = $this->migrator($config);
		$source = $this->source('{"variant":"dark","last_variant":"dark"}');

		self::assertTrue($migrator->canImport($source));
		$migrator->import($this->user(), $source, $this->createStub(OutputInterface::class));

		self::assertSame([
			'alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_VARIANT => 'dark',
			'alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_LAST_VARIANT => 'dark',
		], $saved);
	}

	public function testExportIncludesTheRatePromptAnswer(): void {
		$config = $this->storedSettings('off', 'system');
		$config->method('getValueBool')->willReturnMap([
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_DONE, false, false, true],
		]);
		$config->method('getValueInt')->willReturnMap([
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL, 0, false, 1800000000],
		]);
		$destination = $this->createMock(IExportDestination::class);
		$destination->expects(self::once())->method('addFileContents')
			->with(self::PATH, '{"variant":"off","last_variant":"system","rate_prompt_done":true,"rate_prompt_snoozed_until":1800000000}');

		$this->migrator($config)->export($this->user(), $destination, $this->createStub(OutputInterface::class));
	}

	public function testImportRestoresTheRatePromptAnswer(): void {
		$saved = [];
		$config = $this->createStub(IUserConfig::class);
		$config->method('setValueBool')->willReturnCallback(static function (string $user, string $app, string $key, bool $value) use (&$saved): bool {
			$saved[$key] = $value;
			return true;
		});
		$config->method('setValueInt')->willReturnCallback(static function (string $user, string $app, string $key, int $value) use (&$saved): bool {
			$saved[$key] = $value;
			return true;
		});
		$this->migrator($config)->import(
			$this->user(),
			$this->source('{"variant":"off","last_variant":"system","rate_prompt_done":true,"rate_prompt_snoozed_until":1800000000}'),
			$this->createStub(OutputInterface::class),
		);

		self::assertSame([
			ThemeConfig::CONFIG_KEY_RATE_PROMPT_DONE => true,
			ThemeConfig::CONFIG_KEY_RATE_PROMPT_SNOOZED_UNTIL => 1800000000,
		], $saved);
	}

	public function testImportIgnoresABadRatePromptAnswer(): void {
		$config = $this->createMock(IUserConfig::class);
		$config->expects(self::never())->method('setValueBool');
		$config->expects(self::never())->method('setValueInt');
		$this->migrator($config)->import(
			$this->user(),
			$this->source('{"variant":"dark","last_variant":"dark","rate_prompt_done":"yes","rate_prompt_snoozed_until":"soon"}'),
			$this->createStub(OutputInterface::class),
		);
	}

	public static function badFiles(): array {
		return [
			'unknown values' => ['{"variant":"blue","last_variant":"off"}'],
			'not an object' => ['1'],
			'wrong types' => ['{"variant":["dark"],"last_variant":7}'],
			'broken json' => ['{"variant":'],
		];
	}

	#[DataProvider('badFiles')]
	public function testImportReplacesBadValuesWithDefaults(string $file): void {
		$saved = [];
		$config = $this->createStub(IUserConfig::class);
		$config->method('setValueString')->willReturnCallback(
			static function (string $user, string $app, string $key, string $value) use (&$saved): bool {
				$saved[$key] = $value;
				return true;
			},
		);
		$this->migrator($config)->import($this->user(), $this->source($file), $this->createStub(OutputInterface::class));

		self::assertSame([
			ThemeConfig::CONFIG_KEY_VARIANT => ThemeConfig::VARIANT_OFF,
			ThemeConfig::CONFIG_KEY_LAST_VARIANT => ThemeConfig::DEFAULT_LAST_VARIANT,
		], $saved);
	}

	public function testImportWithoutFileDoesNothing(): void {
		$config = $this->createMock(IUserConfig::class);
		$config->expects(self::never())->method('setValueString');
		$migrator = $this->migrator($config);
		$source = $this->source(null);

		self::assertFalse($migrator->canImport($source));
		$migrator->import($this->user(), $source, $this->createStub(OutputInterface::class));
	}
}
