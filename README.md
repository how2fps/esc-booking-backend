# esc-booking-backend

Commands

Initial steps:
npm i (NOT NEEDED but helps alot for development and autocompletion during development)
docker compose build (builds the container and volumes)
docker compose up (runs the container)

Opening up an extra terminal in container:
docker exec -it esc-booking-backend sh

Opening up LOCAL mysql in a terminal in container (password is in .env.dev file):
docker exec -it esc-mysql-test mysql -u testuser -p
