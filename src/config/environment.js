/**
 * ⚙️ Configuración Centralizada - IBM AI Platform
 * Archivo único para toda la configuración del frontend
 * Facilita agregar modelos, cambiar puertos, ajustar parámetros
 * 
 * @version 2.0.0
 * @date 2025-11-27
 */

const config = {
  // ========================================
  // 🖥️ SERVIDOR Y CONEXIÓN
  // ========================================
  server: {
    host: import.meta.env.VITE_API_HOST || "",
    serverIP: import.meta.env.VITE_SERVER_IP || "localhost",
  },

  // ========================================
  // 🗄️ BASE DE DATOS
  // ========================================
  database: {
    host: import.meta.env.VITE_API_HOST || "",
    port: import.meta.env.VITE_DB_PORT || "",
    user: import.meta.env.VITE_DB_USER || "",
    password: import.meta.env.VITE_DB_PASSWORD || "",
    name: import.meta.env.VITE_DB1_NAME || "",
    fraudDb: import.meta.env.VITE_DB2_NAME || "",
  },

  // ========================================
  // 🔌 APIS DEL SISTEMA
  // ========================================
  apis: {
    textosql: import.meta.env.VITE_TEXTOSQL_API_PORT || "",
    fraude: import.meta.env.VITE_FRAUDE_API_PORT || "",
    stats: import.meta.env.VITE_STATS_API_PORT || "",
    rag: import.meta.env.VITE_RAG_API_PORT || "8004",
    baseUrls: {
      textosql: "/api/textosql",
      fraude: "/api/fraude",
      stats: "/api/stats",
      rag: "/api/rag",
      admin: "/api/admin",
      metrics: "/api/metrics",
    }
  },

  // ========================================
  // 📊 RAG API CONFIGURATION (v3.0)
  // ========================================
  rag: {
    apiUrl: import.meta.env.VITE_RAG_API_URL || '/api/rag',
    apiPort: import.meta.env.VITE_RAG_API_PORT || "8004",
    // Milvus Vector Database
    milvusHost: import.meta.env.VITE_MILVUS_HOST || 'milvus-standalone',
    milvusPort: import.meta.env.VITE_MILVUS_PORT || "19530",
    // MinIO Object Storage
    minioConsoleUrl: import.meta.env.VITE_MINIO_CONSOLE_URL || `http://${import.meta.env.VITE_API_HOST || 'localhost'}:9001`,
    // Embeddings Service
    embeddingsPort: import.meta.env.VITE_EMBEDDINGS_PORT || "8090",
    embeddingModel: import.meta.env.VITE_EMBEDDING_MODEL || "nomic-embed-text-v1.5",
    embeddingDimension: parseInt(import.meta.env.VITE_EMBEDDING_DIMENSION || "768"),
    // Límites de archivos
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFormats: ['.pdf', '.txt', '.doc', '.docx', '.md'],
  },

  // ========================================
  // 🤖 MODELOS LLM DISPONIBLES
  // ========================================
  llm: {
    // Configuración de puertos desde env
    ports: {
      gemma2b: import.meta.env.VITE_GEMMA_2B_PORT || "8085",
      gemma4b: import.meta.env.VITE_GEMMA_4B_PORT || "8086",
      gemma12b: import.meta.env.VITE_GEMMA_12B_PORT || "8087",
      mistral: import.meta.env.VITE_MISTRAL_PORT || "8088",
      deepseek1_5b: import.meta.env.VITE_DEEPSEEK_1_5B_PORT || "8091",
      deepseek8b: import.meta.env.VITE_DEEPSEEK_8B_PORT || "8089",
    },
    
    // ✨ DEFINICIÓN CENTRALIZADA DE MODELOS
    // Para agregar un nuevo modelo, solo añádelo aquí
    availableModels: [
      {
        id: "gemma-2b",
        name: "Gemma 2B",
        port: import.meta.env.VITE_GEMMA_2B_PORT || "8085",
        description: "Modelo ligero y rápido",
        type: "general",
        recommended: "chatbot",
        containerName: "gemma-2b",
        internalPort: 8080,
      },
      {
        id: "gemma-4b",
        name: "Gemma 4B",
        port: import.meta.env.VITE_GEMMA_4B_PORT || "8086",
        description: "Modelo balanceado",
        type: "general",
        recommended: "general",
        containerName: "gemma-4b",
        internalPort: 8080,
      },
      {
        id: "gemma-12b",
        name: "Gemma 12B",
        port: import.meta.env.VITE_GEMMA_12B_PORT || "8087",
        description: "Modelo de alta capacidad",
        type: "general",
        recommended: "rag",
        containerName: "gemma-12b",
        internalPort: 8080,
      },
      {
        id: "mistral-7b",
        name: "Mistral 7B",
        port: import.meta.env.VITE_MISTRAL_PORT || "8088",
        description: "Modelo general equilibrado",
        type: "general",
        recommended: "rag",
        containerName: "mistral-7b",
        internalPort: 8080,
      },
      {
        id: "deepseek-1.5b",
        name: "DeepSeek 1.5B",
        port: import.meta.env.VITE_DEEPSEEK_1_5B_PORT || "8091",
        description: "Ultraligero",
        type: "general",
        recommended: "chatbot",
        containerName: "deepseek-1.5b",
        internalPort: 8080,
      },
      {
        id: "deepseek-8b",
        name: "DeepSeek 8B",
        port: import.meta.env.VITE_DEEPSEEK_8B_PORT || "8089",
        description: "Equilibrado",
        type: "general",
        recommended: "textosql",
        containerName: "deepseek-8b",
        internalPort: 8080,
      },
    ],
    
    // Parámetros por defecto de generación
    defaultParams: {
      max_tokens: 1024,
      temperature: 0.6,
      top_k: 50,
      top_p: 0.95,
      presence_penalty: 1.1,
      frequency_penalty: 0.8,
      stop: ["</s>", "<|user|>", "<|system|>", "Human:", "User:"],
      stream: true,
    },
    
    // Modelo por defecto para cada feature
    defaults: {
      chatbot: "gemma-2b",
      textosql: "mistral-7b",
      rag: "mistral-7b",
    },
  },

  // ========================================
  // 🛡️ MACHINE LEARNING
  // ========================================
  ml: {
    fraudDetection: import.meta.env.VITE_FRAUDE_API_PORT || ""
  },

  // ========================================
  // 🎨 UI Y ANIMACIONES
  // ========================================
  ui: {
    // Duración de toasts y notificaciones (ms)
    toastDuration: 5000,
    toastFadeDuration: 300,
    successAnimationDuration: 2000,
    
    // Delays de animaciones (ms)
    animationDelays: {
      statsCard1: 0,
      statsCard2: 50,
      statsCard3: 100,
      statsCard4: 150,
      documentItem: 80,
      querySource: 80,
    },
    
    // Intervalos de actualización (ms)
    refreshIntervals: {
      dashboardSummary: 30000,
      modelsStatus: 30000,
      systemResources: 30000,
      alerts: 10000,
    },
    
    // Paginación
    pagination: {
      defaultItemsPerPage: 10000,
    },
  },

  // ========================================
  // ⏱️ TIMEOUTS Y LÍMITES
  // ========================================
  timeouts: {
    // API requests (ms)
    default: 30000,
    upload: 300000, // 5 minutos para uploads
    health: 5000,
    
    // Reintentos
    maxRetries: 3,
    retryBaseDelay: 1000,
    retryMaxDelay: 10000,
  },

  // ========================================
  // 🌐 NGINX Y PROXY
  // ========================================
  nginx: {
    // Configuración de uploads
    maxBodySize: "100M",
    bodyTimeout: "300s",
    proxyTimeout: "300s",
    
    // Puertos internos de contenedores
    internalPorts: {
      llamacpp: 8080,
      nginx: 80,
    },
  },

  // ========================================
  // 🎯 FRONTEND
  // ========================================
  frontend: {
    port: import.meta.env.VITE_NGINX_PORT || "",
  },

  // ========================================
  // 📈 STATS API
  // ========================================
  stats: {
    apiPort: import.meta.env.VITE_STATS_API_PORT || "8003",
    baseUrl: "/api/stats",
  },

  // ========================================
  // 🔧 UTILIDADES
  // ========================================
  
  /**
   * Obtener modelo por ID
   * @param {string} modelId - ID del modelo
   * @returns {Object|null} Modelo encontrado o null
   */
  getModelById(modelId) {
    return this.llm.availableModels.find(m => m.id === modelId) || null;
  },
  
  /**
   * Obtener modelos por tipo o recomendación
   * @param {string} filter - 'type' o 'recommended'
   * @param {string} value - Valor a buscar
   * @returns {Array<Object>} Lista de modelos
   */
  getModels(filter, value) {
    if (!filter) return this.llm.availableModels;
    return this.llm.availableModels.filter(m => m[filter] === value);
  },
  
  /**
   * Obtener modelo por defecto para una feature
   * @param {string} feature - 'chatbot' | 'textosql' | 'rag'
   * @returns {Object|null} Modelo encontrado o null
   */
  getDefaultModel(feature) {
    const modelId = this.llm.defaults[feature];
    return this.getModelById(modelId);
  },
};

export default config;
