set -o errexit
set -o pipefail
set -o nounset

database_container_image_name=$(grep -w 'database_container_image_name' ../../.env | awk -F '=' '{print $2}')

cd ../../
podman build -t $database_container_image_name -f container-setup/database-build-files/Dockerfile .
