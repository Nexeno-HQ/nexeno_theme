/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function() {
	'use strict'
	function markAdminWorkflow() {
		if (!/^\/settings\/admin\/workflow(?:\/|$)/.test(window.location.pathname.replace(/^\/index\.php/, ''))) {
			return
		}
		const main = document.querySelector('main.workflow')
		if (main) {
			main.classList.add('admin-workflow')
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', markAdminWorkflow)
	} else {
		markAdminWorkflow()
	}
})()
