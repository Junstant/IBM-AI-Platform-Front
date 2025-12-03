/**
 * 📊 Stats Service - IBM AI Platform
 * Servicio para estadísticas y métricas del sistema
 * 
 * @version 2.1.0
 * @date 2025-12-03
 * @aligned_with Backend Stats API v2.0 (Validated Routes)
 * @backend_docs See backend documentation for endpoint details
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
      return await statsAPI.get('/dashboard/summary');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Dashboard Summary Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ Obtener estado de servicios (modelos LLM + APIs)
   * Backend retorna array de servicios con service_type para diferenciar
   * @returns {Promise<Array>} - Array de servicios con service_type: 'llm' | 'fraud' | 'textosql'
   * @throws {APIError}
   */
  async getServicesStatus() {
    try {
      return await statsAPI.get('/services/status');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Services Status Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener estado de modelos LLM (filtrado de services)
   * @returns {Promise<Array<ModelStatus>>}
   * @throws {APIError}
   */
  async getModelsStatus() {
    try {
      const services = await this.getServicesStatus();
      // Backend retorna array, filtrar solo modelos LLM
      return Array.isArray(services) ? services.filter(s => s.service_type === 'llm') : [];
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Models Status Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener alertas activas (v2 endpoint)
   * @returns {Promise<Array>} - Array de alertas activas
   * @throws {APIError}
   */
  async getAlerts() {
    try {
      const response = await statsAPI.get('/v2/alerts/active');
      // Backend v2 retorna array directamente
      return Array.isArray(response) ? response : [];
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Alerts Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Resolver una alerta (admin endpoint)
   * @param {string} alertId - ID de la alerta
   * @param {string} resolvedBy - Usuario que resuelve (default: 'admin')
   * @returns {Promise<Object>}
   * @throws {APIError}
   */
  async resolveAlert(alertId, resolvedBy = 'admin') {
    try {
      return await statsAPI.post(`/admin/resolve-alert/${alertId}?resolved_by=${resolvedBy}`);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Resolve Alert Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener top endpoints (performance)
   * @param {number} limit - Número de resultados (default: 10)
   * @param {boolean} worst - Si true, muestra los peores (default: false)
   * @returns {Promise<Array>} - Array de endpoints con métricas
   * @throws {APIError}
   */
  async getTopEndpoints(limit = 10, worst = false) {
    try {
      return await statsAPI.get('/v2/performance/top-endpoints', { limit, worst });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Top Endpoints Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener métricas globales
   * @param {string} startDate - Fecha inicio ISO 8601
   * @param {string} endDate - Fecha fin ISO 8601
   * @returns {Promise<Object>} - Métricas agregadas del periodo
   * @throws {APIError}
   */
  async getGlobalMetrics(startDate, endDate) {
    try {
      return await statsAPI.get('/v2/metrics/global', { start_date: startDate, end_date: endDate });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Global Metrics Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener tendencias por hora (v2 endpoint)
   * @param {string} startDate - Fecha inicio ISO 8601
   * @param {string} endDate - Fecha fin ISO 8601
   * @param {string} service - Filtrar por servicio (opcional)
   * @returns {Promise<Array>} - Array de tendencias por hora
   * @throws {APIError}
   */
  async getHourlyTrends(startDate, endDate, service = null) {
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (service) params.service = service;
      return await statsAPI.get('/v2/trends/hourly', params);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Hourly Trends Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Obtener recursos del sistema
   * @returns {Promise<Object>} - { cpu_percent, memory_percent, disk_percent, timestamp }
   * @throws {APIError}
   */
  async getSystemResources() {
    try {
      return await statsAPI.get('/system/resources');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`System Resources Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ Obtener actividad reciente (v2 endpoint)
   * @param {number} limit - Máximo de actividades (default: 20)
   * @returns {Promise<Array>} - Array de actividades
   * @throws {APIError}
   */
  async getRecentActivity(limit = 20) {
    try {
      const response = await statsAPI.get('/v2/activity/recent', { limit });
      return Array.isArray(response) ? response : [];
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Recent Activity Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ Obtener métricas detalladas (para MetricsPage)
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.timeframe - 'today', '7days', '30days'
   * @param {string} params.funcionalidad - 'all', 'nlp', 'textosql', 'fraud', etc.
   * @returns {Promise<Object>} - { summary, top_endpoints, worst_endpoints, errors, period }
   * @throws {APIError}
   */
  async getDetailedMetrics({ timeframe = 'today', funcionalidad = 'all' }) {
    try {
      const params = { timeframe, funcionalidad };
      return await statsAPI.get('/v2/metrics/detailed', params);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Detailed Metrics Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * ✨ Obtener métricas por servicio
   * @param {string} startDate - Fecha inicio ISO 8601
   * @param {string} endDate - Fecha fin ISO 8601
   * @param {string} service - Filtrar por servicio (opcional)
   * @returns {Promise<Array>} - Array de métricas por servicio
   * @throws {APIError}
   */
  async getMetricsByService(startDate, endDate, service = null) {
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (service) params.service = service;
      return await statsAPI.get('/v2/metrics/by-service', params);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Metrics by Service Error ${error.status}:`, error.statusText);
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
