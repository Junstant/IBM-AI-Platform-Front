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
        const result = await fetchData('/models-status');
        setData(result);
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
        const result = await fetchData('/functionality/performance');
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
  const useRecentErrors = (limit = 20) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/errors/recent?limit=${limit}`);
        setData(result?.errors || []);
      } catch (err) {
        console.error('Error fetching recent errors:', err);
      }
    }, [limit]);

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
        const result = await fetchData(`/trends/hourly?hours=${hours}`);
        setData(result?.data || []);
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

  // Hook para alertas
  const useAlerts = (refreshInterval = config.ui.refreshIntervals.alerts) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/alerts/active');
        setData(result?.alerts || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    }, []);

    const resolveAlert = useCallback(async (alertId) => {
      try {
        await statsAPI.post(`/alerts/${alertId}/resolve`, {});
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
  const useRecentActivity = (limit = 10, refreshInterval = config.ui.refreshIntervals.alerts) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData(`/activity/recent?limit=${limit}`);
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
    const [data, setData] = useState({ llm_models: [], api_endpoints: [] });

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/services/status');
        setData(result || { llm_models: [], api_endpoints: [] });
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