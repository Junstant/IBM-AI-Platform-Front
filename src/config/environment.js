// Configuración centralizada de variables de entorno
// Permite debugging fácil y valores por defecto

const config = {
  // Puertos de LLM
  llm: {
    gemma2b: import.meta.env.VITE_GEMMA2b_PORT || "",
    gemma12b: import.meta.env.VITE_GEMMA12b_PORT || "", 
    mistral: import.meta.env.VITE_MISTRAL_PORT || "",
    granite: import.meta.env.VITE_GRANITE_PORT || "",
    gemma4b: import.meta.env.VITE_GEMMA4b_PORT || "",
    deepseek1_5b: import.meta.env.VITE_DEEPSEEK1_5b_PORT || "",
    deepseek8b: import.meta.env.VITE_DEEPSEEK8b_PORT || "",
    deepseek14b: import.meta.env.VITE_DEEPSEEK14b_PORT || ""
  },
  

  // Configuración de NLP Database
  database: {
    host: import.meta.env.VITE_DB_HOST || "",
    port: import.meta.env.VITE_DB_PORT || "",
    name: import.meta.env.VITE_DB_NAME || "",
    user: import.meta.env.VITE_DB_USER || "",
    password: import.meta.env.VITE_DB_PASSWORD || ""
  },
  
  // Configuración de Machine Learning
  ml: {
    fraudDetection: import.meta.env.VITE_FRAUD_DETECTION_PORT || ""
  },
  
  // Configuración del servidor
  server: {
    ip: import.meta.env.VITE_SERVER_IP || ""
  }
};

export default config;
