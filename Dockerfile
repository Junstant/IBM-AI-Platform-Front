# ETAPA 1: Compilación
FROM node:20-slim AS build

# --- CORRECCIÓN AQUÍ ---
# Declara los argumentos con los NOMBRES EXACTOS que vienen de docker-compose
ARG VITE_API_HOST
ARG VITE_GEMMA_2B_PORT
ARG VITE_GEMMA_4B_PORT
ARG VITE_GEMMA_12B_PORT
ARG VITE_MISTRAL_PORT
ARG VITE_DEEPSEEK_8B_PORT
ARG VITE_FRAUD_DETECTION_PORT
ARG VITE_TEXTOSQL_API_PORT
ARG VITE_STATS_API_PORT
ARG VITE_RAG_API_PORT
ARG VITE_EMBEDDINGS_PORT

# Expone esos argumentos como variables de entorno para el proceso de build
ENV VITE_API_HOST=$VITE_API_HOST
ENV VITE_GEMMA_2B_PORT=$VITE_GEMMA_2B_PORT
ENV VITE_GEMMA_4B_PORT=$VITE_GEMMA_4B_PORT
ENV VITE_GEMMA_12B_PORT=$VITE_GEMMA_12B_PORT
ENV VITE_MISTRAL_PORT=$VITE_MISTRAL_PORT
ENV VITE_DEEPSEEK_8B_PORT=$VITE_DEEPSEEK_8B_PORT
ENV VITE_FRAUD_DETECTION_PORT=$VITE_FRAUD_DETECTION_PORT
ENV VITE_TEXTOSQL_API_PORT=$VITE_TEXTOSQL_API_PORT
ENV VITE_STATS_API_PORT=$VITE_STATS_API_PORT
ENV VITE_RAG_API_PORT=$VITE_RAG_API_PORT
ENV VITE_EMBEDDINGS_PORT=$VITE_EMBEDDINGS_PORT
# --- FIN DE LA CORRECCIÓN ---
    
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