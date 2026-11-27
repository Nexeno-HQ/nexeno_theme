<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Migration;

use OCA\NexenoTheme\Service\CoreTheming;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

/**
 * Older versions of the theme kept a backup of each user's own Nextcloud background and colours. This gives
 * them back once, during the app update, instead of checking for a backup on every page load.
 */
class RestoreOldBackups implements IRepairStep {
	public function __construct(
		private CoreTheming $coreTheming,
	) {
	}

	public function getName(): string {
		return 'Give back the appearance backups of older Nexeno theme versions';
	}

	public function run(IOutput $output): void {
		$restored = $this->coreTheming->restoreAllBackups();
		if ($restored > 0) {
			$output->info(sprintf('Restored the original appearance of %d user(s).', $restored));
		}
	}
}
