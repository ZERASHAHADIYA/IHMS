set -o errexit
set -o pipefail
set -o nounset

log() {
	echo "log: $1"
	sleep 1
}

frontend_container_volume_name="$(grep -w 'frontend_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
backend_container_volume_name="$(grep -w 'backend_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
database_container_volume_name="$(grep -w 'database_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"


log 'creating frontend volume'
podman volume create $frontend_container_volume_name

log 'creating backend volume'
podman volume create $backend_container_volume_name

log 'creating database volume'
podman volume create $database_container_volume_name
