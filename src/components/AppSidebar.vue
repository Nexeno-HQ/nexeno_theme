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

			<NcAppNavigationItem v-if="isAdmin" :name="t('nexeno_theme', 'Settings')" :href="themingSettingsUrl">
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
		</template>
	</NcAppNavigation>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import NcAppNavigation from '@nextcloud/vue/components/NcAppNavigation'
import NcAppNavigationItem from '@nextcloud/vue/components/NcAppNavigationItem'

export default {
	name: 'AppSidebar',
	components: {
		NcAppNavigation,
		NcAppNavigationItem,
	},

	computed: {
		isAdmin() {
			return Boolean(window.OC?.isUserAdmin?.())
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
