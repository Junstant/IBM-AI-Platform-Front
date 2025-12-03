import { useState, useEffect, useCallback } from 'react';
import { statsAPI, APIError } from '../utils/apiClient';
import config from '../config/environment';

/**
 * Hook para Dashboard Summary
 * Endpoint: GET /api/stats/dashboard/summary
 */
export const useDashboardSummary = (refreshInterval = config.ui.refreshIntervals.dashboardSummary) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching dashboard summary from /api/stats/dashboard/summary...');
      const result = await statsAPI.get('/dashboard/summary');
      console.log('✅ Dashboard summary received:', result);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ Error fetching dashboard summary:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
};

/**
 * Hook para Models Status (solo LLMs)
 * Endpoint: GET /api/stats/services/status (filtrado)
 */
export const useModelsStatus = (refreshInterval = config.ui.refreshIntervals.modelsStatus) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get('/services/status');
      const services = Array.isArray(result) ? result : [];
      setData(services.filter(s => s.service_type === 'llm'));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching models status:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
};

/**
 * Hook para Services Status (todos los servicios)
 * Endpoint: GET /api/stats/services/status
 */
export const useServicesStatus = (refreshInterval = config.ui.refreshIntervals.modelsStatus) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get('/services/status');
      setData(Array.isArray(result) ? result : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching services status:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
};

/**
 * Hook para Alertas
 * Endpoint: GET /api/stats/alerts/active
 */
export const useAlerts = (refreshInterval = config.ui.refreshIntervals.alerts) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get('/alerts/active');
      setData(Array.isArray(result) ? result : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching alerts:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId, resolvedBy = 'admin') => {
    try {
      await statsAPI.post(`/admin/resolve-alert/${alertId}?resolved_by=${resolvedBy}`);
      await refresh();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh, resolveAlert, lastUpdated };
};

/**
 * Hook para Actividad Reciente
 * Endpoint: GET /api/stats/activity/recent
 */
export const useRecentActivity = (limit = 20, refreshInterval = config.ui.refreshIntervals.alerts) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get(`/activity/recent?limit=${limit}`);
      setData(Array.isArray(result) ? result : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
};

/**
 * Hook para Top Endpoints
 * Endpoint: GET /api/stats/performance/top-endpoints
 */
export const useTopEndpoints = (limit = 10, worst = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get(`/performance/top-endpoints?limit=${limit}&worst=${worst}`);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching top endpoints:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, worst]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

/**
 * Hook para Métricas Globales
 * Endpoint: GET /api/stats/metrics/global
 */
export const useGlobalMetrics = (startDate, endDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get(`/metrics/global?start_date=${startDate}&end_date=${endDate}`);
      setData(result);
    } catch (err) {
      console.error('Error fetching global metrics:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

/**
 * Hook para Tendencias por Hora
 * Endpoint: GET /api/stats/trends/hourly
 */
export const useHourlyTrends = (startDate, endDate, service = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      if (service) params.append('service', service);
      const result = await statsAPI.get(`/trends/hourly?${params}`);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching hourly trends:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

/**
 * Hook para Recursos del Sistema
 * Endpoint: GET /api/stats/system/resources
 */
export const useSystemResources = (refreshInterval = config.ui.refreshIntervals.systemResources) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await statsAPI.get('/system/resources');
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching system resources:', err);
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
};
