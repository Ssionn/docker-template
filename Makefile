up:
	@docker compose up --build -d nginx

watch:
	@docker compose exec app npm run watch

down:
	@docker compose down --remove-orphans

setup:
	@docker compose run --rm --no-deps app sh -c \
		"php artisan optimize:clear && test -s .env || (cp .env.example .env && php artisan key:generate)"
	@make up
	@docker compose exec app composer install
	@docker compose exec app npm install
	@docker compose exec app npm run dev
	@make db-fresh
	@make ide-helper

destroy:
	@docker compose down --remove-orphans --volumes

fresh:
	@make destroy
	@docker compose build
	@docker compose pull
	@make setup

db-fresh:
	@docker compose exec app php artisan migrate:fresh
	@docker compose exec app php artisan db:seed

ide-helper:
	@docker compose exec app php artisan ide-helper:eloquent
	@docker compose exec app php artisan ide-helper:generate
	@docker compose exec app php artisan ide-helper:meta
	@docker compose exec app php artisan ide-helper:model --reset --write
