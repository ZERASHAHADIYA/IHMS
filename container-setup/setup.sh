set -o errexit
set -o pipefail
set -o nounset

backend_container_name=$(grep -w 'backend_container_name' ../../.env | awk -F '=' '{print $2}')

source ./generate_env.sh
source ./build_containers.sh
podman exec -it $backend_container_name /bin/bash -c '/root/ihms-backend/initialize_database.sh'
