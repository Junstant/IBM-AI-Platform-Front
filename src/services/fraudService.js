/**
 * 🛡️ Fraud Detection Service - IBM AI Platform
 * Servicio para detección de fraude en transacciones
 * 
 * @version 1.0.0
 * @date 2025-11-27
 */

import { fraudeAPI, APIError } from '../utils/apiClient';

/**
 * ================================
 * TYPE DEFINITIONS
 * ================================
 */

/**
 * @typedef {Object} TransactionData
 * @property {number} monto - Monto de la transacción
 * @property {string} comerciante - Nombre del comerciante
 * @property {string} ubicacion - Ubicación de la transacción
 * @property {string} tipo_tarjeta - Tipo de tarjeta (Visa, Mastercard, etc.)
 * @property {string} horario_transaccion - Hora de la transacción (HH:MM:SS)
 */

/**
 * @typedef {Object} FraudPrediction
 * @property {string} prediccion - "FRAUDE" o "NORMAL"
 * @property {number} probabilidad_fraude - Probabilidad de fraude (0-1)
 * @property {string} nivel_riesgo - "ALTO", "MEDIO", "BAJO"
 * @property {Object} transaction_data - Datos de la transacción analizada
 */

/**
 * @typedef {Object} DatabaseAnalysisResult
 * @property {number} total_analyzed - Total de transacciones analizadas
 * @property {number} fraud_detected - Número de fraudes detectados
 * @property {number} normal_transactions - Transacciones normales
 * @property {number} fraud_percentage - Porcentaje de fraude
 * @property {number} analysis_time - Tiempo de análisis en segundos
 * @property {Array<Object>} results - Lista de transacciones con predicciones
 */

/**
 * ================================
 * FRAUD SERVICE API
 * ================================
 */

const fraudService = {
  /**
   * Analizar una transacción individual
   * @param {TransactionData} transactionData - Datos de la transacción
   * @returns {Promise<FraudPrediction>}
   * @throws {APIError}
   */
  async predictSingleTransaction(transactionData) {
    try {
      const result = await fraudeAPI.post('/predict_single_transaction', {
        monto: parseFloat(transactionData.monto),
        comerciante: transactionData.comerciante,
        ubicacion: transactionData.ubicacion,
        tipo_tarjeta: transactionData.tipo_tarjeta,
        horario_transaccion: transactionData.horario_transaccion,
      });
      
      return result;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Fraud API Error ${error.status}:`, error.statusText, error.data);
      }
      throw error;
    }
  },

  /**
   * Analizar todas las transacciones en la base de datos
   * @returns {Promise<DatabaseAnalysisResult>}
   * @throws {APIError}
   */
  async analyzeDatabase() {
    try {
      const result = await fraudeAPI.post('/analyze_database', {});
      return result;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Fraud DB Analysis Error ${error.status}:`, error.statusText, error.data);
      }
      throw error;
    }
  },

  /**
   * Health check del servicio de fraude
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    try {
      const result = await fraudeAPI.get('/health');
      return result;
    } catch (error) {
      console.warn('Fraud service health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  },

  /**
   * Formatear probabilidad de fraude como porcentaje
   * @param {number} probability - Probabilidad (0-1)
   * @returns {string}
   */
  formatProbability(probability) {
    if (probability === null || probability === undefined) return 'N/A';
    return `${(probability * 100).toFixed(1)}%`;
  },

  /**
   * Obtener color según nivel de riesgo
   * @param {string} level - Nivel de riesgo
   * @returns {string} - Clase CSS de color
   */
  getRiskColor(level) {
    const colors = {
      'ALTO': 'text-danger',
      'MEDIO': 'text-carbon-yellow-50',
      'BAJO': 'text-success',
    };
    return colors[level] || 'text-text-secondary';
  },

  /**
   * Obtener ícono según predicción
   * @param {string} prediction - "FRAUDE" o "NORMAL"
   * @returns {string}
   */
  getPredictionIcon(prediction) {
    return prediction === 'FRAUDE' ? '⚠️' : '✅';
  },
};

export default fraudService;
export { APIError };
