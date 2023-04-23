```
docker-compose up db
docker exec -i -t mapa-db-1 /bin/bash
cd /var/lib/postgresql/scripts
./replace-dev-with-prod.sh
```
