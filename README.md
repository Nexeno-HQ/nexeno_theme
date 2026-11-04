<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Nexeno theme

Nexeno theme brings the Nexeno brand colours to Nextcloud in a light and a dark variant.

- Choose Off, Light or Dark per account under Personal settings → Appearance and accessibility
- Restyled navigation, dialogs, popovers, settings and login pages
- Tailored layouts for Files, Photos, Dashboard, Activity, Calendar, Contacts, Deck, Notes, Tasks, Talk, Collectives, Mail and more
- Works with Nextcloud 32, 33, 34 and 35

![Overview: a clean Light and Dark theme for Nextcloud, switched on from the personal settings](https://nexeno.io/assets/nexeno_theme/overview.png)
![Files: a refined file browser with clearer icons, folders and previews](https://nexeno.io/assets/nexeno_theme/files.png)
![Clean layout: consistent spacing, colours and typography across the dashboard, Deck, Office and Files](https://nexeno.io/assets/nexeno_theme/clean-layout.png)
![Activity: file updates, shares and team actions in a refreshed Activity screen](https://nexeno.io/assets/nexeno_theme/activity.png)
![Settings: turn the Nexeno theme on or off and choose Light or Dark under Appearance and accessibility](https://nexeno.io/assets/nexeno_theme/settings.png)

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

Make sure you have [Node.js](https://nodejs.org/) 20 or newer installed, then build and enable the app:

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
