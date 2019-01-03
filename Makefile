build:
	docker-compose build
	docker-compose run --rm app yarn

start:
	docker-compose up -d

stop:
	docker-compose down

bash:
	docker exec -it onsite-demo bash

logs:
	docker logs onsite-demo -f
