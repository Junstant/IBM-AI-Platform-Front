import React from 'react';
import { Activity, Clock, CheckCircle, XCircle, TrendingUp, Database, Bot, Shield } from 'lucide-react';

const FunctionalityMetrics = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas por Funcionalidad</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const getFunctionalityIcon = (functionality) => {
    switch (functionality) {
      case 'textosql':
        return <Database className="w-6 h-6 text-blue-500" />;
      case 'fraud-detection':
        return <Shield className="w-6 h-6 text-green-500" />;
      case 'chatbot':
        return <Bot className="w-6 h-6 text-purple-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFunctionalityColor = (functionality) => {
    switch (functionality) {
      case 'textosql':
        return 'border-blue-200 bg-blue-50';
      case 'fraud-detection':
        return 'border-green-200 bg-green-50';
      case 'chatbot':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getFunctionalityName = (functionality) => {
    switch (functionality) {
      case 'textosql':
        return 'Text-to-SQL';
      case 'fraud-detection':
        return 'Detección de Fraude';
      case 'chatbot':
        return 'Chatbot IA';
      default:
        return functionality;
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (time) => {
    if (time <= 1) return 'text-green-600';
    if (time <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Métricas por Funcionalidad</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((functionality) => {
          // ⚠️ Validación defensiva: asegurar que functionality existe y tiene datos
          if (!functionality) return null;
          
          return (<div 
            key={functionality.functionality} 
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${getFunctionalityColor(functionality.functionality)}`}
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              {getFunctionalityIcon(functionality.functionality)}
              <div>
                <h4 className="font-medium text-gray-900">
                  {getFunctionalityName(functionality.functionality)}
                </h4>
                <p className="text-xs text-gray-500">
                  {functionality.first_date === functionality.last_date ? 
                    `Hoy` : 
                    `${functionality.first_date} - ${functionality.last_date}`
                  }
                </p>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Total de consultas */}
              <div className="bg-white bg-opacity-60 rounded p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Total</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(functionality.total_queries)}
                </p>
                <p className="text-xs text-gray-500">consultas</p>
              </div>

              {/* Tiempo de respuesta */}
              <div className="bg-white bg-opacity-60 rounded p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Respuesta</span>
                </div>
                <p className={`text-lg font-semibold ${getResponseTimeColor(functionality.avg_response_time)}`}>
                  {functionality.avg_response_time ? `${functionality.avg_response_time.toFixed(2)}s` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">promedio</p>
              </div>
            </div>

            {/* Métricas de éxito/error */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Consultas exitosas */}
              <div className="bg-white bg-opacity-60 rounded p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Exitosas</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatNumber(functionality.successful_queries)}
                </p>
                <p className="text-xs text-gray-500">requests</p>
              </div>

              {/* Consultas fallidas */}
              <div className="bg-white bg-opacity-60 rounded p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-gray-600">Fallidas</span>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatNumber(functionality.failed_queries)}
                </p>
                <p className="text-xs text-gray-500">requests</p>
              </div>
            </div>

            {/* Tasa de éxito */}
            <div className="bg-white bg-opacity-60 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Tasa de Éxito</span>
                </div>
                <span className={`text-sm font-semibold ${getSuccessRateColor(functionality?.success_rate || 0)}`}>
                  {functionality?.success_rate ? `${functionality.success_rate.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (functionality?.success_rate || 0) >= 95 ? 'bg-green-500' :
                    (functionality?.success_rate || 0) >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${functionality?.success_rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default FunctionalityMetrics;