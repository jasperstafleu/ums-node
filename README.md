Node UMS
========

A naive attempt to learn about NodeJS by reproducing my most favorite parts of the PHP Symfony Framework.

Notes
-----

- In production mode, typescript is automatically compiled before the server is started
- In development mode, typescript changes are watched and, on successful compilation, the server is restarted.

Installation guide
------------------

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
