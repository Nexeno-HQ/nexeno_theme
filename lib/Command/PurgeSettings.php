<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Command;

use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\IAppConfig;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Erases everything the Nexeno theme stored: every user's settings and the site-wide switches. Run it
 * before `occ app:remove nexeno_theme` so no user data is left behind.
 *
 * Deliberately a command and not an uninstall repair step: Nextcloud runs uninstall steps on every app
 * disable (AppManager::disableApp()), including the automatic one during a server upgrade, so a repair
 * step would wipe everyone's settings when the app is only switched off. Nextcloud's own keys for the
 * app (enabled, installed_version) are left alone.
 */
class PurgeSettings extends Command {
	/** Site-wide values the theme writes itself. */
	public const APP_KEYS = [
		ThemeConfig::APP_CONFIG_KEY_LOGIN_STYLE,
		ThemeConfig::APP_CONFIG_KEY_APP_MENU,
		ThemeConfig::APP_CONFIG_KEY_ORGANISATION_COLOUR,
		ThemeConfig::APP_CONFIG_KEY_INSTALLED_AT,
	];

	public function __construct(
		private IUserConfig $userConfig,
		private IAppConfig $appConfig,
		private CoreTheming $coreTheming,
	) {
		parent::__construct();
	}

	protected function configure(): void {
		$this->setName('nexeno_theme:purge-settings')
			->setDescription('Erase every Nexeno theme setting: all users\' settings and the site-wide switches')
			->addOption('force', 'f', InputOption::VALUE_NONE, 'Confirm the erase');
	}

	protected function execute(InputInterface $input, OutputInterface $output): int {
		if ($input->getOption('force') !== true) {
			$output->writeln('<comment>This erases every user\'s Nexeno theme settings and the site-wide switches '
				. '(login page, organisation colour, app menu). Run again with --force to confirm.</comment>');
			return self::FAILURE;
		}

		// Older versions kept a backup of the user's own Nextcloud background and colours; give those back
		// first, otherwise they are erased with the rest.
		$restored = $this->coreTheming->restoreAllBackups();

		$this->userConfig->deleteApp(ThemeConfig::APP_ID);
		foreach (self::APP_KEYS as $key) {
			$this->appConfig->deleteKey(ThemeConfig::APP_ID, $key);
		}

		$output->writeln(sprintf('<info>Nexeno theme settings erased. Restored the original appearance of %d user(s).</info>', $restored));
		return self::SUCCESS;
	}
}
