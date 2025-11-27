import { useState, useEffect, useCallback } from 'react';
import { statsAPI, APIError } from '../utils/apiClient';

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
  const useDashboardSummary = (refreshInterval = 30000) => {
    const [data, setData] = useState(null);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/dashboard-summary');
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
  const useModelsStatus = (refreshInterval = 30000) => {
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
        const result = await fetchData('/functionality-performance');
        setData(result);
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
  const useRecentErrors = () => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/recent-errors');
        setData(result);
      } catch (err) {
        console.error('Error fetching recent errors:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para tendencias por hora
  const useHourlyTrends = () => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/hourly-trends');
        setData(result);
      } catch (err) {
        console.error('Error fetching hourly trends:', err);
      }
    }, []);

    useEffect(() => {
      refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
  };

  // Hook para recursos del sistema
  const useSystemResources = (refreshInterval = 30000) => {
    const [data, setData] = useState(null);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/system-resources');
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
  const useAlerts = (refreshInterval = 10000) => {
    const [data, setData] = useState([]);

    const refresh = useCallback(async () => {
      try {
        const result = await fetchData('/alerts');
        setData(result);
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

  return {
    useDashboardSummary,
    useModelsStatus,
    useFunctionalityPerformance,
    useRecentErrors,
    useHourlyTrends,
    useSystemResources,
    useAlerts,
    fetchData,
    loading,
    error,
    lastUpdated
  };
};