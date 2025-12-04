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
  const [timeframe, setTimeframe] = useState('24h');
  const [funcionalidad, setFuncionalidad] = useState('all');
  const [metrics, setMetrics] = useState(null);
  const [services, setServices] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch múltiples endpoints en paralelo
      const [detailedMetrics, servicesData, recentErrors, functionalityPerf] = await Promise.all([
        statsService.getDetailedMetrics({ timeframe, funcionalidad }),
        statsService.getServicesStatus(),
        statsService.getRecentErrors(20),
        statsService.getFunctionalityPerformance()
      ]);

      setMetrics({
        ...detailedMetrics,
        by_functionality: functionalityPerf
      });
      setServices(servicesData);
      setErrors(recentErrors);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
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
      { header: 'Funcionalidad', key: 'functionality', width: 20 },
      { header: 'Total Requests', key: 'total_requests', width: 15 },
      { header: 'Éxito (%)', key: 'success_rate', width: 15 },
      { header: 'Error (%)', key: 'error_rate', width: 15 },
      { header: 'Tiempo Promedio (ms)', key: 'avg_response_time_ms', width: 20 },
      { header: 'Mediana (ms)', key: 'median_response_time_ms', width: 20 },
      { header: 'P95 (ms)', key: 'p95_response_time_ms', width: 20 },
    ];
    functionalitySheet.addRows(
      metrics.by_functionality?.map(f => ({
        functionality: getFunctionalityName(f?.functionality),
        total_requests: toNumber(f?.total_requests),
        success_rate: toNumber(f?.success_rate).toFixed(1),
        error_rate: toNumber(f?.error_rate).toFixed(1),
        avg_response_time_ms: toNumber(f?.avg_response_time_ms).toFixed(0),
        median_response_time_ms: toNumber(f?.median_response_time_ms).toFixed(0),
        p95_response_time_ms: toNumber(f?.p95_response_time_ms).toFixed(0)
      })) || []
    );

    // Hoja 3: Servicios
    if (services?.length > 0) {
      const servicesSheet = workbook.addWorksheet('Estado Servicios');
      servicesSheet.columns = [
        { header: 'Servicio', key: 'service', width: 30 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Total Requests', key: 'total_requests', width: 15 },
        { header: 'Éxito (%)', key: 'success_rate', width: 15 },
        { header: 'Latencia (ms)', key: 'latency', width: 15 },
      ];
      servicesSheet.addRows(
        services.map(s => ({
          service: s.display_name,
          type: s.service_type,
          status: s.status,
          total_requests: toNumber(s.total_requests),
          success_rate: s.total_requests > 0 
            ? ((s.successful_requests / s.total_requests) * 100).toFixed(1)
            : '0.0',
          latency: toNumber(s.avg_latency_ms).toFixed(0)
        }))
      );
    }

    // Hoja 4: Endpoints más lentos
    if (metrics.slowest_endpoints?.length > 0) {
      const slowestSheet = workbook.addWorksheet('Endpoints Lentos');
      slowestSheet.columns = [
        { header: 'Endpoint', key: 'endpoint', width: 40 },
        { header: 'Funcionalidad', key: 'functionality', width: 20 },
        { header: 'Requests', key: 'total_requests', width: 15 },
        { header: 'Tiempo Promedio (ms)', key: 'avg_response_time', width: 20 },
        { header: 'P95 (ms)', key: 'p95_response_time', width: 20 },
        { header: 'Máximo (ms)', key: 'max_response_time', width: 20 },
      ];
      slowestSheet.addRows(
        metrics.slowest_endpoints.map(e => ({
          endpoint: e?.endpoint_base || e?.endpoint || 'unknown',
          functionality: e?.functionality || 'unknown',
          total_requests: toNumber(e?.total_requests),
          avg_response_time: toNumber(e?.avg_response_time || e?.avg_response_time_ms).toFixed(0),
          p95_response_time: toNumber(e?.p95_response_time || e?.p95_response_time_ms).toFixed(0),
          max_response_time: toNumber(e?.max_response_time || e?.max_response_time_ms).toFixed(0)
        }))
      );
    }

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

      {/* Performance por Funcionalidad */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-05">
          <h2 className="text-xl font-semibold text-primary">Rendimiento por Funcionalidad (24h)</h2>
          <span className="text-xs text-secondary">Backend Stats API v2.0</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ui-02 border-b border-ui-03">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary">Funcionalidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Requests</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Éxito (%)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Tiempo Prom.</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Mediana (P50)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">P95</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.by_functionality?.length > 0 ? (
                metrics.by_functionality.map((func, index) => {
                  const successRate = toNumber(func?.success_rate);
                  return (
                    <tr key={index} className="border-b border-ui-02 hover:bg-ui-01">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getFunctionalityIcon(func?.functionality)}
                          <span className="text-primary font-medium">
                            {getFunctionalityName(func?.functionality)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary font-medium">
                        {toNumber(func?.total_requests).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-bold ${
                          successRate >= 95 ? 'text-success' : 
                          successRate >= 85 ? 'text-carbon-yellow-50' : 
                          'text-danger'
                        }`}>
                          {successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary">
                        {toNumber(func?.avg_response_time_ms).toFixed(0)}ms
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-secondary">
                        {toNumber(func?.median_response_time_ms).toFixed(0)}ms
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-secondary">
                        {toNumber(func?.p95_response_time_ms).toFixed(0)}ms
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary">
                    No hay datos de funcionalidades en las últimas 24h
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Estado de Servicios */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-05">
          <h2 className="text-xl font-semibold text-primary">Estado de Servicios</h2>
          <span className="text-xs text-success">
            {services?.filter(s => s.status === 'online')?.length || 0} / {services?.length || 0} activos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ui-02 border-b border-ui-03">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary">Servicio</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-primary">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Requests</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Éxito (%)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Latencia</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {services?.length > 0 ? (
                services.map((service, index) => {
                  const successRate = service.total_requests > 0 
                    ? ((service.successful_requests / service.total_requests) * 100).toFixed(1)
                    : '0.0';
                  const uptimeHours = Math.floor((service.uptime_seconds || 0) / 3600);
                  const uptimeMins = Math.floor(((service.uptime_seconds || 0) % 3600) / 60);

                  return (
                    <tr key={index} className="border-b border-ui-02 hover:bg-ui-01">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="text-primary font-medium">{service.display_name}</div>
                          <div className="text-xs text-secondary">{service.service_type}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          service.status === 'online' ? 'bg-success bg-opacity-10 text-success' :
                          service.status === 'degraded' ? 'bg-carbon-yellow-50 bg-opacity-10 text-carbon-yellow-50' :
                          'bg-danger bg-opacity-10 text-danger'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary">
                        {toNumber(service.total_requests).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-medium ${
                          parseFloat(successRate) >= 95 ? 'text-success' :
                          parseFloat(successRate) >= 85 ? 'text-carbon-yellow-50' :
                          'text-danger'
                        }`}>
                          {successRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary">
                        {toNumber(service.avg_latency_ms).toFixed(0)}ms
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-secondary">
                        {uptimeHours}h {uptimeMins}m
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary">
                    No hay servicios disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Endpoints y Errores Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-05">
        {/* Endpoints más usados */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-05">Endpoints Más Usados (24h)</h2>
          <div className="space-y-3">
            {metrics?.top_endpoints?.length > 0 ? (
              metrics.top_endpoints.slice(0, 10).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-ui-01 rounded hover:bg-ui-02 transition-colors">
                  <div className="flex-1 mr-3">
                    <p className="text-sm text-primary font-medium truncate">{endpoint?.endpoint_base || endpoint?.endpoint || 'Desconocido'}</p>
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

        {/* Errores Recientes */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-05">Errores Recientes</h2>
          <div className="space-y-2">
            {errors?.length > 0 ? (
              errors.slice(0, 10).map((error, index) => (
                <div key={index} className="p-3 bg-ui-01 rounded hover:bg-ui-02 transition-colors border-l-2 border-danger">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-danger">HTTP {error.status_code}</span>
                    <span className="text-xs text-secondary">
                      {new Date(error.timestamp).toLocaleTimeString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm text-primary font-medium truncate">{error.endpoint}</p>
                  <p className="text-xs text-secondary mt-1">{error.functionality || 'unknown'}</p>
                  {error.error_message && (
                    <p className="text-xs text-secondary mt-1 truncate">{error.error_message}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-success text-2xl mb-2">✓</div>
                <p className="text-secondary">No hay errores recientes</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Endpoints Más Lentos */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-05">Endpoints Más Lentos (24h)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ui-02 border-b border-ui-03">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary">Endpoint</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-primary">Funcionalidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Requests</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Tiempo Prom.</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">P95</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-primary">Máximo</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.slowest_endpoints?.length > 0 ? (
                metrics.slowest_endpoints.slice(0, 10).map((endpoint, index) => (
                  <tr key={index} className="border-b border-ui-02 hover:bg-ui-01">
                    <td className="px-4 py-3 text-sm text-primary font-mono truncate max-w-xs">
                      {endpoint?.endpoint_base || endpoint?.endpoint || 'Desconocido'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-ui-02 text-primary">
                        {endpoint?.functionality || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-primary">
                      {toNumber(endpoint?.total_requests).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="font-medium text-carbon-yellow-50">
                        {toNumber(endpoint?.avg_response_time || endpoint?.avg_response_time_ms).toFixed(0)}ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-carbon-yellow-50">
                      {toNumber(endpoint?.p95_response_time || endpoint?.p95_response_time_ms).toFixed(0)}ms
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="font-bold text-danger">
                        {toNumber(endpoint?.max_response_time || endpoint?.max_response_time_ms).toFixed(0)}ms
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumen Visual por Funcionalidad */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-05">Distribución de Requests por Funcionalidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics?.by_functionality?.length > 0 ? (
            metrics.by_functionality.map((functionality, index) => {
              const successRate = toNumber(functionality?.success_rate);
              const totalReqs = toNumber(functionality?.total_requests);
              return (
                <div 
                  key={functionality?.functionality || index}
                  className="bg-ui-01 border border-ui-03 p-4 hover:border-interactive transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFunctionalityIcon(functionality?.functionality)}
                      <h3 className="text-sm font-semibold text-primary">
                        {getFunctionalityName(functionality?.functionality)}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-primary">{totalReqs.toLocaleString()}</div>
                      <div className="text-xs text-secondary">Total Requests</div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary">Éxito:</span>
                      <span 
                        className={`font-bold ${
                          successRate >= 90 ? 'text-success' : 
                          successRate >= 70 ? 'text-carbon-yellow-50' : 
                          'text-danger'
                      }`}
                      >
                        {successRate.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary">Latencia:</span>
                      <span className="font-medium text-primary">
                        {toNumber(functionality?.avg_response_time_ms).toFixed(0)}ms
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary">P95:</span>
                      <span className="font-medium text-secondary">
                        {toNumber(functionality?.p95_response_time_ms).toFixed(0)}ms
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-secondary opacity-50" />
              <p className="text-secondary">
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
