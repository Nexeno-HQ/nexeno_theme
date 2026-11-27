<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Service;

use OCA\NexenoTheme\Service\RatePrompt;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Config\IUserConfig;
use OCP\IAppConfig;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class RatePromptTest extends TestCase {
	private const INSTALLED = 1_000_000;
	private const DAY = 86400;

	/** Saved values, as app config and user config would hold them. */
	private array $app = [];
	private array $user = [];

	private function prompt(int $now): RatePrompt {
		$appConfig = $this->createStub(IAppConfig::class);
		$appConfig->method('getValueInt')->willReturnCallback(fn (string $app, string $key, int $default) => $this->app[$key] ?? $default);
		$appConfig->method('setValueInt')->willReturnCallback(function (string $app, string $key, int $value): bool {
			$this->app[$key] = $value;
			return true;
		});

		$userConfig = $this->createStub(IUserConfig::class);
		$userConfig->method('getValueInt')->willReturnCallback(fn (string $uid, string $app, string $key, int $default) => $this->user[$key] ?? $default);
		$userConfig->method('getValueBool')->willReturnCallback(fn (string $uid, string $app, string $key, bool $default) => $this->user[$key] ?? $default);
		$userConfig->method('setValueInt')->willReturnCallback(function (string $uid, string $app, string $key, int $value): bool {
			$this->user[$key] = $value;
			return true;
		});
		$userConfig->method('setValueBool')->willReturnCallback(function (string $uid, string $app, string $key, bool $value): bool {
			$this->user[$key] = $value;
			return true;
		});

		$time = $this->createStub(ITimeFactory::class);
		$time->method('getTime')->willReturn($now);

		return new RatePrompt($appConfig, $userConfig, $time);
	}

	public function testHiddenDuringTheFirstSevenDays(): void {
		$this->app[ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT] = self::INSTALLED;

		self::assertFalse($this->prompt(self::INSTALLED + 7 * self::DAY - 1)->isVisible('alice'));
		self::assertTrue($this->prompt(self::INSTALLED + 7 * self::DAY)->isVisible('alice'));
	}

	public function testFirstCheckRecordsTheInstallTimeWhenMissing(): void {
		self::assertFalse($this->prompt(self::INSTALLED)->isVisible('alice'));
		self::assertSame(self::INSTALLED, $this->app[ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT]);
	}

	public function testClosingShowsItAgainSevenDaysLater(): void {
		$this->app[ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT] = self::INSTALLED;
		$closedAt = self::INSTALLED + 10 * self::DAY;
		$this->prompt($closedAt)->answer('alice', 'later');

		self::assertFalse($this->prompt($closedAt + 7 * self::DAY - 1)->isVisible('alice'));
		self::assertTrue($this->prompt($closedAt + 7 * self::DAY)->isVisible('alice'));
	}

	#[DataProvider('finalAnswers')]
	public function testNeverAndRatedHideItForGood(string $action): void {
		$this->app[ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT] = self::INSTALLED;
		$this->prompt(self::INSTALLED + 10 * self::DAY)->answer('alice', $action);

		self::assertFalse($this->prompt(self::INSTALLED + 1000 * self::DAY)->isVisible('alice'));
	}

	public static function finalAnswers(): array {
		return [['never'], ['rated']];
	}
}
