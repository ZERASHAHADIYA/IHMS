set -o errexit
set -o pipefail
set -o nounset

log() {
	echo "log: $1"
	sleep 1
}

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd ihms-backend

log 'generating prisma client'
npx prisma generate

log 'performing migrations'
npx prisma migrate deploy

log 'seeding dummy data'
node prisma/dummy_data_seed.js
