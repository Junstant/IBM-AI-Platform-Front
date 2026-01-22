/**
 * 🧠 RAG API Service - IBM AI Platform
 * Sistema RAG (Retrieval-Augmented Generation) con Milvus Vector Database
 * 
 * Arquitectura v3.0:
 *  - Nomic Embed Text v1.5 (768D) → Embeddings especializados
 *  - Milvus HNSW → Almacén vectorial (<10ms búsqueda)
 *  - Mistral/Gemma → Generación de respuestas
 * 
 * @version 3.0.0
 * @date 2025-11-27
 */

import { ragAPI, APIError } from '../utils/apiClient';

/**
 * ================================
 * TYPE DEFINITIONS
 * ================================
 */

/**
 * @typedef {Object} HealthResponse
 * @property {string} status - Estado del servicio ("healthy" | "unhealthy")
 * @property {string} service - Nombre del servicio
 * @property {string} version - Versión de la API
 * @property {Object} features - Características habilitadas
 * @property {string} features.vector_database - Base de datos vectorial
 * @property {string} features.embeddings - Estado embeddings
 * @property {string} features.llm - Estado LLM
 * @property {string} features.vector_search - Tipo de búsqueda
 * @property {string} milvus - Estado conexión Milvus
 * @property {string} milvus_host - Host de Milvus
 * @property {string} embedding_model - Modelo de embeddings actual
 * @property {number} embedding_dimension - Dimensión de embeddings
 * @property {string} llm_model - Modelo LLM actual
 */

/**
 * @typedef {Object} EmbeddingModel
 * @property {string} id - ID del modelo
 * @property {string} name - Nombre del modelo
 * @property {string} description - Descripción
 * @property {number} dimensions - Dimensión de embeddings
 * @property {string} [service] - Servicio que ejecuta el modelo
 * @property {number} [port] - Puerto del servicio
 */

/**
 * @typedef {Object} LLMModel
 * @property {string} id - ID del modelo
 * @property {string} name - Nombre del modelo
 * @property {string} description - Descripción
 * @property {string} [service] - Servicio que ejecuta el modelo
 * @property {number} [port] - Puerto del servicio
 */

/**
 * @typedef {Object} ModelsResponse
 * @property {EmbeddingModel[]} embedding_models - Modelos de embeddings disponibles
 * @property {LLMModel[]} llm_models - Modelos LLM disponibles
 * @property {Object} current - Modelos actualmente seleccionados
 * @property {string} current.embedding_model - ID del modelo de embeddings actual
 * @property {string} current.llm_model - ID del modelo LLM actual
 */

/**
 * @typedef {Object} DocumentUploadResponse
 * @property {number} id - ID del documento
 * @property {string} filename - Nombre del archivo
 * @property {string} content_type - Tipo MIME
 * @property {number} file_size - Tamaño en bytes
 * @property {number} total_chunks - Total de chunks procesados
 * @property {string} uploaded_at - Fecha ISO de upload
 */

/**
 * @typedef {Object} DocumentSource
 * @property {string} filename - Nombre del archivo fuente
 * @property {string} content - Contenido del chunk
 * @property {number} similarity - Score de similitud (0-1)
 * @property {number} chunk_index - Índice del chunk en el documento
 */

/**
 * @typedef {Object} QueryResponse
 * @property {string} answer - Respuesta generada por el LLM
 * @property {DocumentSource[]} sources - Fuentes utilizadas
 * @property {string} query - Query original
 */

/**
 * @typedef {Object} Document
 * @property {number} id - ID del documento
 * @property {string} filename - Nombre del archivo
 * @property {string} content_type - Tipo MIME
 * @property {number} file_size - Tamaño en bytes
 * @property {number} total_chunks - Total de chunks
 * @property {string} uploaded_at - Fecha ISO de upload
 */

/**
 * @typedef {Object} StatsResponse
 * @property {number} total_documents - Total de documentos
 * @property {number} total_chunks - Total de chunks
 * @property {number} total_size_bytes - Tamaño total en bytes
 */

/**
 * @typedef {Object} UploadProgress
 * @property {number} loaded - Bytes cargados
 * @property {number} total - Bytes totales
 * @property {number} percent - Porcentaje completado (0-100)
 */

/**
 * ================================
 * RAG SERVICE CLASS
 * ================================
 */

class RAGService {
  constructor() {
    this.baseRoute = '/api/rag';
  }

  /**
   * 1. Health Check
   * Verifica el estado del servicio RAG y sus dependencias
   * 
   * @returns {Promise<HealthResponse>}
   * @throws {APIError}
   */
  async checkHealth() {
    try {
      const response = await ragAPI.get('/health');
      return response;
    } catch (error) {
      console.error('[RAG Service] Health check failed:', error);
      throw error;
    }
  }

  /**
   * 2. Get Available Models
   * Obtiene modelos de embeddings y LLMs disponibles
   * 
   * @returns {Promise<ModelsResponse>}
   * @throws {APIError}
   */
  async getModels() {
    try {
      const response = await ragAPI.get('/models');
      return response;
    } catch (error) {
      console.error('[RAG Service] Failed to fetch models:', error);
      throw error;
    }
  }

  /**
   * 3. Upload Document
   * Sube un documento y lo procesa automáticamente
   * 
   * @param {File} file - Archivo a subir (PDF, DOCX, TXT, CSV, XLSX, MD)
   * @param {Object} options - Opciones de upload
   * @param {string} [options.embedding_model] - ID del modelo de embeddings
   * @param {string} [options.llm_model] - ID del modelo LLM
   * @param {Function} [options.onProgress] - Callback de progreso (UploadProgress)
   * @returns {Promise<DocumentUploadResponse>}
   * @throws {APIError}
   * 
   * @example
   * const file = document.getElementById('fileInput').files[0];
   * const result = await ragService.uploadDocument(file, {
   *   embedding_model: 'nomic-embed-text-v1.5',
   *   llm_model: 'mistral-7b',
   *   onProgress: (progress) => console.log(`${progress.percent}% uploaded`)
   * });
   */
  async uploadDocument(file, options = {}) {
    const { embedding_model, llm_model } = options;

    // Validar archivo
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file: must be a File object');
    }

    // Validar tamaño (100MB máximo)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      throw new Error(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB (max 100MB)`);
    }

    // Validar tipo
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/markdown'
    ];
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|txt|csv|xlsx|md)$/i)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (embedding_model) {
        formData.append('embedding_model', embedding_model);
      }
      
      if (llm_model) {
        formData.append('llm_model', llm_model);
      }

      // Upload con progreso
      const response = await fetch(`${this.baseRoute}/upload`, {
        method: 'POST',
        body: formData,
        // No establecer Content-Type, el browser lo hace automáticamente con boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(response.status, response.statusText, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[RAG Service] Upload failed:', error);
      throw error;
    }
  }

  /**
   * 4. Query Documents
   * Realiza una consulta inteligente sobre los documentos subidos
   * 
   * @param {string} query - Pregunta del usuario
   * @param {Object} options - Opciones de query
   * @param {number} [options.top_k=5] - Número de chunks relevantes (1-20)
   * @returns {Promise<QueryResponse>}
   * @throws {APIError}
   * 
   * @example
   * const result = await ragService.queryDocuments('¿Cómo instalar el sistema?', {
   *   top_k: 5
   * });
   * console.log('Answer:', result.answer);
   * console.log('Sources:', result.sources.length);
   */
  async queryDocuments(query, options = {}) {
    const { top_k = 5 } = options;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query must be a non-empty string');
    }

    if (top_k < 1 || top_k > 20) {
      throw new Error('top_k must be between 1 and 20');
    }

    try {
      const response = await ragAPI.post('/query', {
        query: query.trim(),
        top_k
      });
      return response;
    } catch (error) {
      console.error('[RAG Service] Query failed:', error);
      throw error;
    }
  }

  /**
   * 5. Get Documents
   * Lista todos los documentos subidos
   * 
   * @returns {Promise<Document[]>}
   * @throws {APIError}
   */
  async getDocuments() {
    try {
      const response = await ragAPI.get('/documents');
      return response;
    } catch (error) {
      console.error('[RAG Service] Failed to fetch documents:', error);
      throw error;
    }
  }

  /**
   * 6. Delete Document
   * Elimina un documento y todos sus chunks
   * 
   * @param {number} documentId - ID del documento a eliminar
   * @returns {Promise<{message: string}>}
   * @throws {APIError}
   */
  async deleteDocument(documentId) {
    if (!documentId || typeof documentId !== 'number') {
      throw new Error('Document ID must be a number');
    }

    try {
      const response = await ragAPI.delete(`/documents/${documentId}`);
      return response;
    } catch (error) {
      console.error('[RAG Service] Delete failed:', error);
      throw error;
    }
  }

  /**
   * 7. Get Stats
   * Obtiene estadísticas del sistema RAG
   * 
   * @returns {Promise<StatsResponse>}
   * @throws {APIError}
   */
  async getStats() {
    try {
      const response = await ragAPI.get('/stats');
      return response;
    } catch (error) {
      console.error('[RAG Service] Failed to fetch stats:', error);
      throw error;
    }
  }

  /**
   * ================================
   * UTILITY METHODS
   * ================================
   */

  /**
   * Format file size to human-readable string
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado (ej: "1.5 MB")
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate if RAG system is operational
   * @returns {Promise<boolean>}
   */
  async isOperational() {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy' && health.milvus === 'connected';
    } catch {
      return false;
    }
  }

  /**
   * Get embedding model by ID
   * @param {string} modelId - ID del modelo
   * @returns {Promise<EmbeddingModel|null>}
   */
  async getEmbeddingModelById(modelId) {
    try {
      const models = await this.getModels();
      return models.embedding_models.find(m => m.id === modelId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get LLM model by ID
   * @param {string} modelId - ID del modelo
   * @returns {Promise<LLMModel|null>}
   */
  async getLLMModelById(modelId) {
    try {
      const models = await this.getModels();
      return models.llm_models.find(m => m.id === modelId) || null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
const ragService = new RAGService();
export default ragService;

// Named exports for convenience
export {
  ragService,
  RAGService,
  APIError
};
