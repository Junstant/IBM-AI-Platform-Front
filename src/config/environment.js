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
    stats: import.meta.env.VITE_STATS_API_PORT || "", // ✅ AGREGAR ESTA LÍNEA
  },

  // Puertos de modelos LLM (actualizados según configuración centralizada)
  llm: {
    gemma2b: import.meta.env.VITE_GEMMA_2B_PORT || "",
    gemma4b: import.meta.env.VITE_GEMMA_4B_PORT || "",
    gemma12b: import.meta.env.VITE_GEMMA_12B_PORT || "",
    mistral: import.meta.env.VITE_MISTRAL_PORT || "",
    deepseek8b: import.meta.env.VITE_DEEPSEEK_8B_PORT || "",
    deepseek14b: import.meta.env.VITE_DEEPSEEK_14B_PORT || "",
    // Puertos legacy para compatibilidad
    granite: import.meta.env.VITE_GRANITE_PORT || "",
    deepseek1_5b: import.meta.env.VITE_DEEPSEEK1_5B_PORT || "",
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
