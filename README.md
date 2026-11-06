<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Nexeno Theme

[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)](LICENSE)
![Nextcloud 32–35](https://img.shields.io/badge/Nextcloud-32%E2%80%9335-0082c9.svg)

**🎨 A clean, modern Light and Dark look for Nextcloud, switched on by each user.**

Nexeno Theme gives the standard Nextcloud apps a consistent, modern look in the Nexeno brand colours. It is off until
a user turns it on, and each user chooses for themselves. Turning it off brings back the user's own Nextcloud
appearance settings, which the theme never changes.

## Features

- **🌗 Light and Dark:** two variants, switched on under *Personal settings → Appearance and accessibility*. The
  change applies straight away, in every open tab, and follows the user on every device.
- **🧭 The whole interface:** restyled navigation, header menus, dialogs, sidebars, search, settings pages and the
  login page.
- **📁 Your everyday apps:** tailored layouts for Files, Photos, Dashboard, Activity, Calendar, Contacts, Deck,
  Notes, Tasks, Talk, Collectives, Teams, Text, Mail, Office and the App store.
- **♿ Accessibility kept:** the OpenDyslexic font stays on for users who chose it.
- **🧩 Nexeno apps keep their design:** Nexeno apps such as Nexeno Project have their own built-in design, and the
  theme leaves them unchanged.
- **🌍 Your language:** English, German, French, Dutch, Italian, Spanish, Swedish, Polish and Portuguese (Brazil).

## Privacy

The theme runs fully inside your Nextcloud and loads nothing from outside services. It stores one setting per user,
the chosen variant, which is included when the user exports their account with Nextcloud's account migration.

## Requirements

- Nextcloud 32, 33, 34 or 35.
- No background jobs, email server or extra apps are needed.

![Overview: a clean Light and Dark theme for Nextcloud, switched on from the personal settings](https://nexeno.io/assets/nexeno_theme/overview.png)
![Files: a refined file browser with clearer icons, folders and previews](https://nexeno.io/assets/nexeno_theme/files.png)
![Clean layout: consistent spacing, colours and typography across the dashboard, Deck, Office and Files](https://nexeno.io/assets/nexeno_theme/clean-layout.png)
![Activity: file updates, shares and team actions in a refreshed Activity screen](https://nexeno.io/assets/nexeno_theme/activity.png)
![Settings: turn Nexeno Theme on or off and choose Light or Dark under Appearance and accessibility](https://nexeno.io/assets/nexeno_theme/settings.png)

## Installation/Update

The app can be installed through the app store within Nextcloud. You can also download the latest release from the [release page](https://github.com/Nexeno-HQ/nexeno_theme/releases).

## Developing

### Nextcloud environment

You need to set up a [development environment](https://docs.nextcloud.com/server/latest/developer_manual/getting_started/devenv.html) of the current Nextcloud version. You can also alternatively install and run the [nextcloud docker container](https://hub.docker.com/_/nextcloud/).
After the finished installation, clone the app repository into the `custom_apps` folder:

```bash
cd custom_apps
git clone https://github.com/Nexeno-HQ/nexeno_theme.git
cd nexeno_theme
```

### Building the theme

Make sure you have [Node.js](https://nodejs.org/) 22.14 or newer installed, then build and enable the app:

```bash
npm ci
npm run build
php ../../occ app:enable nexeno_theme
```

While working on the styles, rebuild the CSS on every change:

```bash
npm run watch
```

- `scss/nexeno-theme.scss` is the base stylesheet for every supported version.
- `scss/nexeno-theme-vNN.scss` holds version-specific fixes, loaded after the base stylesheet.
- Colours come only from the theme variables in `scss/_themes.scss`, so Light and Dark stay in sync.
- `css/` and `js/page/` are build output: they are not in git, so run `npm run build` after cloning. The other files in `js/` are hand-written and committed.

### Checks

Install the npm and composer packages once with `make install-deps`, then:

```bash
make lint       # ESLint, Stylelint, PHP syntax, PHP code style and Psalm
make cs-fix     # fix PHP code style
make test       # PHP unit tests (tests/Unit, no Nextcloud server needed)
make l10n       # update translationfiles/templates/nexeno_theme.pot
```

`make l10n` needs the Nextcloud [translation tool](https://github.com/nextcloud/docker-ci/tree/master/translations/translationtool); point `TRANSLATIONTOOL` at the `.phar` if it is not at `../translationtool.phar`.

### Packaging a release

```bash
make appstore   # build and package build/artifacts/nexeno_theme.tar.gz
make sign       # sign the app files (appinfo/signature.json), repack, print the App Store signature
```

`make sign` expects the App Store certificate and key at `~/.nextcloud/certificates/nexeno_theme.crt` and `.key`, and runs `occ integrity:sign-app`. When occ runs in a container, mount `build/nexeno_theme` into it and pass `OCC="…"` and `SIGN_PATH=<path inside the container>`. See the [App Store developer documentation](https://nextcloudappstore.readthedocs.io/en/latest/developer.html) to request the certificate and register the app.

## Contributing

Run `make lint` and `make test` before opening a pull request, and keep each change small enough to review in the browser on every supported Nextcloud version. Report security issues as described in [SECURITY.md](SECURITY.md), not in public issues.

## License

This app is licensed under the [AGPL-3.0-or-later](LICENSE).
