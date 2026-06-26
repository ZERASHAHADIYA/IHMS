set -o errexit
set -o pipefail
set -o nounset

log() {
	echo -e "log: $1"
	sleep 1
}

append_to_env() {
	echo "$1" >> ../.env
}

log 'aquiring details to generate .env'

read -p 'enter name for the pod [chatapp]: ' pod_name


read -p 'enter name of the frontend container [ihms_frontend]: ' frontend_container_name 
read -p 'enter name of the frontend container image [ihms_frontend]: ' frontend_container_image_name 
read -p 'enter name of the frontend container volume [ihms_frontend]: ' frontend_container_volume_name 


read -p 'enter name of the backend container [ihms_backend]: ' backend_container_name 
read -p 'enter name of the backend container image [ihms_backend]: ' backend_container_image_name 
read -p 'enter name of the backend container volume [ihms_backend]: ' backend_container_volume_name 


read -p 'enter name of the database container [ihms_database]: ' database_container_name 
read -p 'enter name of the database container image [ihms_database]: ' database_container_image_name 
read -p 'enter name of the database container volume [ihms_database]: ' database_container_volume_name 

read -p 'enter database name [campus_messaging]: ' database_name 

set +o errexit
while true
do
	read -s -p 'enter password for the database: ' database_password_1
	read -s -p 'enter again: ' database_password_2

	if [ "$database_password_1" = "$database_password_2" ]
	then
		break
	fi

	log '\npasswords do not match. please try again\n'
done
set -o errexit


echo 'generating .env'

append_to_env "# value for all containers"
append_to_env "pod_name=$pod_name"
append_to_env ""
append_to_env "# FRONTEND"
append_to_env "# vaules to create frontend container"
append_to_env "frontend_container_name=$frontend_container_name"
append_to_env "frontend_container_image_name=$frontend_container_image_name"
append_to_env "frontend_container_volume_name=$frontend_container_volume_name"
append_to_env ""
append_to_env "# BACKEND"
append_to_env "# vaules to create backend container"
append_to_env "backend_container_name=$backend_container_name"
append_to_env "backend_container_image_name=$backend_container_image_name"
append_to_env "backend_container_volume_name=$backend_container_volume_name"
append_to_env ""
append_to_env "# DATABASE"
append_to_env "# values to use inside database container"
append_to_env "database_name=$database_name"
append_to_env "database_password=$database_password"
append_to_env ""
append_to_env "# vaules to create database container"
append_to_env "database_container_name=$database_container_name"
append_to_env "database_container_image_name=$database_container_image_name"
append_to_env "database_container_volume_name=$database_container_volume_name"

sleep 1
