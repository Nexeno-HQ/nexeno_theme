<?php
/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

script('nexeno_theme', 'nexeno-state');
style('nexeno_theme', 'nexeno-theme');

$variant = $_['variant'];
$lastVariant = $_['lastVariant'];
$enabled = $variant !== 'off';
$selectedVariant = $enabled ? $variant : $lastVariant;
$options = [
	'system' => [
		'title' => $l->t('System default theme'),
		'description' => $l->t('Nexeno light or dark, matching the light or dark setting of your device.'),
		'label' => $l->t('Enable system default'),
	],
	'light' => [
		'title' => $l->t('Nexeno light theme'),
		'description' => $l->t('The Nexeno brand colours on a clean light appearance.'),
		'label' => $l->t('Enable Nexeno light'),
	],
	'dark' => [
		'title' => $l->t('Nexeno dark theme'),
		'description' => $l->t('The Nexeno brand colours on a dark appearance that reduces overall luminosity.'),
		'label' => $l->t('Enable Nexeno dark'),
	],
];
?>
<div id="nexeno_theme-settings" class="section">
	<h3><?php p($l->t('Nexeno theme')); ?></h3>
	<p class="settings-hint">
		<?php p($l->t('The Nexeno theme gives the standard Nextcloud apps a consistent, modern look.')); ?>
		<?php if ($_['excludedApps'] !== []) {
			p($l->t('Nexeno apps such as %s have their own built-in design, so this setting does not change their appearance.', [implode(', ', $_['excludedApps'])]));
		} ?>
		<?php p($l->t('Turn on "Enable Nexeno theme" below, then choose System default, Light or Dark. When you turn it off, your account goes back to your standard Nextcloud appearance.')); ?>
	</p>

	<p id="nexeno_theme-master-toggle" class="nexeno_theme-switch">
		<input type="checkbox"
			id="nexeno_theme-enabled"
			class="checkbox"
			<?php if ($enabled) {
				print_unescaped(' checked');
			} ?>>
		<label for="nexeno_theme-enabled"><?php p($l->t('Enable Nexeno theme')); ?></label>
	</p>

	<div class="nexeno_theme-theme-card">
		<?php foreach ($options as $value => $option): ?>
			<div class="nexeno_theme-theme-card__item">
				<?php // The preview is a label for the radio below, so clicking the image selects that theme. ?>
				<label for="nexeno_theme-variant-<?php p($value); ?>"
					class="nexeno_theme-theme-card__preview nexeno_theme-theme-card__preview--<?php p($value); ?>"
					aria-hidden="true"></label>
				<div class="nexeno_theme-theme-card__body">
					<h3><?php p($option['title']); ?></h3>
					<p><?php p($option['description']); ?></p>
					<p>
						<input type="radio"
							id="nexeno_theme-variant-<?php p($value); ?>"
							class="radio"
							name="nexeno_theme-variant"
							value="<?php p($value); ?>"
								<?php if (!$enabled) {
								print_unescaped(' disabled');
							} ?>
							<?php if ($selectedVariant === $value) {
								print_unescaped(' checked');
							} ?>>
						<label for="nexeno_theme-variant-<?php p($value); ?>"><?php p($option['label']); ?></label>
					</p>
				</div>
			</div>
		<?php endforeach; ?>
	</div>

	<?php /* Site-wide, so only admins see it. It works whether or not the admin uses the Nexeno theme themselves. */ ?>
	<?php if ($_['isAdmin']): ?>
		<div id="nexeno_theme-login-style" class="nexeno_theme-login-style">
			<p class="settings-hint" id="nexeno_theme-login-style-hint">
				<?php p($l->t('Shows the Nexeno look on the login page for everyone. Turn it off to use the standard Nextcloud login page.')); ?>
				<strong><?php p($l->t('Only admins see this setting.')); ?></strong>
			</p>
			<p class="nexeno_theme-switch">
				<input type="checkbox"
					id="nexeno_theme-login-style-enabled"
					class="checkbox"
					aria-describedby="nexeno_theme-login-style-hint"
					<?php /* Stops the browser restoring an old position on reload, so the switch always shows the saved value. */ ?>
					autocomplete="off"
					<?php if ($_['loginStyleEnabled']) {
						print_unescaped(' checked');
					} ?>>
				<label for="nexeno_theme-login-style-enabled"><?php p($l->t('Use Nexeno look on the login page')); ?></label>
			</p>
		</div>
	<?php endif; ?>
</div>
