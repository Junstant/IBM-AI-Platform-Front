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
        const result = await fetchData('/v2/dashboard-summary');
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
        const result = await fetchData('/v2/services-status');
        // Backend v2 retorna { services: [] }, filtrar por tipo LLM
        const services = result?.services || [];
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

  // Hook para performance por funcionalidad
  const useFunctionalityPerformance = () => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/v2/functionality-performance');
        setData(result?.functionalities || []);
      } catch (err) {
        console.error('Error fetching functionality performance:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para errores recientes
  const useRecentErrors = (hours = 24, limit = 50) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/v2/recent-errors?hours=${hours}&limit=${limit}`);
        setData(result?.errors || []);
      } catch (err) {
        console.error('Error fetching recent errors:', err);
      }
    }, [hours, limit]);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para tendencias por hora
  const useHourlyTrends = (hours = 24) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/v2/hourly-trends?hours=${hours}`);
        setData(result?.trends || []);
      } catch (err) {
        console.error('Error fetching hourly trends:', err);
      }
    }, [hours]);

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
        const result = await fetchData('/v2/system-resources');
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

  // Hook para alertas
  const useAlerts = (refreshInterval = config.ui.refreshIntervals.alerts) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/v2/active-alerts');
        setData(result?.alerts || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    }, []);

    const resolveAlert = useCallback(async (alertId, resolvedBy = 'system') => {
      try {
        await statsAPI.post(`/v2/resolve-alert/${alertId}`, { resolved_by: resolvedBy });
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

  // ✨ NUEVO: Hook para actividad reciente
  const useRecentActivity = (limit = 100, refreshInterval = config.ui.refreshIntervals.alerts) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/v2/activity-log?limit=${limit}`);
        setData(result?.activities || []);
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

  // ✨ NUEVO: Hook para servicios (modelos + APIs)
  const useServicesStatus = (refreshInterval = config.ui.refreshIntervals.modelsStatus) => {
    const [data, setData] = useState({ services: [] });

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/v2/services-status');
        setData(result || { services: [] });
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
    useFunctionalityPerformance,
    useRecentErrors,
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