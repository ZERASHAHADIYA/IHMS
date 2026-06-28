set -o errexit
set -o pipefail
set -o nounset

log() {
	echo "log: $1"
	sleep 1
}

backend_container_name=$(grep -w 'backend_container_name' ../.env | awk -F '=' '{print $2}')
database_container_name=$(grep -w 'database_container_name' ../.env | awk -F '=' '{print $2}')

log 'starting backend container'
cd backend-build-files
source run.sh -d
cd - >/dev/null
sleep 1
podman logs $backend_container_name
sleep 1

log 'starting database container'
cd database-build-files
source run.sh -d
cd - >/dev/null
sleep 1
podman logs $database_container_name
sleep 1

log 'initializing database from backend container'
podman exec -it $backend_container_name bash -c 'source /root/initialize_database.sh'

log 'stopping backend container'
podman exec -it $backend_container_name bash -c "kill -9 $(podman top $backend_container_name | grep backend_server_start.sh | awk -F ' ' '{print $2}' | grep -v 1)"

log 'stopping database container'
podman exec -it $database_container_name bash -c "kill -9 $(podman top $database_container_name | grep database_server_start.sh | awk -F ' ' '{print $2}' | grep -v 1)"
