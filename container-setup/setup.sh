set -o errexit
set -o pipefail
set -o nounset

export runtime=./runtime

if [ -d $runtime ]
then
	rm -r $runtime
	mkdir $runtime
else
	mkdir $runtime
fi

source ./generate_env.sh
source ./build_containers.sh
source ./initialize_database.sh
