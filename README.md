- In production mode, typescript is automatically compiled before the server is started
- In development mode, typescript changes is watched and, on succesful compilation, the server is restarted.

Run tests:
`docker-compose run ums_node npm run test`

Restart container:
`docker-compose stop && docker-compose up -d`
