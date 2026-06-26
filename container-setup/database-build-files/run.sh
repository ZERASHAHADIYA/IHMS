set -o errexit
set -o pipefail
set -o nounset

database_name=$(grep -w 'database_name' ../../.env | awk -F '=' '{print $2}')
database_password=$(grep -w 'database_password' ../../.env | awk -F '=' '{print $2}')

database_container_name=$(grep -w 'database_container_name' ../../.env | awk -F '=' '{print $2}')
database_container_image_name=$(grep -w 'database_container_image_name' ../../.env | awk -F '=' '{print $2}')
database_container_volume_name=$(grep -w 'database_container_volume_name' ../../.env | awk -F '=' '{print $2}')

pod_name=$(grep -w 'pod_name' ../../.env | awk -F '=' '{print $2}')

podman run \
	-it \
	--rm  \
	-e POSTGRES_DB=$database_name \
	-e POSTGRES_PASSWORD=$database_password \
	--name $database_container_name \
	--pod $pod_name \
	--volume $database_container_volume_name:/var/lib/postgresql/18/main/ \
	$database_container_image_name:latest
