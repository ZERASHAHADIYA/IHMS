set -o errexit
set -o pipefail
set -o nounset

log() {
	echo "log: $1"
	sleep 1
}

log 'checking whether a debian stable image exists'
set +o errexit
podman image exists debian:stable 

if [ $? -eq 0 ]
then
	set -o errexit
	log 'found a debian stable image'
else
	set -o errexit
	log 'did not find a debian stable image. pulling before proceeding.'
	podman pull docker.io/library/debian:stable
fi

log 'proceeding with the setup'

source ./generate_env.sh
source ./build_containers.sh
source ./create_volumes.sh
source ./create_pod.sh
source ./initialize_database.sh
