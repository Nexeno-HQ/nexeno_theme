/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
(function () {
	'use strict';
	function markSections() {
		var wrapper = document.querySelector('.section.network-infos .active-users-wrapper');
		var activeUsers = wrapper && wrapper.closest('.section.network-infos');
		if (activeUsers) {
			activeUsers.classList.add('active-users');
		}

		var sharesIcon = document.querySelector('.section.network-infos h2 img.infoicon[src*="places/files.svg"]');
		var shares = sharesIcon && sharesIcon.closest('.section.network-infos');
		if (shares) {
			shares.classList.add('shares');
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', markSections);
	} else {
		markSections();
	}
})();
