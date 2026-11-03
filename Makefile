# SPDX-FileCopyrightText: 2026 Nexeno contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

app_name := nexeno_theme
build_dir := build
artifacts_dir := $(build_dir)/artifacts
package_dir := $(build_dir)/$(app_name)
package := $(artifacts_dir)/$(app_name).tar.gz
cert_dir := $(HOME)/.nextcloud/certificates

# How occ is run, and where that occ sees the unpacked package. When occ runs in a
# container, mount the package folder into it and set SIGN_PATH to the container path, e.g.
#   make sign OCC="docker compose exec -u www-data app php occ" SIGN_PATH=/tmp/nexeno_theme
OCC ?= php ../../occ
SIGN_PATH ?= $(CURDIR)/$(package_dir)

.PHONY: all help install-deps build watch lint lint-js lint-css lint-php psalm cs-fix l10n appstore sign clean

all: build

help:
	@echo "make install-deps   Install npm and composer packages"
	@echo "make build          Install npm packages and build css/ and js/page/"
	@echo "make watch          Rebuild the CSS on every change"
	@echo "make lint           ESLint, Stylelint, PHP syntax, code style and Psalm"
	@echo "make cs-fix         Fix PHP code style"
	@echo "make l10n           Update translationfiles/templates/$(app_name).pot"
	@echo "make appstore       Build $(package)"
	@echo "make sign           Sign the app files and print the App Store signature"
	@echo "make clean          Remove build/"

install-deps:
	npm ci
	composer install

build:
	npm ci
	npm run build

watch:
	npm run watch

lint: lint-js lint-css lint-php psalm

lint-js:
	npm run lint

lint-css:
	npm run stylelint

lint-php:
	composer run lint 1>/dev/null
	composer run cs:check

psalm:
	composer run psalm

cs-fix:
	composer run cs:fix

l10n:
	npm run l10n:pot

# The package holds only what runs on the server; .nextcloudignore lists everything else.
appstore: clean build
	mkdir -p "./$(package_dir)" "./$(artifacts_dir)"
	rsync -a --exclude-from=.nextcloudignore ./ "./$(package_dir)/"
	tar -czf "./$(package)" -C "./$(build_dir)" "$(app_name)"
	@echo "Created $(package)"

# Writes appinfo/signature.json into the package (code signing), repacks it, then prints
# the signature of the tarball for the App Store upload form.
sign:
	@test -d "./$(package_dir)" || (echo "Run 'make appstore' first" && exit 1)
	@test -f "$(cert_dir)/$(app_name).key" || (echo "Missing $(cert_dir)/$(app_name).key" && exit 1)
	@test -f "$(cert_dir)/$(app_name).crt" || (echo "Missing $(cert_dir)/$(app_name).crt" && exit 1)
	$(OCC) integrity:sign-app \
		--privateKey="$(cert_dir)/$(app_name).key" \
		--certificate="$(cert_dir)/$(app_name).crt" \
		--path="$(SIGN_PATH)"
	@test -f "./$(package_dir)/appinfo/signature.json" || (echo "appinfo/signature.json was not written into $(package_dir)" && exit 1)
	tar -czf "./$(package)" -C "./$(build_dir)" "$(app_name)"
	@echo "App Store signature:"
	@openssl dgst -sha512 -sign "$(cert_dir)/$(app_name).key" "./$(package)" | openssl base64

clean:
	rm -rf "./$(build_dir)"
