set -o errexit
set -o pipefail
set -o nounset

frontend_container_image_name=$(grep -w 'frontend_container_image_name' ../../.env | awk -F '=' '{print $2}')

cd ../../
podman build -t $frontend_container_image_name -f container-setup/frontend-build-files/Dockerfile .
