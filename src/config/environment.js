// Configuración centralizada de variables de entorno
// Permite debugging fácil y valores por defecto
// Ahora usa las variables del Docker Compose centralizado

const config = {
  // Configuración del servidor
  server: {
    host: import.meta.env.VITE_API_HOST || "",
  },

  // Configuración de base de datos
  database: {
    host: import.meta.env.VITE_API_HOST || "",
    port: import.meta.env.VITE_DB_PORT || "",
    user: import.meta.env.VITE_DB_USER || "",
    password: import.meta.env.VITE_DB_PASSWORD || "",
    name: import.meta.env.VITE_DB1_NAME || "",
    fraudDb: import.meta.env.VITE_DB2_NAME || "",
  },

  // Puertos de APIs
  apis: {
    textosql: import.meta.env.VITE_TEXTOSQL_API_PORT || "",
    fraude: import.meta.env.VITE_FRAUDE_API_PORT || "",
    stats: import.meta.env.VITE_STATS_API_PORT || "",
    rag: import.meta.env.VITE_RAG_API_PORT || "8004",
  },

  // ✨ RAG API Configuration (v3.0)
  rag: {
    apiUrl: import.meta.env.VITE_RAG_API_URL || '/api/rag',
    apiPort: import.meta.env.VITE_RAG_API_PORT || "8004",
    // Milvus Vector Database
    milvusHost: import.meta.env.VITE_MILVUS_HOST || 'milvus-standalone',
    milvusPort: import.meta.env.VITE_MILVUS_PORT || "19530",
    // MinIO Object Storage (opcional, para debugging)
    minioConsoleUrl: import.meta.env.VITE_MINIO_CONSOLE_URL || `http://${import.meta.env.VITE_API_HOST || 'localhost'}:9001`,
    // Embeddings Service
    embeddingsPort: import.meta.env.VITE_EMBEDDINGS_PORT || "8090",
    embeddingModel: import.meta.env.VITE_EMBEDDING_MODEL || "nomic-embed-text-v1.5",
    embeddingDimension: parseInt(import.meta.env.VITE_EMBEDDING_DIMENSION || "768"),
  },

  // Puertos de modelos LLM (actualizados según configuración centralizada)
  llm: {
    gemma2b: import.meta.env.VITE_GEMMA_2B_PORT || "",
    gemma4b: import.meta.env.VITE_GEMMA_4B_PORT || "",
    gemma12b: import.meta.env.VITE_GEMMA_12B_PORT || "",
    mistral: import.meta.env.VITE_MISTRAL_PORT || "",
    deepseek8b: import.meta.env.VITE_DEEPSEEK_8B_PORT || "",
  },

  // Configuración de Machine Learning (usa la nueva API de fraude)
  ml: {
    fraudDetection: import.meta.env.VITE_FRAUDE_API_PORT || ""
  },

  // Puerto del frontend
  frontend: {
    port: import.meta.env.VITE_NGINX_PORT || "",
  },

  // ✅ AGREGAR CONFIGURACIÓN PARA STATS API
  stats: {
    apiPort: import.meta.env.VITE_STATS_API_PORT || "8003",
    baseUrl: "/api/stats" // Ruta relativa al proxy nginx
  },

};

export default config;
