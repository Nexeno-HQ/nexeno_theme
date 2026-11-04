<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Service;

use OCA\NexenoTheme\Service\VersionedScripts;
use OCA\NexenoTheme\Service\VersionedStyles;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Which version-specific files load on which Nextcloud version. Files for versions below 34 are
 * fixes for older servers (they apply to that version and older); files for 34 and up are fixes for
 * newer servers (they apply to that version and newer).
 */
final class VersionedFilesTest extends TestCase {
	private string $dir;

	protected function setUp(): void {
		$this->dir = sys_get_temp_dir() . '/nexeno-theme-test-' . bin2hex(random_bytes(4));
		mkdir($this->dir);
		foreach (['32', '33', '35', '36'] as $version) {
			touch($this->dir . '/nexeno-theme-nc' . $version . '.css');
			touch($this->dir . '/nexeno-theme-nc' . $version . '.js');
		}
		touch($this->dir . '/nexeno-login-nc35.css');
		touch($this->dir . '/nexeno-theme-ncXX.css');
	}

	protected function tearDown(): void {
		array_map('unlink', glob($this->dir . '/*') ?: []);
		rmdir($this->dir);
	}

	public static function versions(): array {
		return [
			'Nextcloud 32 gets both older-version fixes, newest first' => [32, ['nexeno-theme-nc33', 'nexeno-theme-nc32']],
			'Nextcloud 33 gets only the 33 fixes' => [33, ['nexeno-theme-nc33']],
			'Nextcloud 34 gets the base stylesheet only' => [34, []],
			'Nextcloud 35 gets the 35 fixes' => [35, ['nexeno-theme-nc35']],
			'Nextcloud 36 gets the 35 and 36 fixes, oldest first' => [36, ['nexeno-theme-nc35', 'nexeno-theme-nc36']],
		];
	}

	#[DataProvider('versions')]
	public function testStylesForVersion(int $major, array $expected): void {
		self::assertSame($expected, VersionedStyles::forBase('nexeno-theme', $major, $this->dir));
	}

	#[DataProvider('versions')]
	public function testScriptsForVersion(int $major, array $expected): void {
		self::assertSame($expected, VersionedScripts::forBase('nexeno-theme', $major, $this->dir));
	}

	public function testOtherBaseNamesAreSeparate(): void {
		self::assertSame(['nexeno-login-nc35'], VersionedStyles::forBase('nexeno-login', 35, $this->dir));
		self::assertSame([], VersionedStyles::forBase('nexeno-missing', 35, $this->dir));
	}

	public function testShippedScriptsAreFound(): void {
		// js/ holds hand-written source, so the real folder can be checked too.
		self::assertSame(['nexeno-albums-nc35'], VersionedScripts::forBase('nexeno-albums', 35));
		self::assertSame([], VersionedScripts::forBase('nexeno-albums', 34));
	}
}
