set -o errexit
set -o pipefail
set -o nounset

log() {
	echo "log: $1"
	sleep 1
}

pod_name="$(grep -w 'pod_name' ./default_values.txt | awk -F '=' '{print $2}')"
frontend_port="$(grep -w 'frontend_port' ./default_values.txt | awk -F '=' '{print $2}')"
backend_port="$(grep -w 'backend_port' ./default_values.txt | awk -F '=' '{print $2}')"

log 'creating pod'
podman pod create --name $pod_name -p ${frontend_port}:${frontend_port} -p ${backend_port}:${backend_port}
