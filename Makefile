# Load environment variables from .env if it exists
-include .env

# Default Redis configuration
REDIS_ADDR ?= localhost:6379
REDIS_PASSWORD ?=
REDIS_DB ?= 0
DOCKER ?= 0

# Extract host and port from REDIS_ADDR
REDIS_HOST = $(word 1, $(subst :, ,$(REDIS_ADDR)))
REDIS_PORT = $(if $(word 2, $(subst :, ,$(REDIS_ADDR))),$(word 2, $(subst :, ,$(REDIS_ADDR))),6379)

# Define redis-cli command
ifeq ($(DOCKER), 1)
	REDIS_CLI = docker compose exec redis redis-cli -n $(REDIS_DB)
else
	REDIS_CLI = redis-cli -h $(REDIS_HOST) -p $(REDIS_PORT) $(if $(REDIS_PASSWORD),-a $(REDIS_PASSWORD)) -n $(REDIS_DB)
endif

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make add-token TOKEN=<value>    - Add a new API token to Redis"
	@echo "  make remove-token TOKEN=<value> - Remove an API token from Redis"
	@echo "  make list-tokens                - List all API tokens in Redis"
	@echo "  make dev                        - Run next dev"
	@echo "  make build                      - Build next application"
	@echo "  make start                      - Start production server"
	@echo "  make lint                       - Run next lint"
	@echo "  make load-data                  - Load hadith data into Redis"
	@echo "  make stats                      - Show general stats and user usage"

.PHONY: dev
dev:
	npm run dev

.PHONY: build
build:
	npm run build

.PHONY: start
start:
	npm run start

.PHONY: lint
lint:
	npm run lint

.PHONY: load-data load-books
load-data load-books:
	REDIS_ADDR=$(REDIS_ADDR) REDIS_PASSWORD=$(REDIS_PASSWORD) REDIS_DB=$(REDIS_DB) npm run load-data

.PHONY: add-token
add-token:
	@if [ -z "$(TOKEN)" ]; then \
		echo "Error: TOKEN is not set. Use: make add-token TOKEN=your_token_here NAME=\"Your Name\" EMAIL=your@email.com"; \
		exit 1; \
	fi
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is not set."; \
		exit 1; \
	fi
	@if [ -z "$(EMAIL)" ]; then \
		echo "Error: EMAIL is not set."; \
		exit 1; \
	fi
	@echo "Adding API token to Redis..."
	$(REDIS_CLI) HSET "auth:token:$(TOKEN)" name "$(NAME)" email "$(EMAIL)" created_at "$$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
	@echo "Token '$(TOKEN)' for $(NAME) ($(EMAIL)) has been added successfully."

.PHONY: remove-token
remove-token:
	@if [ -z "$(TOKEN)" ]; then \
		echo "Error: TOKEN is not set. Use: make remove-token TOKEN=your_token_here"; \
		exit 1; \
	fi
	@echo "Removing API token from Redis..."
	$(REDIS_CLI) DEL "auth:token:$(TOKEN)"
	@echo "Token '$(TOKEN)' has been removed successfully."

.PHONY: list-tokens
list-tokens:
	@echo "Listing API tokens in Redis..."
	@tokens=$$($(REDIS_CLI) KEYS "auth:token:*"); \
	if [ -z "$$tokens" ]; then \
		echo "No tokens found."; \
	else \
		for token in $$tokens; do \
			echo "-----------------------------------"; \
			echo "Key: $$token"; \
			$(REDIS_CLI) HGETALL "$$token"; \
		done; \
		echo "-----------------------------------"; \
		fi

.PHONY: stats
stats:
	@echo "=== General Statistics ==="
	@num_books=$$( $(REDIS_CLI) SCARD books ); \
	num_tokens=$$( $(REDIS_CLI) KEYS "auth:token:*" | wc -l ); \
	books=$$( $(REDIS_CLI) SMEMBERS books ); \
	total_hadiths=0; \
	for book in $$books; do \
		count=$$( $(REDIS_CLI) LLEN "book:$$book:hadiths" ); \
		total_hadiths=$$(($$total_hadiths + $$count)); \
	done; \
	echo "Total Books:   $$num_books"; \
	echo "Total Tokens:  $$num_tokens"; \
	echo "Total Hadiths: $$total_hadiths"
	@echo ""
	@echo "=== User Usage Overview ==="
	@printf "%-15s | %-25s | %-25s | %s\n" "Name" "Email" "Last Used" "Calls"
	@echo "----------------|---------------------------|---------------------------|-------"
	@tokens=$$( $(REDIS_CLI) KEYS "auth:token:*" ); \
	for token in $$tokens; do \
		name=$$( $(REDIS_CLI) HGET $$token name | tr -d '"' ); \
		email=$$( $(REDIS_CLI) HGET $$token email | tr -d '"' ); \
		last_used=$$( $(REDIS_CLI) HGET $$token last_used_at | tr -d '"' ); \
		total_calls=$$( $(REDIS_CLI) HGET $$token total_calls | tr -d '"' ); \
		if [ -z "$$last_used" ] || [ "$$last_used" = "nil" ] || [ "$$last_used" = "(nil)" ]; then last_used="Never"; fi; \
		if [ -z "$$total_calls" ] || [ "$$total_calls" = "nil" ] || [ "$$total_calls" = "(nil)" ]; then total_calls="0"; fi; \
		printf "%-15s | %-25s | %-25s | %s\n" "$$name" "$$email" "$$last_used" "$$total_calls"; \
	done
