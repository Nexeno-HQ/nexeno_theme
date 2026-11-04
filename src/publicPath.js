/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tells webpack where the bundle is served from, so the images it emits under js/page/
 * load from the app folder wherever Nextcloud installed the app (apps/ or custom_apps/).
 * main.js imports this first.
 */
import { generateFilePath } from '@nextcloud/router'

// eslint-disable-next-line no-undef
__webpack_public_path__ = generateFilePath('nexeno_theme', 'js', 'page/')
