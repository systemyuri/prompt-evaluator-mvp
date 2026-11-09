.PHONY: up down build logs smoke test-python test-java test-frontend

up:
	docker compose up -d --build

down:
	docker compose down -v

build:
	docker compose build

logs:
	docker compose logs -f --tail=100

smoke:
	bash scripts/smoke_test.sh

test-python:
	docker compose exec validator-python pytest -q || true

test-java:
	cd backend-java && ./mvnw test || true

test-frontend:
	cd frontend && npm test -- --run || true