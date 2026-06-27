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

prompt() {
	message="$1"
	default_value="$2"

	echo -n "$message [${default_value}]: "
}

log 'ensuring IHMS/.env does not already exist'

set +o errexit
if [ -f ../.env ]
then
	error 'found IHMS/.env as already existing. cannot overwrite it. please move it to proceed.'
fi
set -o errexit

log 'aquiring details to generate .env'

prompt 'enter port to expose for frontend' "$(grep -w 'frontend_port' ./default_values.txt | awk -F '=' '{print $2}')"
read frontend_port
if [ -z $frontend_port ]
then
	frontend_port="$(grep -w 'frontend_port' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter port to expose for backend' "$(grep -w 'backend_port' ./default_values.txt | awk -F '=' '{print $2}')"
read backend_port
if [ -z $backend_port ]
then
	backend_port="$(grep -w 'backend_port' ./default_values.txt | awk -F '=' '{print $2}')"
fi


prompt 'enter name for the pod' "$(grep -w 'pod_name' ./default_values.txt | awk -F '=' '{print $2}')"
read pod_name
if [ -z $pod_name ]
then
	pod_name="$(grep -w 'pod_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi


prompt 'enter name of the frontend container' "$(grep -w 'frontend_container_name' ./default_values.txt | awk -F '=' '{print $2}')"
read frontend_container_name 
if [ -z $frontend_container_name  ]
then
	frontend_container_name="$(grep -w 'frontend_container_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter name of the frontend container image' "$(grep -w 'frontend_container_image_name' ./default_values.txt | awk -F '=' '{print $2}')"
read frontend_container_image_name 
if [ -z $frontend_container_image_name  ]
then
	frontend_container_image_name="$(grep -w 'frontend_container_image_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter name of the frontend container volume' "$(grep -w 'frontend_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
read frontend_container_volume_name 
if [ -z $frontend_container_volume_name  ]
then
	frontend_container_volume_name="$(grep -w 'frontend_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi


prompt 'enter name of the backend container' "$(grep -w 'backend_container_name' ./default_values.txt | awk -F '=' '{print $2}')"
read backend_container_name 
if [ -z $backend_container_name  ]
then
	backend_container_name="$(grep -w 'backend_container_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter name of the backend container image' "$(grep -w 'backend_container_image_name' ./default_values.txt | awk -F '=' '{print $2}')"
read backend_container_image_name 
if [ -z $backend_container_image_name  ]
then
	backend_container_image_name="$(grep -w 'backend_container_image_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter name of the backend container volume' "$(grep -w 'backend_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
read backend_container_volume_name 
if [ -z $backend_container_volume_name  ]
then
	backend_container_volume_name="$(grep -w 'backend_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi


prompt 'enter name of the database container' "$(grep -w 'database_container_name' ./default_values.txt | awk -F '=' '{print $2}')"
read database_container_name 
if [ -z $database_container_name  ]
then
	database_container_name="$(grep -w 'database_container_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter name of the database container image' "$(grep -w 'database_container_image_name' ./default_values.txt | awk -F '=' '{print $2}')"
read database_container_image_name 
if [ -z $database_container_image_name  ]
then
	database_container_image_name="$(grep -w 'database_container_image_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi
prompt 'enter name of the database container volume' "$(grep -w 'database_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
read database_container_volume_name 
if [ -z $database_container_volume_name  ]
then
	database_container_volume_name="$(grep -w 'database_container_volume_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi

prompt 'enter database name' "$(grep -w 'database_name' ./default_values.txt | awk -F '=' '{print $2}')"
read database_name 
if [ -z $database_name  ]
then
	database_name="$(grep -w 'database_name' ./default_values.txt | awk -F '=' '{print $2}')"
fi

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

database_password=$database_password_2

set -o errexit

DATABASE_URL="postgresql://postgres:$database_password@localhost:5432/$database_name"

prompt 'enter the number of characters for JWT secret' "$(grep -w 'jwt_string_size' ./default_values.txt | awk -F '=' '{print $2}')"
read jwt_string_size
if [ -z $jwt_string_size ]
then
	jwt_string_size="$(grep -w 'jwt_string_size' ./default_values.txt | awk -F '=' '{print $2}')"
fi
set +o errexit
JWT_SECRET=$(cat /dev/urandom | tr -cd A-Za-z0-9 | head -c $jwt_string_size)
set -o errexit

prompt 'enter the number of characters for message secret' "$(grep -w 'message_string_size' ./default_values.txt | awk -F '=' '{print $2}')"
read message_string_size
if [ -z $message_string_size ]
then
	message_string_size="$(grep -w 'message_string_size' ./default_values.txt | awk -F '=' '{print $2}')"
fi
set +o errexit
MESSAGE_SECRET=$(cat /dev/urandom | tr -cd A-Za-z0-9 | head -c $message_string_size)
set -o errexit

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
