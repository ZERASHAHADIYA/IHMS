set -o errexit
set -o pipefail
set -o nounset

frontend_container_name=$(grep -w 'frontend_container_name' ../../.env | awk -F '=' '{print $2}')
frontend_container_image_name=$(grep -w 'frontend_container_image_name' ../../.env | awk -F '=' '{print $2}')
frontend_container_volume_name=$(grep -w 'frontend_container_volume_name' ../../.env | awk -F '=' '{print $2}')

pod_name=$(grep -w 'pod_name' ../../.env | awk -F '=' '{print $2}')

podman run \
	-it \
	--rm  \
	--name $frontend_container_name \
	--pod $pod_name \
	--volume $frontend_container_volume_name:/root/ \
	$frontend_container_image_name:latest
