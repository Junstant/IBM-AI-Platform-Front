#!/bin/sh
set -e

# Lista COMPLETA de variables a sustituir - Incluye RAG API
VARS_TO_SUBST='${NGINX_PORT_INTERNAL} ${RAG_API_HOST} ${RAG_API_PORT} ${FRAUDE_API_HOST} ${FRAUDE_API_PORT} ${TEXTOSQL_API_HOST} ${TEXTOSQL_API_PORT} ${STATS_API_HOST} ${STATS_API_PORT} ${RAG_API_HOST} ${RAG_API_PORT} ${GEMMA_2B_PORT} ${GEMMA_4B_PORT} ${GEMMA_12B_PORT} ${MISTRAL_PORT} ${DEEPSEEK_8B_PORT}'

envsubst "$VARS_TO_SUBST" \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

# Muestra la configuración generada para depuración (opcional)
echo "--- Nginx conf generated ---"
cat /etc/nginx/conf.d/default.conf
echo "--------------------------"

exec nginx -g 'daemon off;'