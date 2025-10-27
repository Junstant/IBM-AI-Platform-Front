import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

const LastUpdated = ({ timestamp, onRefresh, loading = false }) => {
  const formatTimestamp = (ts) => {
    if (!ts) return 'Nunca';
    
    const date = new Date(ts);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 10) return 'Ahora mismo';
    if (seconds < 60) return `Hace ${seconds}s`;
    if (minutes < 60) return `Hace ${minutes}m`;
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <Clock className="w-4 h-4" />
      <span>Última actualización: {formatTimestamp(timestamp)}</span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Actualizar ahora"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default LastUpdated;