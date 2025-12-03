import { useState, useEffect, useCallback } from 'react';
import { statsAPI, APIError } from '../utils/apiClient';
import config from '../config/environment';

export const useStatsAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await statsAPI.get(endpoint);
      setLastUpdated(new Date());
      return data;
    } catch (err) {
      if (err instanceof APIError) {
        setError(`HTTP ${err.status}: ${err.statusText}`);
      } else {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook específico para dashboard summary
  const useDashboardSummary = (refreshInterval = config.ui.refreshIntervals.dashboardSummary) => {
    const [data, setData] = useState(null);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/dashboard/summary');
        setData(result);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }, [refresh, refreshInterval]);

    return { data, loading, error, refresh, lastUpdated };
  };

  // Hook para modelos status
  const useModelsStatus = (refreshInterval = config.ui.refreshIntervals.modelsStatus) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/services/status');
        // Backend retorna array de servicios, filtrar solo LLMs
        const services = Array.isArray(result) ? result : [];
        setData(services.filter(s => s.service_type === 'llm'));
      } catch (err) {
        console.error('Error fetching models status:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }, [refresh, refreshInterval]);

    return { data, loading, error, refresh, lastUpdated };
  };

  // Hook para top endpoints (performance)
  const useTopEndpoints = (limit = 10, worst = false) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/v2/performance/top-endpoints?limit=${limit}&worst=${worst}`);
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching top endpoints:', err);
      }
    }, [limit, worst]);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para métricas globales
  const useGlobalMetrics = (startDate, endDate) => {
    const [data, setData] = useState(null);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/v2/metrics/global?start_date=${startDate}&end_date=${endDate}`);
        setData(result);
      } catch (err) {
        console.error('Error fetching global metrics:', err);
      }
    }, [startDate, endDate]);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para tendencias por hora (v2)
  const useHourlyTrends = (startDate, endDate, service = null) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
        if (service) params.append('service', service);
        const result = await fetchData(`/v2/trends/hourly?${params}`);
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching hourly trends:', err);
      }
    }, [startDate, endDate, service]);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para recursos del sistema
  const useSystemResources = (refreshInterval = config.ui.refreshIntervals.systemResources) => {
    const [data, setData] = useState(null);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/system/resources');
        setData(result);
      } catch (err) {
        console.error('Error fetching system resources:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }, [refresh, refreshInterval]);

    return { data, loading, error, refresh, lastUpdated };
  };

  // Hook para alertas (v2 endpoint)
  const useAlerts = (refreshInterval = config.ui.refreshIntervals.alerts) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/v2/alerts/active');
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
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

  // ✨ Hook para actividad reciente (v2 endpoint)
  const useRecentActivity = (limit = 20, refreshInterval = config.ui.refreshIntervals.alerts) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/v2/activity/recent?limit=${limit}`);
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      }
    }, [limit]);

    useEffect(() => {
      refresh();
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }, [refresh, refreshInterval]);

    return { data, loading, error, refresh, lastUpdated };
  };

  // ✨ Hook para servicios (modelos + APIs) - retorna array
  const useServicesStatus = (refreshInterval = config.ui.refreshIntervals.modelsStatus) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/services/status');
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching services status:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }, [refresh, refreshInterval]);

    return { data, loading, error, refresh, lastUpdated };
  };

  return {
    useDashboardSummary,
    useModelsStatus,
    useTopEndpoints,
    useGlobalMetrics,
    useHourlyTrends,
    useSystemResources,
    useAlerts,
    useRecentActivity,
    useServicesStatus,
    fetchData,
    loading,
    error,
    lastUpdated
  };
};