- In production mode, typescript is automatically compiled before the server is started
- In development mode, typescript changes is watched and, on succesful compilation, the server is restarted.

Install new node_module:
`docker-compose run ums_node npm install --save typescript`

Restart container:
`docker-compose stop && docker-compose up -d`

TODO: 
- Router
- Controller resolver
