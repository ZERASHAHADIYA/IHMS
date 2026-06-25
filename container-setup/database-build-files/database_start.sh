set -o errexit
set -o pipefail
set -o nounset

POSTGRES_DB="$1"
POSTGRES_PASSWORD="$2"

/etc/init.d/postgresql start

su - postgres -c "psql -U postgres -tc \"ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD'\""

set +o errexit
su - postgres -c "psql -U postgres -tc \"SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'\" | grep -q 1" 

if [ $? -ne 0 ]
then
	set -o errexit
	su - postgres -c "psql -U postgres -c \"CREATE DATABASE $POSTGRES_DB\""
fi

tail -f /var/log/postgresql/postgresql-18-main.log -n +1
