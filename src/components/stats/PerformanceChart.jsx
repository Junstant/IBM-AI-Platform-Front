import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PerformanceChart = ({ data, title, type = 'line', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const formatTooltipValue = (value, name) => {
    if (name.includes('time') || name.includes('respuesta')) {
      return [`${value.toFixed(3)}s`, name];
    }
    if (name.includes('count') || name.includes('requests')) {
      return [value.toLocaleString(), name];
    }
    if (name.includes('percent') || name.includes('rate')) {
      return [`${value.toFixed(1)}%`, name];
    }
    return [value, name];
  };

  const formatXAxisLabel = (value) => {
    if (typeof value === 'string' && value.includes('T')) {
      // Formato de fecha ISO
      const date = new Date(value);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {typeof label === 'string' && label.includes('T') 
              ? new Date(label).toLocaleString('es-ES')
              : label
            }
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {formatTooltipValue(entry.value, entry.name)[1]}: {formatTooltipValue(entry.value, entry.name)[0]}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (type === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
              tickFormatter={formatXAxisLabel}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="avg_response_time" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="request_count" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={formatXAxisLabel}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="avg_response_time" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="request_count" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
          {data[0]?.error_count !== undefined && (
            <Line 
              type="monotone" 
              dataKey="error_count" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Tiempo respuesta</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Requests</span>
          </div>
          {data[0]?.error_count !== undefined && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Errores</span>
            </div>
          )}
        </div>
      </div>
      {renderChart()}
    </div>
  );
};

export default PerformanceChart;