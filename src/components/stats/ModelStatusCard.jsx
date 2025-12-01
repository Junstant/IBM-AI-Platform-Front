import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, Activity, Clock, Cpu, MemoryStick } from 'lucide-react';

const ModelStatusCard = ({ model, isAPI = false }) => {
  const getStatusIcon = () => {
    const status = model.status?.toLowerCase();
    switch (status) {
      case 'online':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
      case 'loading':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'offline':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    const status = model.status?.toLowerCase();
    switch (status) {
      case 'online':
      case 'active':
        return 'border-green-200 bg-green-50';
      case 'degraded':
      case 'loading':
        return 'border-yellow-200 bg-yellow-50';
      case 'offline':
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'maintenance':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getHealthStatus = () => {
    if (model.health_status === 'healthy') return 'text-green-600';
    if (model.health_status === 'stale') return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLastCheck = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours}h`;
  };

  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${getStatusColor()}`}>
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium text-gray-900">
              {model.display_name || model.model_name || model.service_name}
            </h3>
            <p className="text-xs text-gray-500">
              {isAPI ? `API ${model.metadata?.version || 'v1'}` : `${model.model_type || 'LLM'} • ${model.model_size || 'N/A'}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${getHealthStatus()}`}>
            {model.status}
          </span>
          {(model.port || model.metadata?.port) && (
            <p className="text-xs text-gray-400">:{model.port || model.metadata?.port}</p>
          )}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white bg-opacity-50 rounded p-2">
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600">Requests</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{model.total_requests || 0}</p>
          <p className="text-xs text-gray-500">
            {model.successful_requests && model.total_requests
              ? `${((model.successful_requests / model.total_requests) * 100).toFixed(1)}% éxito`
              : model.success_rate
              ? `${model.success_rate}% éxito`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-white bg-opacity-50 rounded p-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-600">Latencia</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {model.avg_latency_ms
              ? model.avg_latency_ms < 1000
                ? `${model.avg_latency_ms.toFixed(0)}ms`
                : `${(model.avg_latency_ms / 1000).toFixed(2)}s`
              : model.avg_response_time
              ? `${model.avg_response_time.toFixed(2)}s`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Recursos del sistema */}
      {(model.memory_usage_mb || model.cpu_usage_percent) && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {model.memory_usage_mb && (
            <div className="bg-white bg-opacity-50 rounded p-2">
              <div className="flex items-center space-x-1">
                <MemoryStick className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-600">Memoria</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{model.memory_usage_mb}MB</p>
            </div>
          )}

          {model.cpu_usage_percent && (
            <div className="bg-white bg-opacity-50 rounded p-2">
              <div className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-gray-600">CPU</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{model.cpu_usage_percent}%</p>
            </div>
          )}
        </div>
      )}

      {/* Footer con información adicional */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>Uptime: {formatUptime(model.uptime_seconds)}</span>
        <span>Check: {formatLastCheck(model.last_health_check)}</span>
      </div>
    </div>
  );
};

export default ModelStatusCard;