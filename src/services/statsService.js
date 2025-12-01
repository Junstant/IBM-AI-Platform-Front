/**
 * 📊 Stats Service - IBM AI Platform
 * Servicio para estadísticas y métricas del sistema
 * 
 * @version 2.1.0
 * @date 2025-12-01
 * @aligned_with Backend Stats API v2.0 (endpoints con prefijo /v2/ y formato kebab-case)
 */

import { statsAPI, APIError } from '../utils/apiClient';

/**
 * ================================
 * TYPE DEFINITIONS (Aligned with Backend Spec)
 * ================================
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} active_models - Modelos LLM activos
 * @property {number} error_models - Modelos LLM con error
 * @property {number} active_apis - APIs activas
 * @property {number} error_apis - APIs con error
 * @property {number} daily_queries - Consultas del día
 * @property {number} daily_successful_queries - Consultas exitosas
 * @property {number} daily_failed_queries - Consultas fallidas
 * @property {number} avg_response_time - Tiempo promedio (segundos)
 * @property {number} global_accuracy - Precisión global (%)
 * @property {string} timestamp - Timestamp ISO 8601
 */

/**
 * @typedef {Object} ServiceStatus
 * @property {string} service_name - Nombre del servicio (gemma-2b, fraud_detection_api, etc.)
 * @property {string} display_name - Nombre para mostrar
 * @property {string} status - "online" | "offline" | "error" | "degraded"
 * @property {number} uptime_seconds - Tiempo activo (segundos)
 * @property {number} total_requests - Total de requests
 * @property {number} successful_requests - Requests exitosos
 * @property {number} failed_requests - Requests fallidos
 * @property {number} avg_latency_ms - Latencia promedio (ms)
 * @property {string} last_check - Timestamp ISO del último check
 * @property {Object} metadata - Metadata adicional (puerto, host, versión)
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - ID de la alerta
 * @property {string} type - Tipo de alerta
 * @property {string} severity - "critical" | "warning" | "info" | "success"
 * @property {string} title - Título de la alerta
 * @property {string} message - Mensaje de la alerta
 * @property {string} timestamp - Timestamp ISO
 * @property {string} funcionalidad - Funcionalidad relacionada
 * @property {boolean} resolved - Si está resuelta
 * @property {Object} metadata - Metadata adicional
 */

/**
 * @typedef {Object} Activity
 * @property {string} id - ID de la actividad
 * @property {string} timestamp - Timestamp ISO
 * @property {string} type - Tipo de evento
 * @property {string} severity - "info" | "warning" | "success" | "critical"
 * @property {string} title - Título del evento
 * @property {string} description - Descripción detallada
 * @property {string} user - Usuario que ejecutó (o "system")
 * @property {Object} metadata - Metadata adicional
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
      return await statsAPI.get('/v2/dashboard-summary');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Dashboard Summary Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ NUEVO: Obtener estado de servicios (modelos LLM + APIs)
   * @returns {Promise<Object>} - { llm_models: [], api_endpoints: [] }
   * @throws {APIError}
   */
  async getServicesStatus() {
    try {
      return await statsAPI.get('/v2/services-status');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Services Status Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener estado de modelos (backward compatibility)
   * @returns {Promise<Array<ModelStatus>>}
   * @throws {APIError}
   */
  async getModelsStatus() {
    try {
      const data = await this.getServicesStatus();
      return data.llm_models || [];
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Models Status Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener alertas activas
   * @returns {Promise<Object>} - { alerts: [], total_active: number, timestamp: string }
   * @throws {APIError}
   */
  async getAlerts() {
    try {
      return await statsAPI.get('/v2/active-alerts');
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
      return await statsAPI.post(`/v2/alerts/${alertId}/resolve`, {});
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Resolve Alert Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener performance por funcionalidad
   * @returns {Promise<Object>} - { functionalities: [], timestamp: string }
   * @throws {APIError}
   */
  async getFunctionalityPerformance() {
    try {
      return await statsAPI.get('/v2/functionality-performance');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Functionality Performance Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener errores recientes
   * @param {number} limit - Máximo de errores (default: 20)
   * @returns {Promise<Object>} - { errors: [], total_errors_today: number, timestamp: string }
   * @throws {APIError}
   */
  async getRecentErrors(limit = 20) {
    try {
      return await statsAPI.get('/v2/recent-errors', { limit });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Recent Errors Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener tendencias por hora
   * @param {number} hours - Número de horas hacia atrás (default: 24)
   * @returns {Promise<Object>} - { period_start, period_end, data: [] }
   * @throws {APIError}
   */
  async getHourlyTrends(hours = 24) {
    try {
      return await statsAPI.get('/v2/hourly-trends', { hours });
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
      return await statsAPI.get('/v2/system-resources');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`System Resources Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ NUEVO: Obtener actividad reciente
   * @param {number} limit - Máximo de actividades (default: 10)
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async getRecentActivity(limit = 10) {
    try {
      return await statsAPI.get('/v2/recent-activity', { limit });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Recent Activity Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ NUEVO: Obtener métricas detalladas
   * @param {Object} params - { timeframe, funcionalidad }
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async getDetailedMetrics(params = {}) {
    try {
      return await statsAPI.get('/v2/detailed-metrics', params);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Detailed Metrics Error ${error.status}:`, error.statusText);
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
