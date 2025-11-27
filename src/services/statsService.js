/**
 * 📊 Stats Service - IBM AI Platform
 * Servicio para estadísticas y métricas del sistema
 * 
 * @version 1.0.0
 * @date 2025-11-27
 */

import { statsAPI, APIError } from '../utils/apiClient';

/**
 * ================================
 * TYPE DEFINITIONS
 * ================================
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} active_models - Modelos activos
 * @property {number} error_models - Modelos con error
 * @property {number} daily_queries - Consultas del día
 * @property {number} daily_successful_queries - Consultas exitosas
 * @property {number} avg_response_time - Tiempo promedio de respuesta (s)
 * @property {number} global_accuracy - Precisión global (%)
 */

/**
 * @typedef {Object} ModelStatus
 * @property {string} model_id - ID del modelo
 * @property {string} name - Nombre del modelo
 * @property {string} status - Estado ("online" | "offline" | "error")
 * @property {number} uptime - Tiempo activo (segundos)
 * @property {number} requests_count - Número de requests
 * @property {number} avg_latency - Latencia promedia (ms)
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - ID de la alerta
 * @property {string} type - Tipo de alerta
 * @property {string} severity - "critical" | "warning" | "info"
 * @property {string} message - Mensaje de la alerta
 * @property {string} timestamp - Timestamp ISO
 * @property {boolean} resolved - Si está resuelta
 */

/**
 * ================================
 * STATS SERVICE API
 * ================================
 */

const statsService = {
  /**
   * Obtener resumen del dashboard
   * @returns {Promise<DashboardSummary>}
   * @throws {APIError}
   */
  async getDashboardSummary() {
    try {
      return await statsAPI.get('/dashboard-summary');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Dashboard Summary Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener estado de modelos
   * @returns {Promise<Array<ModelStatus>>}
   * @throws {APIError}
   */
  async getModelsStatus() {
    try {
      return await statsAPI.get('/models-status');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Models Status Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener alertas activas
   * @returns {Promise<Array<Alert>>}
   * @throws {APIError}
   */
  async getAlerts() {
    try {
      return await statsAPI.get('/alerts');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Alerts Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Resolver una alerta
   * @param {string} alertId - ID de la alerta
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async resolveAlert(alertId) {
    try {
      return await statsAPI.post(`/alerts/${alertId}/resolve`, {});
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Resolve Alert Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener performance por funcionalidad
   * @returns {Promise<Array<Object>>}
   * @throws {APIError}
   */
  async getFunctionalityPerformance() {
    try {
      return await statsAPI.get('/functionality-performance');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Functionality Performance Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener errores recientes
   * @returns {Promise<Array<Object>>}
   * @throws {APIError}
   */
  async getRecentErrors() {
    try {
      return await statsAPI.get('/recent-errors');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Recent Errors Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener tendencias por hora
   * @returns {Promise<Array<Object>>}
   * @throws {APIError}
   */
  async getHourlyTrends() {
    try {
      return await statsAPI.get('/hourly-trends');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Hourly Trends Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener recursos del sistema
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async getSystemResources() {
    try {
      return await statsAPI.get('/system-resources');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`System Resources Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Health check del servicio de stats
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    try {
      return await statsAPI.get('/health');
    } catch (error) {
      console.warn('Stats service health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  },

  /**
   * Formatear tiempo de respuesta
   * @param {number} time - Tiempo en segundos
   * @returns {string}
   */
  formatResponseTime(time) {
    if (time === null || time === undefined) return 'N/A';
    if (time < 1) return `${(time * 1000).toFixed(0)}ms`;
    return `${time.toFixed(2)}s`;
  },

  /**
   * Formatear porcentaje
   * @param {number} value - Valor (0-100)
   * @returns {string}
   */
  formatPercentage(value) {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  },

  /**
   * Obtener color según estado
   * @param {string} status - Estado del modelo
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'online': 'text-success',
      'offline': 'text-text-disabled',
      'error': 'text-danger',
      'warning': 'text-carbon-yellow-50',
    };
    return colors[status] || 'text-text-secondary';
  },
};

export default statsService;
export { APIError };
