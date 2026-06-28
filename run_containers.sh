tmux new-session -d -s chatapp
tmux send-keys -t chatapp:0 'cd container-setup/frontend-build-files && bash run.sh -i' Enter

tmux new-window -t chatapp
tmux send-keys -t chatapp:1 'cd container-setup/backend-build-files && bash run.sh -i' Enter

tmux new-window -t chatapp 
tmux send-keys -t chatapp:2 'cd container-setup/database-build-files && bash run.sh -i' Enter

tmux attach -t chatapp
