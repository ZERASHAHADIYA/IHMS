set -o errexit
set -o pipefail
set -o nounset

tmux new-session -d -s build
tmux send-keys -t build "cd frontend-build-files" Enter

tmux split-pane -v -t build
tmux send-keys -t build "cd backend-build-files" Enter

tmux split-pane -v -t build
tmux send-keys -t build "cd database-build-files" Enter

tmux select-layout even-vertical

tmux set-window-option -t build:0 synchronize-panes on
tmux send-keys -t build "source build.sh && exit" Enter
tmux attach -t build
