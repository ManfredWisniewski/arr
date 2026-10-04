# Push all site content to the Payload instance (theme CSS, fonts,
# site.yml, pages/media/structure). Requires .env with PAYLOAD_BASE_URL
# and PAYLOAD_API_KEY. Usage: make push [THEME=arr|wit]

CONTENT_REPO ?= ../obs-seo-witconsult/witconsult.de
THEME ?= wit
BITI_DIR ?= ../biti
CSS_DIR ?= $(BITI_DIR)/tokens/build/css
FONT_DIR ?= $(BITI_DIR)/public/fonts

PT := python -m wit_pytools.payloadtools

# Paths baked into the image — changes here need a rebuild + redeploy,
# they do not go live via `push`.
IMAGE_PATHS := src next.config.ts package.json package-lock.json Dockerfile
IMAGE_DIRTY := $(shell git status --porcelain $(IMAGE_PATHS))

# $(call font_arg,Family,glob) -> --font arg when the glob matches.
# All matched files of the family are uploaded; weight/style are
# inferred from filenames (google-webfonts-helper naming).
font_arg = $(if $(wildcard $(FONT_DIR)/$(2)),--font "$(1)=$(FONT_DIR)/$(2)")

FONT_ARGS_arr := \
	$(call font_arg,Open Sans,open-sans-*.woff2) \
	$(call font_arg,Gentium Book Basic,gentium-book-basic-*.woff2)
FONT_VARS_arr := \
	--font-var "typography-typeface-change-font-here-body=Open Sans" \
	--font-var "typography-typeface-change-font-here-display=Gentium Book Basic" \
	--font-var "typography-typeface-change-font-here-heading=Gentium Book Basic"

FONT_ARGS_wit := \
	$(call font_arg,Inter,inter-v*.woff2) \
	$(call font_arg,Inter Tight,inter-tight-*.woff2) \
	$(call font_arg,Roboto,roboto-*.woff2)
FONT_VARS_wit := \
	--font-var "typography-typeface-change-font-here-body=Inter" \
	--font-var "typography-typeface-change-font-here-display=Roboto" \
	--font-var "typography-typeface-change-font-here-heading=Roboto"

FONT_ARGS := $(FONT_ARGS_$(THEME)) $(FONT_VARS_$(THEME))

.PHONY: push tokens theme site sync

push: tokens theme site sync
	@echo NOTE: pages and structures are pushed as drafts - publish them in the Payload admin to go live.
ifneq ($(IMAGE_DIRTY),)
	@echo NOTE: image files changed ($(IMAGE_PATHS)) - rebuild and redeploy the image; push does not ship code changes.
endif

tokens:
	npm --prefix $(BITI_DIR)/tokens run build

theme: tokens
	$(PT) theme --css-light $(CSS_DIR)/$(THEME)-light.css --css-dark $(CSS_DIR)/$(THEME)-dark.css $(FONT_ARGS)

site:
	$(PT) site --repo $(CONTENT_REPO)

sync:
	$(PT) sync --repo $(CONTENT_REPO)
