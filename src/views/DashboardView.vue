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
					<img :src="images.heroSliderPreview" alt="">
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
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M17.5 12C17.1022 12 16.7206 11.842 16.4393 11.5607C16.158 11.2794 16 10.8978 16 10.5C16 10.1022 16.158 9.72064 16.4393 9.43934C16.7206 9.15804 17.1022 9 17.5 9C17.8978 9 18.2794 9.15804 18.5607 9.43934C18.842 9.72064 19 10.1022 19 10.5C19 10.8978 18.842 11.2794 18.5607 11.5607C18.2794 11.842 17.8978 12 17.5 12ZM14.5 8C14.1022 8 13.7206 7.84196 13.4393 7.56066C13.158 7.27936 13 6.89782 13 6.5C13 6.10218 13.158 5.72064 13.4393 5.43934C13.7206 5.15804 14.1022 5 14.5 5C14.8978 5 15.2794 5.15804 15.5607 5.43934C15.842 5.72064 16 6.10218 16 6.5C16 6.89782 15.842 7.27936 15.5607 7.56066C15.2794 7.84196 14.8978 8 14.5 8ZM9.5 8C9.10218 8 8.72064 7.84196 8.43934 7.56066C8.15804 7.27936 8 6.89782 8 6.5C8 6.10218 8.15804 5.72064 8.43934 5.43934C8.72064 5.15804 9.10218 5 9.5 5C9.89782 5 10.2794 5.15804 10.5607 5.43934C10.842 5.72064 11 6.10218 11 6.5C11 6.89782 10.842 7.27936 10.5607 7.56066C10.2794 7.84196 9.89782 8 9.5 8ZM6.5 12C6.10218 12 5.72064 11.842 5.43934 11.5607C5.15804 11.2794 5 10.8978 5 10.5C5 10.1022 5.15804 9.72064 5.43934 9.43934C5.72064 9.15804 6.10218 9 6.5 9C6.89782 9 7.27936 9.15804 7.56066 9.43934C7.84196 9.72064 8 10.1022 8 10.5C8 10.8978 7.84196 11.2794 7.56066 11.5607C7.27936 11.842 6.89782 12 6.5 12ZM12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21C12.3978 21 12.7794 20.842 13.0607 20.5607C13.342 20.2794 13.5 19.8978 13.5 19.5C13.5 19.11 13.35 18.76 13.11 18.5C12.88 18.23 12.73 17.88 12.73 17.5C12.73 17.1022 12.888 16.7206 13.1693 16.4393C13.4506 16.158 13.8322 16 14.23 16H16C17.3261 16 18.5979 15.4732 19.5355 14.5355C20.4732 13.5979 21 12.3261 21 11C21 6.58 16.97 3 12 3Z" fill="currentColor" />
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
							:src="images.filesShowcase"
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
							:src="images.photosShowcase"
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
							:src="images.dashboardShowcase"
							:alt="t('nexeno_theme', 'The Nextcloud dashboard in the Nexeno theme')">
						<img
							class="secondary-img"
							:src="images.dashboardOverlayShowcase"
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
							:src="images.officeShowcase"
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
							:src="images.appstoreShowcase"
							:alt="t('nexeno_theme', 'The Nextcloud app store in the Nexeno theme')">
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import appstoreShowcase from '../assets/images/showcase/appstore.png'
import dashboardOverlayShowcase from '../assets/images/showcase/dashboard-overlay.png'
import dashboardShowcase from '../assets/images/showcase/dashboard.png'
import filesShowcase from '../assets/images/showcase/files.png'
import heroSliderPreview from '../assets/images/showcase/hero-slider-perview.jpg'
import officeShowcase from '../assets/images/showcase/office.png'
import photosShowcase from '../assets/images/showcase/photos.png'
import { setThemeVariant, state } from '../store.js'

export default {
	name: 'DashboardView',
	components: {
		NcButton,
		NcCheckboxRadioSwitch,
	},

	data() {
		return {
			state,
			images: {
				heroSliderPreview,
				filesShowcase,
				photosShowcase,
				dashboardShowcase,
				dashboardOverlayShowcase,
				officeShowcase,
				appstoreShowcase,
			},
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
	},
}
</script>
