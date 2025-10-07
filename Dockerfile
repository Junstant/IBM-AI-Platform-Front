# ETAPA 1: BUILD (Se mantiene igual)
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: PRODUCCIÓN
FROM nginx:alpine

# 1. Instalar 'gettext' que contiene la utilidad 'envsubst'
RUN apk add --no-cache gettext curl

# 2. Copiar los archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# 3. Crear un directorio para la plantilla y copiarla
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# 4. Copiar y dar permisos al script de inicio
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 5. Exponer el puerto interno del contenedor
EXPOSE 80

# 6. Definir el script como el punto de entrada del contenedor
ENTRYPOINT ["/entrypoint.sh"]