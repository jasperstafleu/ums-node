- In production mode, typescript is automatically compiled before the server is started
- In development mode, typescript changes is watched and, on succesful compilation, the server is restarted.

Run npm install
`docker-compose run ums_node npm install`

Build application (only fully works _after_ install)
`docker compose up`

Run tests:
`docker-compose run ums_node npm run test`

Clean application
`docker-compose run ums_node npm run clean`

Clean application completely (including node modules)
`docker-compose run ums_node npm run clean:all`
