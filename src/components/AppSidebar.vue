<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcAppNavigation :aria-label="t('nexeno_theme', 'Nexeno navigation')">
		<template #list>
			<NcAppNavigationItem :name="t('nexeno_theme', 'Overview')" :to="{ name: 'dashboard' }">
				<template #icon>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true">
						<rect
							width="7"
							height="9"
							x="3"
							y="3"
							rx="1"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<rect
							width="7"
							height="5"
							x="14"
							y="3"
							rx="1"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<rect
							width="7"
							height="9"
							x="14"
							y="12"
							rx="1"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<rect
							width="7"
							height="5"
							x="3"
							y="16"
							rx="1"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				</template>
			</NcAppNavigationItem>

			<!-- Shown to every user: it opens the personal appearance page where each user turns the theme on. -->
			<NcAppNavigationItem :name="t('nexeno_theme', 'Settings')" :href="themingSettingsUrl">
				<template #icon>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						aria-hidden="true">
						<path
							d="M13.3332 4.66669H7.33317M9.33317 11.3334H3.33317M9.33317 11.3334C9.33317 12.4379 10.2286 13.3334 11.3332 13.3334C12.4377 13.3334 13.3332 12.4379 13.3332 11.3334C13.3332 10.2288 12.4377 9.33335 11.3332 9.33335C10.2286 9.33335 9.33317 10.2288 9.33317 11.3334ZM6.6665 4.66669C6.6665 5.77126 5.77107 6.66669 4.6665 6.66669C3.56193 6.66669 2.6665 5.77126 2.6665 4.66669C2.6665 3.56212 3.56193 2.66669 4.6665 2.66669C5.77107 2.66669 6.6665 3.56212 6.6665 4.66669Z"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				</template>
			</NcAppNavigationItem>

			<NcAppNavigationCaption :name="t('nexeno_theme', 'Apps')" />

			<!--
				The "Coming soon" chip sits right after the name (Figma). NcAppNavigationItem only offers a
				right-aligned counter slot, so the chip is drawn by CSS (.nexeno-nav-item--new) and its
				translated label is passed in as a CSS string; the whole row stays one clickable link.
			-->
			<NcAppNavigationItem
				class="nexeno-nav-item--new"
				:style="{ '--nexeno-badge-label': JSON.stringify(t('nexeno_theme', 'Coming soon')) }"
				:name="t('nexeno_theme', 'Nexeno project')"
				:to="{ name: 'marketing' }">
				<template #icon>
					<!-- Layers icon -->
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true">
						<path
							d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<path
							d="m2 12 9.17 4.17a2 2 0 0 0 1.66 0L22 12"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<path
							d="m2 17 9.17 4.17a2 2 0 0 0 1.66 0L22 17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				</template>
			</NcAppNavigationItem>
		</template>

		<!-- Rating and problem-report links, pinned below the menu. An external href opens in a new tab (NcAppNavigationItem). -->
		<template #footer>
			<ul class="app-navigation-entry__settings">
				<NcAppNavigationItem :name="t('nexeno_theme', 'Rate this app')" :href="appStoreUrl">
					<template #icon>
						<!-- Star icon -->
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true">
							<path
								d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					</template>
				</NcAppNavigationItem>
				<NcAppNavigationItem :name="t('nexeno_theme', 'Report a problem')" :href="issuesUrl">
					<template #icon>
						<!-- Circle-alert icon -->
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true">
							<circle
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="2" />
							<path
								d="M12 8v4M12 16h.01"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					</template>
				</NcAppNavigationItem>
			</ul>
		</template>
	</NcAppNavigation>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import NcAppNavigation from '@nextcloud/vue/components/NcAppNavigation'
import NcAppNavigationCaption from '@nextcloud/vue/components/NcAppNavigationCaption'
import NcAppNavigationItem from '@nextcloud/vue/components/NcAppNavigationItem'
import { APP_STORE_URL, ISSUES_URL } from '../constants.js'

export default {
	name: 'AppSidebar',
	components: {
		NcAppNavigation,
		NcAppNavigationCaption,
		NcAppNavigationItem,
	},

	computed: {
		appStoreUrl() {
			return APP_STORE_URL
		},

		issuesUrl() {
			return ISSUES_URL
		},

		themingSettingsUrl() {
			return generateUrl('/settings/user/theming')
		},
	},

	methods: {
		t,
	},
}
</script>
