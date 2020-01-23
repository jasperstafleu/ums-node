Compile typescript:
`docker-compose run node npm run tsc`

Install node_module:
`docker-compose run node npm install --save typescript`

Restart all:
`docker-compose stop && docker-compose up -d && docker-compose run node npm run tsc`
