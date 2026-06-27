set -o errexit
set -o pipefail
set -o nounset


error() {
	echo "error: $1"
	exit 1
}

log() {
	echo "log: $1"
	sleep 1
}

append_to_env() {
	echo "$1" >> ../.env
}

log 'ensuring IHMS/.env does not already exist'

set +o errexit
if [ -f ../.env ]
then
	error 'found IHMS/.env as already existing. cannot overwrite it. please move it to proceed.'
fi
set -o errexit

log 'aquiring details to generate .env'

read -p 'enter port to expose for frontend [3000]: ' frontend_port
read -p 'enter port to expose for backend [5000]: ' backend_port


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

	echo ''
	log 'passwords do not match. please try again'
	echo ''
done

database_password=database_password_2

set -o errexit

DATABASE_URL="postgresql://postgres:$database_password@localhost:5432/$database_name"

read -p 'enter the number of characters for JWT secret [25]: ' jwt_string_size
JWT_SECRET=$(cat /dev/urandom | tr -cd A-Za-z0-9 | head -c $jwt_string_size)

read -p 'enter the number of characters for message secret [25]: ' message_string_size
MESSAGE_SECRET=$(cat /dev/urandom | tr -cd A-Za-z0-9 | head -c $message_string_size)

log 'generating .env'

append_to_env "# ports exposed to the hosting machine"
append_to_env "frontend_port=$frontend_port"
append_to_env "backend_port=$backend_port"
append_to_env ""
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
append_to_env ""
append_to_env ""
append_to_env "#VALUES USED BY IHMS"
append_to_env "DATABASE_URL=\"$DATABASE_URL\""
append_to_env "JWT_SECRET=\"$JWT_SECRET\""
append_to_env "MESSAGE_SECRET=\"$MESSAGE_SECRET\""
