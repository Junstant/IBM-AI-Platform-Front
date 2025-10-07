#!/bin/sh

# Sustituye las variables en la plantilla y crea el archivo de configuración final
# Es importante listar las variables para no reemplazar accidentalmente variables de Nginx como $host
envsubst '${NGINX_PORT_INTERNAL} ${FRAUDE_API_HOST} ${FRAUDE_API_PORT} ${TEXTOSQL_API_HOST} ${TEXTOSQL_API_PORT}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

# Ejecuta el comando original de Nginx para iniciar el servidor
exec nginx -g 'daemon off;'