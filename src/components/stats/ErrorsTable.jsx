import React, { useState } from 'react';
import { AlertTriangle, Clock, Activity, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const ErrorsTable = ({ data, title = "Errores Recientes" }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterType, setFilterType] = useState('all');
  const [filterFunctionality, setFilterFunctionality] = useState('all');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>¡Sin errores! Todo funcionando correctamente</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    let filteredData = [...data];

    // Filtrar por tipo de error
    if (filterType !== 'all') {
      filteredData = filteredData.filter(error => error.error_type === filterType);
    }

    // Filtrar por funcionalidad
    if (filterFunctionality !== 'all') {
      filteredData = filteredData.filter(error => error.functionality === filterFunctionality);
    }

    // Ordenar
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const getErrorTypeColor = (errorType) => {
    switch (errorType) {
      case 'timeout':
        return 'bg-orange-100 text-orange-800';
      case 'model_error':
        return 'bg-red-100 text-red-800';
      case 'database_error':
        return 'bg-purple-100 text-purple-800';
      case 'validation_error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFunctionalityColor = (functionality) => {
    switch (functionality) {
      case 'textosql':
        return 'bg-blue-100 text-blue-800';
      case 'fraud-detection':
        return 'bg-green-100 text-green-800';
      case 'chatbot':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastOccurrence = (timestamp) => {
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

  const SortableHeader = ({ children, sortKey }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
          <ChevronUp className="w-4 h-4" /> : 
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const errorTypes = [...new Set(data.map(error => error.error_type))];
  const functionalities = [...new Set(data.map(error => error.functionality))];
  const sortedData = getSortedData();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4">
            {/* Filtros */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Todos los tipos</option>
                {errorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filterFunctionality}
                onChange={(e) => setFilterFunctionality(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Todas las funcionalidades</option>
                {functionalities.map(func => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>
            </div>
            <span className="text-sm text-gray-500">
              {sortedData.length} errores
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader sortKey="error_type">Tipo de Error</SortableHeader>
              <SortableHeader sortKey="functionality">Funcionalidad</SortableHeader>
              <SortableHeader sortKey="endpoint">Endpoint</SortableHeader>
              <SortableHeader sortKey="error_count">Ocurrencias</SortableHeader>
              <SortableHeader sortKey="avg_response_time">Tiempo Resp.</SortableHeader>
              <SortableHeader sortKey="last_occurrence">Última Vez</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((error, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getErrorTypeColor(error.error_type)}`}>
                    {error.error_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFunctionalityColor(error.functionality)}`}>
                    {error.functionality}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {error.endpoint}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">{error.error_count}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {error.avg_response_time ? `${error.avg_response_time.toFixed(2)}s` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{formatLastOccurrence(error.last_occurrence)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorsTable;