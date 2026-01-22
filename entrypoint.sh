#!/bin/sh
set -e

# Función para esperar a que un host resuelva en DNS
wait_for_host() {
  host="$1"
  timeout=${2:-60}
  i=0
  while ! getent hosts "$host" >/dev/null 2>&1; do
    i=$((i+1))
    if [ "$i" -ge "$timeout" ]; then
      echo "⚠️  Timeout waiting for host: $host (continuing anyway)"
      return 1
    fi
    echo "⏳ Waiting for DNS resolution of '$host' ($i/$timeout)..."
    sleep 1
  done
  echo "✅ Host '$host' resolved successfully."
  return 0
}

# Esperar a que los servicios backend estén disponibles en DNS
echo "🔍 Checking backend services availability..."
[ -n "$RAG_API_HOST" ] && wait_for_host "$RAG_API_HOST" 60 || true
[ -n "$FRAUDE_API_HOST" ] && wait_for_host "$FRAUDE_API_HOST" 30 || true
[ -n "$TEXTOSQL_API_HOST" ] && wait_for_host "$TEXTOSQL_API_HOST" 30 || true
[ -n "$STATS_API_HOST" ] && wait_for_host "$STATS_API_HOST" 30 || true
echo "✅ DNS checks completed."

VARS_TO_SUBST='${NGINX_PORT_INTERNAL} ${RAG_API_HOST} ${RAG_API_PORT} ${FRAUDE_API_HOST} ${FRAUDE_API_PORT} ${TEXTOSQL_API_HOST} ${TEXTOSQL_API_PORT} ${STATS_API_HOST} ${STATS_API_PORT} ${RAG_API_HOST} ${RAG_API_PORT} ${GEMMA_2B_PORT} ${GEMMA_4B_PORT} ${ARCTIC_TEXT2SQL_PORT} ${MISTRAL_PORT} ${DEEPSEEK_8B_PORT}'

envsubst "$VARS_TO_SUBST" \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

# Muestra la configuración generada para depuración (opcional)
echo "--- Nginx conf generated ---"
cat /etc/nginx/conf.d/default.conf
echo "--------------------------"

echo "🚀 Starting nginx..."
exec nginx -g 'daemon off;'