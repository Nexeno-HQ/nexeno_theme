<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Migration;

use OCA\NexenoTheme\Service\RatePrompt;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

/**
 * Install step: saves when the app was installed, which starts the 7 days before the rating popup.
 * No database schema change; the time is one app config value.
 */
class RecordInstallTime implements IRepairStep {
	public function __construct(
		private RatePrompt $ratePrompt,
	) {
	}

	public function getName(): string {
		return 'Record the Nexeno theme install time';
	}

	public function run(IOutput $output): void {
		$this->ratePrompt->installedAt();
	}
}
