<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Migration;

use OCA\NexenoTheme\Migration\RestoreOldBackups;
use OCA\NexenoTheme\Service\CoreTheming;
use OCP\Migration\IOutput;
use PHPUnit\Framework\TestCase;

final class RestoreOldBackupsTest extends TestCase {
	public function testGivesBackEveryBackupAndSaysHowMany(): void {
		$coreTheming = $this->createMock(CoreTheming::class);
		$coreTheming->expects(self::once())->method('restoreAllBackups')->willReturn(3);
		$output = $this->createMock(IOutput::class);
		$output->expects(self::once())->method('info')->with('Restored the original appearance of 3 user(s).');

		(new RestoreOldBackups($coreTheming))->run($output);
	}

	public function testSaysNothingWhenNoUserHasABackup(): void {
		$coreTheming = $this->createStub(CoreTheming::class);
		$coreTheming->method('restoreAllBackups')->willReturn(0);
		$output = $this->createMock(IOutput::class);
		$output->expects(self::never())->method('info');

		(new RestoreOldBackups($coreTheming))->run($output);
	}
}
