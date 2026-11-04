<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Controller;

use OCA\NexenoTheme\Controller\ThemeSettingsController;
use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Http;
use OCP\Config\IUserConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserSession;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ThemeSettingsControllerTest extends TestCase {
	private function session(?string $uid): IUserSession {
		$user = null;
		if ($uid !== null) {
			$user = $this->createStub(IUser::class);
			$user->method('getUID')->willReturn($uid);
		}
		$session = $this->createStub(IUserSession::class);
		$session->method('getUser')->willReturn($user);
		return $session;
	}

	private function controller(IUserConfig $userConfig, CoreTheming $coreTheming, IUserSession $session): ThemeSettingsController {
		$l = $this->createStub(IL10N::class);
		$l->method('t')->willReturnArgument(0);
		return new ThemeSettingsController(
			ThemeConfig::APP_ID,
			$this->createStub(IRequest::class),
			$userConfig,
			$coreTheming,
			$session,
			$l,
		);
	}

	/**
	 * A config that records every value saved through it into $saved.
	 */
	private function recordingConfig(array &$saved): IUserConfig {
		$userConfig = $this->createStub(IUserConfig::class);
		$userConfig->method('setValueString')->willReturnCallback(
			static function (string $user, string $app, string $key, string $value) use (&$saved): bool {
				$saved[$user . '/' . $app . '/' . $key] = $value;
				return true;
			},
		);
		return $userConfig;
	}

	public function testRejectsWhenNotLoggedIn(): void {
		$userConfig = $this->createMock(IUserConfig::class);
		$userConfig->expects(self::never())->method('setValueString');

		$response = $this->controller($userConfig, $this->createStub(CoreTheming::class), $this->session(null))
			->setVariant('light');

		self::assertSame(Http::STATUS_UNAUTHORIZED, $response->getStatus());
	}

	public static function invalidVariants(): array {
		return [['purple'], [''], ['Light'], ['off ']];
	}

	#[DataProvider('invalidVariants')]
	public function testRejectsUnknownVariant(string $variant): void {
		$userConfig = $this->createMock(IUserConfig::class);
		$userConfig->expects(self::never())->method('setValueString');
		$coreTheming = $this->createMock(CoreTheming::class);
		$coreTheming->expects(self::never())->method('restoreBackup');

		$response = $this->controller($userConfig, $coreTheming, $this->session('alice'))->setVariant($variant);

		self::assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
	}

	public static function enabledVariants(): array {
		return [['light'], ['dark']];
	}

	#[DataProvider('enabledVariants')]
	public function testSavesVariantAndRemembersIt(string $variant): void {
		$saved = [];
		$coreTheming = $this->createMock(CoreTheming::class);
		$coreTheming->expects(self::once())->method('restoreBackup')->with('alice');
		$coreTheming->expects(self::once())->method('bodyThemes')->with('alice', $variant)->willReturn([$variant]);

		$response = $this->controller($this->recordingConfig($saved), $coreTheming, $this->session('alice'))
			->setVariant($variant);

		self::assertSame(Http::STATUS_OK, $response->getStatus());
		self::assertSame(['variant' => $variant, 'enabledThemes' => [$variant]], $response->getData());
		self::assertSame([
			'alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_LAST_VARIANT => $variant,
			'alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_VARIANT => $variant,
		], $saved);
	}

	public function testTurningOffKeepsLastVariant(): void {
		$saved = [];
		$coreTheming = $this->createStub(CoreTheming::class);
		$coreTheming->method('bodyThemes')->willReturn(['default']);

		$response = $this->controller($this->recordingConfig($saved), $coreTheming, $this->session('alice'))
			->setVariant('off');

		self::assertSame(Http::STATUS_OK, $response->getStatus());
		self::assertSame(['variant' => 'off', 'enabledThemes' => ['default']], $response->getData());
		self::assertSame(['alice/nexeno_theme/' . ThemeConfig::CONFIG_KEY_VARIANT => 'off'], $saved);
	}
}
