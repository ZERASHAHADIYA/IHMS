set -o errexit
set -o pipefail
set -o nounset

tmux new-session -s init 
tmux send-keys -t build "source backend-build-files/initialize_database.sh && touch $runtime/database_initialization_complete_by_backend_container && exit" Enter

tmux split-pane -h -t init 
tmux send-keys -t build 'source backend-build-files/run.sh ; exit' Enter

tmux split-pane -v -t init
tmux send-keys -t build 'source database-build-files/run.sh ; exit' Enter

while true
do
	if [ -f $runtime/database_initialization_complete_by_backend_container ]
	then
		tmux send-keys -t build ^c
		tmux send-keys -t build ^c
		break
	fi
done
