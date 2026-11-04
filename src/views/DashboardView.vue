<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="suite-app-wrapper">
		<section class="hero-section">
			<div class="hero-section-text">
				<div class="pre-heading">
					<span>{{ t('nexeno_theme', 'Free Forever') }}</span>
				</div>
				<div class="title">
					<h1>{{ t('nexeno_theme', 'Your cloud. Your brand.') }}<span>{{ t('nexeno_theme', 'Your experience.') }}</span></h1>
				</div>
				<div class="content-small">
					<p>{{ t('nexeno_theme', 'A modern Nextcloud experience, beautifully redesigned.') }}</p>
				</div>
				<ul class="hero-listing-wrapper">
					<li>
						<span><strong>{{ t('nexeno_theme', 'Look better.') }}</strong> {{ t('nexeno_theme', 'A clean, modern interface designed for a smoother everyday experience.') }}</span>
					</li>
					<li>
						<span><strong>{{ t('nexeno_theme', 'Work smarter.') }}</strong> {{ t('nexeno_theme', 'Simplified navigation, clearer hierarchy, and thoughtfully designed interactions.') }}</span>
					</li>
					<li>
						<span><strong>{{ t('nexeno_theme', 'Stay familiar.') }}</strong> {{ t("nexeno_theme", "Built around Nextcloud's ecosystem while giving your workspace a fresh, premium identity.") }}</span>
					</li>
				</ul>
				<div class="button-wrapper">
					<NcButton variant="primary" @click="scrollToApps">
						{{ t('nexeno_theme', "Get started - It's FREE!") }}
					</NcButton>
				</div>
			</div>
			<div class="hero-image-wrapper">
				<div class="img-wrapper">
					<img :src="showcaseImage('hero-slider-perview.jpg')" alt="">
				</div>
			</div>
		</section>

		<section ref="apps" class="apps-system-section">
			<div class="system-apps-wrapper">
				<div class="title">
					<h2>{{ t('nexeno_theme', 'Your Nexeno applications') }}</h2>
				</div>
				<div class="apps-grid-wrapper">
					<div class="app-card">
						<div class="icon-name-wrapper">
							<div class="icon">
								<svg
									width="16"
									height="12"
									viewBox="0 0 16 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M0.632212 11.8107C1.58649 12.0455 2.58519 12.0621 3.54745 11.8593C4.50971 11.6565 5.4085 11.2399 6.17104 10.6432C6.93359 10.0465 7.53846 9.28661 7.9367 8.4249C8.33494 7.5632 8.51535 6.62395 8.46332 5.68319C8.41129 4.74244 8.12829 3.82661 7.63722 3.00986C7.14615 2.19312 6.46083 1.4984 5.63672 0.981946C4.81261 0.465496 3.87289 0.141832 2.89362 0.0371548C1.91435 -0.0675219 0.923059 0.049731 0 0.379421L0.725903 2.2371C1.34388 2.01637 2.00753 1.93787 2.66314 2.00795C3.31875 2.07803 3.94789 2.29472 4.49961 2.64048C5.05134 2.98623 5.51016 3.45134 5.83892 3.99814C6.16769 4.54495 6.35715 5.15808 6.39198 5.7879C6.42682 6.41773 6.30604 7.04654 6.03942 7.62344C5.77281 8.20034 5.36785 8.70911 4.85734 9.10857C4.34682 9.50802 3.7451 9.78693 3.10087 9.92272C2.45665 10.0585 1.78804 10.0474 1.14916 9.89017L0.632212 11.8107Z" fill="currentColor" />
									<path d="M15.3678 11.8107C14.4135 12.0455 13.4148 12.0621 12.4526 11.8593C11.4903 11.6565 10.5915 11.2399 9.82896 10.6432C9.06641 10.0465 8.46154 9.28661 8.0633 8.4249C7.66506 7.5632 7.48465 6.62395 7.53668 5.68319C7.58871 4.74244 7.87171 3.82661 8.36278 3.00986C8.85384 2.19312 9.53917 1.4984 10.3633 0.981946C11.1874 0.465496 12.1271 0.141832 13.1064 0.0371548C14.0857 -0.0675219 15.0769 0.049731 16 0.379421L15.2741 2.2371C14.6561 2.01637 13.9925 1.93787 13.3369 2.00795C12.6812 2.07803 12.0521 2.29472 11.5004 2.64048C10.9487 2.98623 10.4898 3.45134 10.1611 3.99814C9.83231 4.54495 9.64285 5.15808 9.60802 5.7879C9.57318 6.41773 9.69396 7.04654 9.96058 7.62344C10.2272 8.20034 10.6321 8.70911 11.1427 9.10857C11.6532 9.50802 12.2549 9.78693 12.8991 9.92272C13.5433 10.0585 14.212 10.0474 14.8508 9.89017L15.3678 11.8107Z" fill="currentColor" />
								</svg>
							</div>
							<div class="app-name">
								<div class="name-wrapper">
									<h3>{{ t('nexeno_theme', 'Nexeno theme') }}</h3>
									<span class="badge-pill" :class="themeEnabled ? 'badge-pill--green' : 'badge-pill--gray'">
										{{ themeEnabled ? t('nexeno_theme', 'Enabled') : t('nexeno_theme', 'Disabled') }}
									</span>
								</div>
								<div class="version-wrapper">
									<span>{{ t('nexeno_theme', 'Version {version}', { version: appVersion }) }}</span>
								</div>
							</div>
						</div>
						<div class="app-desc">
							<p>{{ t('nexeno_theme', 'Nexeno Light and Dark colour themes for your nextcloud.') }}</p>
						</div>
						<div class="app-action">
							<NcCheckboxRadioSwitch
								:modelValue="themeEnabled"
								type="switch"
								@update:modelValue="toggleTheme">
								{{ t('nexeno_theme', 'Enable Nexeno theme') }}
							</NcCheckboxRadioSwitch>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="showcase-section">
			<div class="title">
				<h2>{{ betterExperienceHeading.before }}<span>{{ betterExperienceHeading.highlight }}</span>{{ betterExperienceHeading.after }}</h2>
			</div>
			<div class="content-small">
				<p>
					{{ t('nexeno_theme', 'A consistent, modern experience across the apps you use every day with cleaner layouts, refined visuals, and a unified Nextcloud look.') }}
				</p>
			</div>
			<div class="showcase-grid two-column">
				<div class="showcase-card">
					<div class="title">
						<h3>
							{{ t('nexeno_theme', 'Manage your files with clarity') }}
						</h3>
					</div>
					<div class="content-small">
						<p>
							{{ t('nexeno_theme', 'Browse, organize, share, and access your files through a cleaner interface designed to keep everything within reach.') }}
						</p>
					</div>
					<div class="showcase-card-img">
						<img
							:src="showcaseImage('files.png')"
							:alt="t('nexeno_theme', 'The Nextcloud Files app in the Nexeno theme')">
					</div>
				</div>
				<div class="showcase-card">
					<div class="title">
						<h3>
							{{ t('nexeno_theme', 'Your memories, beautifully organized') }}
						</h3>
					</div>
					<div class="content-small">
						<p>
							{{ t('nexeno_theme', 'Explore, browse, and manage your photos in a cleaner visual experience that makes finding your memories effortless.') }}
						</p>
					</div>
					<div class="showcase-card-img">
						<img
							:src="showcaseImage('photos.png')"
							:alt="t('nexeno_theme', 'The Nextcloud Photos app in the Nexeno theme')">
					</div>
				</div>
			</div>
			<div class="showcase-grid three-column">
				<div class="showcase-card multiple-view">
					<div class="title">
						<h3>
							{{ t('nexeno_theme', 'Your workspace at a glance') }}
						</h3>
					</div>
					<div class="content-small">
						<p>
							{{ t('nexeno_theme', 'Get a clear overview of your activity, important updates, and everyday essentials from one streamlined dashboard.') }}
						</p>
					</div>
					<div class="showcase-card-img">
						<img
							:src="showcaseImage('dashboard.png')"
							:alt="t('nexeno_theme', 'The Nextcloud dashboard in the Nexeno theme')">
						<img
							class="secondary-img"
							:src="showcaseImage('dashboard-overlay.png')"
							alt="">
					</div>
				</div>
				<div class="showcase-card">
					<div class="title">
						<h3>
							{{ t('nexeno_theme', 'Create and collaborate seamlessly') }}
						</h3>
					</div>
					<div class="content-small">
						<p>
							{{ t('nexeno_theme', 'Work on documents, spreadsheets, and presentations with a polished interface that keeps your workspace focused and familiar.') }}
						</p>
					</div>
					<div class="showcase-card-img">
						<img
							:src="showcaseImage('office.png')"
							:alt="t('nexeno_theme', 'Nextcloud Office in the Nexeno theme')">
					</div>
				</div>
				<div class="showcase-card">
					<div class="title">
						<h3>
							{{ t('nexeno_theme', 'Discover more possibilities') }}
						</h3>
					</div>
					<div class="content-small">
						<p>
							{{ t('nexeno_theme', 'Explore and manage your Nextcloud apps from a cleaner, more consistent interface built to fit your workspace.') }}
						</p>
					</div>
					<div class="showcase-card-img">
						<img
							:src="showcaseImage('appstore.png')"
							:alt="t('nexeno_theme', 'The Nextcloud app store in the Nexeno theme')">
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { imagePath } from '@nextcloud/router'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import { setThemeVariant, state } from '../store'

export default {
	name: 'DashboardView',
	components: {
		NcButton,
		NcCheckboxRadioSwitch,
	},

	data() {
		return {
			state,
		}
	},

	computed: {
		themeEnabled() {
			return state.themeVariant !== 'off'
		},

		appVersion() {
			return appVersion
		},

		/**
		 * The translation marks the highlighted words with <span>. Split it and render each part
		 * as text, so a translation can never inject HTML.
		 */
		betterExperienceHeading() {
			const text = t('nexeno_theme', 'A <span>better experience</span> across Nextcloud')
			const match = text.match(/^([\s\S]*?)<span>([\s\S]*?)<\/span>([\s\S]*)$/)
			return match
				? { before: match[1], highlight: match[2], after: match[3] }
				: { before: text.replace(/<[^>]*>/g, ''), highlight: '', after: '' }
		},
	},

	methods: {
		t,
		toggleTheme(enabled) {
			setThemeVariant(enabled ? (state.themeLastVariant || 'light') : 'off')
		},

		scrollToApps() {
			this.$refs.apps.scrollIntoView({ behavior: 'smooth', block: 'start' })
		},

		showcaseImage(file) {
			return imagePath('nexeno_theme', `showcase/${file}`)
		},
	},
}
</script>
