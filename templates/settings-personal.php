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
	'light' => [
		'title' => $l->t('Nexeno light'),
		'description' => $l->t('The Nexeno brand colours on a clean light appearance.'),
		'label' => $l->t('Enable Nexeno light'),
		'image' => 'preview-light.svg',
	],
	'dark' => [
		'title' => $l->t('Nexeno dark'),
		'description' => $l->t('The Nexeno brand colours on a dark appearance that reduces overall luminosity.'),
		'label' => $l->t('Enable Nexeno dark'),
		'image' => 'preview-dark.svg',
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
		<?php p($l->t('Turn on "Enable Nexeno theme" below, then choose Light or Dark. When you turn it off, your account goes back to your standard Nextcloud appearance.')); ?>
	</p>

	<p id="nexeno_theme-master-toggle">
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
				<img class="nexeno_theme-theme-card__preview"
					src="<?php p(image_path('nexeno_theme', $option['image'])); ?>"
					alt="" aria-hidden="true">
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
</div>
