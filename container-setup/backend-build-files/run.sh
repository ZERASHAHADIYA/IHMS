set -o errexit
set -o pipefail
set -o nounset

backend_container_name=$(grep -w 'backend_container_name' ../../.env | awk -F '=' '{print $2}')
backend_container_image_name=$(grep -w 'backend_container_image_name' ../../.env | awk -F '=' '{print $2}')
backend_container_volume_name=$(grep -w 'backend_container_volume_name' ../../.env | awk -F '=' '{print $2}')

pod_name=$(grep -w 'pod_name' ../../.env | awk -F '=' '{print $2}')

podman run \
	${1}t \
	--rm  \
	--name $backend_container_name \
	--pod $pod_name \
	--volume $backend_container_volume_name:/root/ \
	$backend_container_image_name:latest
