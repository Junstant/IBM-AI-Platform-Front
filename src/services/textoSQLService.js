/**
 * 🗄️ Text-to-SQL Service - IBM AI Platform
 * Servicio para convertir lenguaje natural a consultas SQL
 * 
 * @version 2.0.0
 * @date 2025-11-27
 */

import { textoSQLAPI, APIError } from '../utils/apiClient';
import config from '../config/environment';

/**
 * ================================
 * TYPE DEFINITIONS
 * ================================
 */

/**
 * @typedef {Object} Model
 * @property {string} id - ID del modelo
 * @property {string} name - Nombre del modelo
 * @property {string} port - Puerto del servicio
 * @property {string} description - Descripción del modelo
 */

/**
 * @typedef {Object} Database
 * @property {string} id - ID de la base de datos
 * @property {string} name - Nombre de la base de datos
 * @property {string} description - Descripción
 * @property {string} host - Host de la BD
 * @property {number} port - Puerto de la BD
 */

/**
 * @typedef {Object} QueryRequest
 * @property {string} database_id - ID de la base de datos
 * @property {string} model_id - ID del modelo LLM
 * @property {string} question - Pregunta en lenguaje natural
 */

/**
 * @typedef {Object} QueryResult
 * @property {string} question - Pregunta original
 * @property {string} sql_query - Query SQL generada
 * @property {Array<Object>} results - Resultados de la consulta
 * @property {string} explanation - Explicación de la query
 * @property {string|null} error - Error si ocurrió
 * @property {string} database_used - Base de datos usada
 * @property {string} model_used - Modelo LLM usado
 */

/**
 * @typedef {Object} SchemaInfo
 * @property {string} database - Nombre de la base de datos
 * @property {Array<Object>} tables - Lista de tablas con columnas
 */

/**
 * ================================
 * TEXT-TO-SQL SERVICE API
 * ================================
 */

const textoSQLService = {
  /**
   * Obtener modelos LLM disponibles
   * @returns {Promise<Array<Model>>}
   * @throws {APIError}
   */
  async getAvailableModels() {
    try {
      const data = await textoSQLAPI.get('/models');
      return data.models || [];
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`TextoSQL Models Error ${error.status}:`, error.statusText);
      }
      
      // ✨ FALLBACK A CONFIGURACIÓN CENTRALIZADA
      console.warn('Using fallback static models from config');
      return config.llm.availableModels.map(model => ({
        id: model.id,
        name: model.name,
        port: model.port,
        description: model.description,
      }));
    }
  },

  /**
   * Obtener bases de datos disponibles
   * @returns {Promise<Array<Database>>}
   * @throws {APIError}
   */
  async getAvailableDatabases() {
    try {
      const data = await textoSQLAPI.get('/databases');
      return data.databases || [];
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`TextoSQL Databases Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Hacer una consulta en lenguaje natural
   * @param {QueryRequest} queryRequest - Datos de la consulta
   * @returns {Promise<QueryResult>}
   * @throws {APIError}
   */
  async askQuestion(queryRequest) {
    try {
      if (!queryRequest.question?.trim()) {
        throw new Error('La pregunta no puede estar vacía');
      }
      if (!queryRequest.database_id) {
        throw new Error('Debes seleccionar una base de datos');
      }
      if (!queryRequest.model_id) {
        throw new Error('Debes seleccionar un modelo LLM');
      }

      const result = await textoSQLAPI.post('/query/ask-dynamic', {
        database_id: queryRequest.database_id,
        model_id: queryRequest.model_id,
        question: queryRequest.question.trim(),
      });

      return result;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`TextoSQL Query Error ${error.status}:`, error.statusText, error.data);
        throw new Error(error.data?.detail?.error || error.data?.detail || error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener schema de una base de datos
   * @param {string} databaseId - ID de la base de datos
   * @returns {Promise<SchemaInfo>}
   * @throws {APIError}
   */
  async getDatabaseSchema(databaseId) {
    try {
      const result = await textoSQLAPI.get(`/schema/${databaseId}`);
      return result;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Schema Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Ejecutar discovery de base de datos
   * @param {string} databaseId - ID de la base de datos
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async discoverDatabase(databaseId) {
    try {
      const result = await textoSQLAPI.post(`/discovery/${databaseId}`, {});
      return result;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Discovery Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Ejecutar SQL raw
   * @param {string} databaseId - ID de la base de datos
   * @param {string} sqlQuery - Query SQL
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async executeRawSQL(databaseId, sqlQuery) {
    try {
      const result = await textoSQLAPI.post('/query/execute', {
        database_id: databaseId,
        sql_query: sqlQuery,
      });
      return result;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`SQL Execution Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Health check del servicio
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    try {
      const result = await textoSQLAPI.get('/health');
      return result;
    } catch (error) {
      console.warn('TextoSQL service health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  },

  /**
   * Formatear resultados para display
   * @param {QueryResult} queryResult - Resultado de la query
   * @returns {Object}
   */
  formatResults(queryResult) {
    return {
      question: queryResult.question,
      sqlQuery: queryResult.sql_query,
      results: queryResult.results || [],
      explanation: queryResult.explanation || '',
      timestamp: new Date().toLocaleString(),
      executionTime: 0,
      error: queryResult.error || null,
      database_used: queryResult.database_used,
      model_used: queryResult.model_used,
    };
  },
};

export default textoSQLService;
export { APIError };
