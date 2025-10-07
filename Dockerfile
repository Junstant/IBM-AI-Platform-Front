# ETAPA 1: Compilación
FROM node:20-slim AS build

# --- CAMBIOS AQUÍ ---
# Declara los argumentos que vamos a recibir desde docker-compose
ARG VITE_API_HOST
ARG VITE_GEMMA2b_PORT
ARG VITE_GEMMA4b_PORT
ARG VITE_GEMMA12b_PORT
ARG VITE_MISTRAL_PORT
ARG VITE_DEEPSEEK8b_PORT
ARG VITE_DEEPSEEK14b_PORT
ARG VITE_FRAUD_DETECTION_PORT
ARG VITE_TEXTOSQL_API_PORT

# Expone esos argumentos como variables de entorno para el proceso de build
ENV VITE_API_HOST=$VITE_API_HOST
ENV VITE_GEMMA2b_PORT=$VITE_GEMMA2b_PORT
ENV VITE_GEMMA4b_PORT=$VITE_GEMMA4b_PORT
ENV VITE_GEMMA12b_PORT=$VITE_GEMMA12b_PORT
ENV VITE_MISTRAL_PORT=$VITE_MISTRAL_PORT
ENV VITE_DEEPSEEK8b_PORT=$VITE_DEEPSEEK8b_PORT
ENV VITE_DEEPSEEK14b_PORT=$VITE_DEEPSEEK14b_PORT
ENV VITE_FRAUD_DETECTION_PORT=$VITE_FRAUD_DETECTION_PORT
ENV VITE_TEXTOSQL_API_PORT=$VITE_TEXTOSQL_API_PORT
# --- FIN DE LOS CAMBIOS ---

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 'npm run build' ahora usará las variables de entorno de arriba
RUN npm run build

# ETAPA 2: Servidor (se mantiene igual)
FROM nginx:alpine
RUN apk add --no-cache gettext curl
COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]