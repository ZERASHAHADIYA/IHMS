set -o errexit
set -o pipefail
set -o nounset

source ./generate_env.sh
source ./build_containers.sh
source ./initialize_database.sh
