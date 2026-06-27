set -o errexit
set -o pipefail
set -o nounset
set -x

backend_container_name=$(grep -w 'backend_container_name' ../.env | awk -F '=' '{print $2}')
database_container_name=$(grep -w 'database_container_name' ../.env | awk -F '=' '{print $2}')

tmux new-session -d -s init
tmux send-keys -t init "echo 'waiting for backend and database containers to start' && sleep 5 && podman exec -it $backend_container_name /bin/bash -c 'source /root/initialize_database.sh' && podman stop $backend_container_name && podman stop $database_container_name && exit" Enter

tmux split-pane -h -t init 
tmux send-keys -t init 'cd backend-build-files && source run.sh ; exit' Enter

tmux split-pane -v -t init
tmux send-keys -t init 'cd database-build-files && source run.sh ; exit' Enter
tmux attach -t init
