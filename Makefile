# SPDX-FileCopyrightText: 2026 Nexeno contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

app_name := nexeno_theme
build_dir := build
artifacts_dir := $(build_dir)/artifacts
package := $(artifacts_dir)/$(app_name).tar.gz
key := $(HOME)/.nextcloud/certificates/$(app_name).key

.PHONY: all build appstore sign clean

all: build

build:
	npm ci
	npm run build

appstore: build
	rm -rf "./$(build_dir)/$(app_name)" "./$(package)"
	mkdir -p "./$(build_dir)/$(app_name)" "./$(artifacts_dir)"
	rsync -a --exclude-from=.nextcloudignore --exclude='.DS_Store' --exclude='*.map' ./ "./$(build_dir)/$(app_name)/"
	tar -czf "./$(package)" -C "./$(build_dir)" "$(app_name)"
	@echo "Created $(package)"

sign:
	@test -f "./$(package)" || (echo "Run 'make appstore' first" && exit 1)
	openssl dgst -sha512 -sign "$(key)" "./$(package)" | openssl base64

clean:
	rm -rf "./$(build_dir)"
