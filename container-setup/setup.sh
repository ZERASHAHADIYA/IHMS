set -o errexit
set -o pipefail
set -o nounset

source ./generate_env.sh
source ./build_containers.sh
source ./create_volumes.sh
source ./create_pod.sh
source ./initialize_database.sh
