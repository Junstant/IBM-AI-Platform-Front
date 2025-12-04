import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, AlertCircle, Download, RefreshCw, Filter, Bot, Shield, Database, FileText, Brain } from 'lucide-react';
import { Card } from '../components/carbon';
import statsService from '../services/statsService';
import * as XLSX from 'exceljs';

// 🔧 FUNCIONES HELPER
const getFunctionalityIcon = (funcionalidad) => {
  const iconMap = {
    'chatbot': <Bot className="w-5 h-5 text-interactive" />,
    'fraud_detection': <Shield className="w-5 h-5 text-danger" />,
    'text_to_sql': <Database className="w-5 h-5 text-success" />,
    'rag_documents': <FileText className="w-5 h-5 text-carbon-blue-70" />,
    'nlp_analysis': <Brain className="w-5 h-5 text-carbon-purple-50" />,
    'unknown': <Activity className="w-5 h-5 text-secondary" />,
  };
  return iconMap[funcionalidad] || iconMap['unknown'];
};

const getFunctionalityName = (funcionalidad) => {
  const nameMap = {
    'chatbot': 'Chatbot LLM',
    'fraud_detection': 'Detección de Fraude',
    'text_to_sql': 'Text-to-SQL',
    'rag_documents': 'RAG Documentos',
    'nlp_analysis': 'Análisis NLP',
    'unknown': 'Desconocido',
  };
  return nameMap[funcionalidad] || nameMap['unknown'];
};

// 🔧 FUNCIÓN PARA CONVERTIR A NÚMERO DE FORMA SEGURA
const toNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

const MetricsPage = () => {
  const [timeframe, setTimeframe] = useState('today');
  const [funcionalidad, setFuncionalidad] = useState('all');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getDetailedMetrics({ timeframe, funcionalidad });
      setMetrics(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, funcionalidad]);

  const downloadExcel = async () => {
    if (!metrics || !metrics.summary) return;

    const workbook = new XLSX.Workbook();
    
    // Hoja 1: Resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 }
    ];
    summarySheet.addRows([
      { metric: 'Total de Requests', value: toNumber(metrics.summary?.total_requests) },
      { metric: 'Requests Exitosos', value: toNumber(metrics.summary?.successful_requests) },
      { metric: 'Requests Fallidos', value: toNumber(metrics.summary?.failed_requests) },
      { metric: 'Tasa de Éxito', value: `${toNumber(metrics.summary?.success_rate).toFixed(1)}%` },
      { metric: 'Tiempo Promedio (ms)', value: toNumber(metrics.summary?.avg_response_time_ms) },
      { metric: 'Mediana (ms)', value: toNumber(metrics.summary?.median_response_time_ms) },
      { metric: 'P95 (ms)', value: toNumber(metrics.summary?.p95_response_time_ms) },
      { metric: 'P99 (ms)', value: toNumber(metrics.summary?.p99_response_time_ms) },
    ]);

    // Hoja 2: Por Funcionalidad
    const functionalitySheet = workbook.addWorksheet('Por Funcionalidad');
    functionalitySheet.columns = [
      { header: 'Funcionalidad', key: 'funcionalidad', width: 20 },
      { header: 'Requests', key: 'requests', width: 15 },
      { header: 'Éxito (%)', key: 'success_rate', width: 15 },
      { header: 'Tiempo Promedio (ms)', key: 'avg_response_time', width: 20 },
      { header: 'Errores', key: 'errors', width: 15 },
    ];
    functionalitySheet.addRows(
      metrics.by_functionality?.map(f => ({
        funcionalidad: f?.funcionalidad || 'unknown',
        requests: toNumber(f?.requests),
        success_rate: toNumber(f?.success_rate),
        avg_response_time: toNumber(f?.avg_response_time_ms),
        errors: toNumber(f?.total_errors)
      })) || []
    );

    // Hoja 3: Endpoints más lentos
    const slowestSheet = workbook.addWorksheet('Endpoints Lentos');
    slowestSheet.columns = [
      { header: 'Endpoint', key: 'endpoint', width: 40 },
      { header: 'Tiempo Promedio (ms)', key: 'avg_response_time', width: 20 },
      { header: 'P95 (ms)', key: 'p95_response_time', width: 20 },
    ];
    slowestSheet.addRows(
      metrics.slowest_endpoints?.map(e => ({
        endpoint: e?.endpoint || 'unknown',
        avg_response_time: toNumber(e?.avg_response_time_ms),
        p95_response_time: toNumber(e?.p95_response_time_ms)
      })) || []
    );

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics_${timeframe}_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-interactive animate-spin" />
          <p className="text-secondary">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-danger" />
          <p className="text-danger font-medium mb-2">Error al cargar métricas</p>
          <p className="text-secondary">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-interactive text-white rounded hover:bg-carbon-blue-70"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-06 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between animate-slideDown">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-02">Métricas Detalladas</h1>
          <p className="text-secondary">
            Análisis completo de rendimiento y uso del sistema
            {metrics?.period && ` • ${new Date(metrics.period.start).toLocaleDateString()} - ${new Date(metrics.period.end).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-ui-04 rounded hover:bg-ui-02 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-interactive text-white rounded hover:bg-carbon-blue-70 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Card padding="md">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-secondary" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeframe */}
            <div>
              <label className="block text-sm text-secondary mb-2">Período de Tiempo</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-ui-04 rounded focus:outline-none focus:border-interactive"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Funcionalidad */}
            <div>
              <label className="block text-sm text-secondary mb-2">Funcionalidad</label>
              <select
                value={funcionalidad}
                onChange={(e) => setFuncionalidad(e.target.value)}
                className="w-full px-3 py-2 border border-ui-04 rounded focus:outline-none focus:border-interactive"
              >
                <option value="all">Todas</option>
                <option value="chatbot">Chatbot</option>
                <option value="fraud_detection">Detección de Fraude</option>
                <option value="text_to_sql">Text-to-SQL</option>
                <option value="rag_documents">RAG Documentos</option>
                <option value="nlp_analysis">Análisis NLP</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-05">
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-interactive" />
            <span className="text-xs text-success">
              {toNumber(metrics?.summary?.success_rate).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-1">
            {toNumber(metrics?.summary?.total_requests).toLocaleString()}
          </h3>
          <p className="text-sm text-secondary">Total Requests</p>
          <p className="text-xs text-secondary mt-1">
            {toNumber(metrics?.summary?.successful_requests).toLocaleString()} exitosos •{' '}
            {toNumber(metrics?.summary?.failed_requests).toLocaleString()} fallidos
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-success" />
            <span className="text-xs text-secondary">Promedio</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-1">
            {toNumber(metrics?.summary?.avg_response_time_ms).toFixed(0)}ms
          </h3>
          <p className="text-sm text-secondary">Tiempo de Respuesta</p>
          <p className="text-xs text-secondary mt-1">
            Mediana: {toNumber(metrics?.summary?.median_response_time_ms).toFixed(0)}ms
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-carbon-blue-70" />
            <span className="text-xs text-secondary">P95</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-1">
            {toNumber(metrics?.summary?.p95_response_time_ms).toFixed(0)}ms
          </h3>
          <p className="text-sm text-secondary">Percentil 95</p>
          <p className="text-xs text-secondary mt-1">
            P99: {toNumber(metrics?.summary?.p99_response_time_ms).toFixed(0)}ms
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-danger" />
            <span className="text-xs text-danger">
              {metrics?.summary?.failed_requests && metrics?.summary?.total_requests
                ? `${((toNumber(metrics.summary.failed_requests) / toNumber(metrics.summary.total_requests)) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-1">
            {toNumber(metrics?.summary?.failed_requests).toLocaleString()}
          </h3>
          <p className="text-sm text-secondary">Errores</p>
          <p className="text-xs text-secondary mt-1">
            {toNumber(metrics?.summary?.total_data_transferred_mb).toFixed(1)}MB transferidos
          </p>
        </Card>
      </div>

      {/* Por Funcionalidad */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-05">Rendimiento por Funcionalidad</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ui-02 border-b border-ui-03">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary">Funcionalidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Requests</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Éxito (%)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Tiempo Prom.</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Errores</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.by_functionality?.length > 0 ? (
                metrics.by_functionality.map((func, index) => {
                  const successRate = toNumber(func?.success_rate);
                  return (
                    <tr key={index} className="border-b border-ui-02 hover:bg-ui-01">
                      <td className="px-4 py-3 text-sm text-primary font-medium">
                        {func?.funcionalidad || 'Desconocido'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary">
                        {toNumber(func?.requests).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-medium ${
                          successRate >= 95 ? 'text-success' : 
                          successRate >= 90 ? 'text-carbon-yellow-50' : 
                          'text-danger'
                        }`}>
                          {successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary">
                        {toNumber(func?.avg_response_time_ms).toFixed(0)}ms
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-medium ${toNumber(func?.total_errors) > 0 ? 'text-danger' : 'text-success'}`}>
                          {toNumber(func?.total_errors)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-secondary">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribución por Status Code */}
      {metrics?.by_status_code && Object.keys(metrics.by_status_code).length > 0 && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-05">Distribución por Código de Estado</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(metrics.by_status_code).map(([code, count]) => (
              <div key={code} className="bg-ui-01 rounded p-4 text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  code.startsWith('2') ? 'text-success' :
                  code.startsWith('4') ? 'text-carbon-yellow-50' :
                  code.startsWith('5') ? 'text-danger' : 'text-primary'
                }`}>
                  {count}
                </div>
                <div className="text-sm text-secondary">HTTP {code}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-05">
        {/* Endpoints más usados */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-05">Endpoints Más Usados</h2>
          <div className="space-y-3">
            {metrics?.top_endpoints?.length > 0 ? (
              metrics.top_endpoints.slice(0, 5).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-ui-01 rounded">
                  <div className="flex-1 mr-3">
                    <p className="text-sm text-primary font-medium truncate">{endpoint?.endpoint || 'Desconocido'}</p>
                    <p className="text-xs text-secondary">
                      {toNumber(endpoint?.requests)} requests • {toNumber(endpoint?.success_rate).toFixed(1)}% éxito
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {toNumber(endpoint?.avg_response_time_ms).toFixed(0)}ms
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </Card>

        {/* Endpoints más lentos */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-05">Endpoints Más Lentos</h2>
          <div className="space-y-3">
            {metrics?.slowest_endpoints?.length > 0 ? (
              metrics.slowest_endpoints.slice(0, 5).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-ui-01 rounded">
                  <div className="flex-1 mr-3">
                    <p className="text-sm text-primary font-medium truncate">{endpoint?.endpoint || 'Desconocido'}</p>
                    <p className="text-xs text-secondary">
                      P95: {toNumber(endpoint?.p95_response_time_ms).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-danger">
                      {toNumber(endpoint?.avg_response_time_ms).toFixed(0)}ms
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </Card>
      </div>

      {/* Rendimiento por Funcionalidad - Detalle */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-05">Rendimiento por Funcionalidad - Detalle</h2>
        <div className="grid grid-cols-1 gap-4">
          {metrics?.by_functionality?.length > 0 ? (
            metrics.by_functionality.map((functionality, index) => {
              const successRate = toNumber(functionality?.success_rate);
              return (
                <div 
                  key={functionality?.funcionalidad || index}
                  className="bg-ui-01 border border-ui-03 p-04 hover:border-interactive transition-all duration-300 animate-slide-in-up group"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-03">
                    <div className="flex items-center space-x-02">
                      <div className="p-02 bg-interactive/10 rounded-sm group-hover:bg-interactive/20 transition-colors">
                        {getFunctionalityIcon(functionality?.funcionalidad || 'unknown')}
                      </div>
                      <h3 className="text-label font-semibold text-text-primary">
                        {getFunctionalityName(functionality?.funcionalidad || 'unknown')}
                      </h3>
                    </div>
                    
                    <span 
                      className={`px-03 py-01 text-white text-caption font-medium rounded-sm shadow-sm ${
                        successRate >= 90 
                          ? 'bg-success' 
                          : successRate >= 70 
                            ? 'bg-warning' 
                            : 'bg-danger'
                      }`}
                    >
                      {successRate.toFixed(1)}% éxito
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-03">
                    <div className="text-center">
                      <p className="text-caption text-text-secondary mb-01">Requests</p>
                      <p className="text-productive-heading-02 text-text-primary group-hover:text-interactive transition-colors">
                        {toNumber(functionality?.requests)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-caption text-text-secondary mb-01">Latencia</p>
                      <p className="text-productive-heading-02 text-text-primary group-hover:text-interactive transition-colors">
                        {toNumber(functionality?.avg_response_time_ms).toFixed(0)}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-caption text-text-secondary mb-01">Errores</p>
                      <p className="text-productive-heading-02 text-danger">
                        {toNumber(functionality?.total_errors)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-03">
                    <div className="h-2 bg-ui-03 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          successRate >= 90 
                            ? 'bg-success' 
                            : successRate >= 70 
                              ? 'bg-warning' 
                              : 'bg-danger'
                        }`}
                        style={{ width: `${successRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-08">
              <Activity className="w-12 h-12 mx-auto mb-4 text-secondary opacity-50" />
              <p className="text-caption text-text-secondary">
                No hay datos de funcionalidades disponibles
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MetricsPage;
