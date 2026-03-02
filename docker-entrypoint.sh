#!/bin/sh
set -e
# render runtime env
envsubst '$API_BASE_URL' < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js
# exec original cmd (nginx)
exec "$@"