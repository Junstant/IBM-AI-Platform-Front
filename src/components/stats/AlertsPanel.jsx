import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, Info, Clock, X, Check } from 'lucide-react';

const AlertsPanel = ({ alerts, onResolveAlert, showAll = false, maxAlerts = 5 }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas del Sistema</h3>
        <div className="flex items-center justify-center h-20 text-gray-500">
          <div className="text-center">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Sin alertas activas</p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (alertType, severity) => {
    if (severity >= 4) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    switch (alertType) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (alertType, severity) => {
    if (severity >= 4) {
      return 'border-red-200 bg-red-50';
    }
    switch (alertType) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-300 bg-red-100';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityBadge = (severity) => {
    if (severity >= 4) {
      return <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">Crítico</span>;
    }
    if (severity >= 3) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">Alto</span>;
    }
    if (severity >= 2) {
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">Medio</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">Bajo</span>;
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  const getComponentIcon = (component) => {
    // Retorna un emoji o texto simple para el componente
    switch (component) {
      case 'model':
        return '🤖';
      case 'api':
        return '🔗';
      case 'database':
        return '🗄️';
      case 'system':
        return '⚙️';
      default:
        return '📊';
    }
  };

  // Filtrar y ordenar alertas
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const sortedAlerts = activeAlerts.sort((a, b) => {
    // Ordenar por severidad (mayor primero) y luego por fecha (más reciente primero)
    if (a.severity !== b.severity) {
      return b.severity - a.severity;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const displayAlerts = showAll ? sortedAlerts : sortedAlerts.slice(0, maxAlerts);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Alertas del Sistema</h3>
          <div className="flex items-center space-x-2">
            {activeAlerts.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeAlerts.length} activas
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {displayAlerts.map((alert) => (
          <div key={alert.id} className={`p-4 transition-all hover:bg-gray-50 ${getAlertColor(alert.alert_type, alert.severity)}`}>
            <div className="flex items-start space-x-3">
              {/* Icono de alerta */}
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.alert_type, alert.severity)}
              </div>

              {/* Contenido de la alerta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  {onResolveAlert && (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Marcar como resuelto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">{alert.message}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span>{getComponentIcon(alert.component)}</span>
                      <span>{alert.component_name || alert.component}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(alert.created_at)}</span>
                    </span>
                  </div>
                </div>

                {/* Metadata adicional si existe */}
                {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <details className="cursor-pointer">
                      <summary>Ver detalles</summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(alert.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Mostrar más alertas si hay */}
        {!showAll && activeAlerts.length > maxAlerts && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              Y {activeAlerts.length - maxAlerts} alertas más...
            </p>
          </div>
        )}

        {/* Mensaje cuando no hay alertas */}
        {displayAlerts.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Todas las alertas han sido resueltas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;