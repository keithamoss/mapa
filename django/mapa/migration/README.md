Copy the local files up to the remote server

```bash
scp content.json mapa.keithmoss.me:/apps/mapa/content.json
scp 'MIGRATED_map_marker_contents_30Aug2023 - map_marker_contents_30Aug2023.csv' mapa.keithmoss.me:/apps/mapa/'MIGRATED_map_marker_contents_30Aug2023 - map_marker_contents_30Aug2023.csv'
```

From the remote server, copy the files into the running container

```bash
docker cp content.json mapa-mapa-1:/app/mapa/migration/content.json
docker cp 'MIGRATED_map_marker_contents_30Aug2023 - map_marker_contents_30Aug2023.csv' mapa-mapa-1:/app/mapa/migration/'MIGRATED_map_marker_contents_30Aug2023 - map_marker_contents_30Aug2023.csv'
```

Enter the running container

```bash
docker exec -it mapa-mapa-1 /bin/bash
cd /app/mapa/migration

# Only if needed
# apt update
# apt install nano
# nano migrate_foraging_map.py

python migrate_foraging_map.py
```
