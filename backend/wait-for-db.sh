#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

echo "Waiting for PostgreSQL at $host..."

until pg_isready -h "$host" -p 5432 -U postgres; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "PostgreSQL is up - executing command"

# Give PostgreSQL a bit more time to fully initialize
sleep 3

exec $cmd
