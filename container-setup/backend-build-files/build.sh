set -o errexit
set -o pipefail
set -o nounset

backend_container_image_name=$(grep -w 'backend_container_image_name' ../../.env | awk -F '=' '{print $2}')

cd ../../
podman build -t $backend_container_image_name -f container-setup/backend-build-files/Dockerfile .
