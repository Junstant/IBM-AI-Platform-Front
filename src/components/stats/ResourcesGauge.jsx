import React from 'react';
import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react';

const ResourcesGauge = ({ data }) => {
  // eslint-disable-next-line no-unused-vars
  const GaugeComponent = ({ title, value, icon: IconComponent, color, unit = '%' }) => {
    const percentage = Math.min(Math.max(value || 0, 0), 100);
    
    // Mapeo de colores a valores hexadecimales
    const colorMap = {
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#a855f7',
      orange: '#f97316',
      red: '#ef4444',
      yellow: '#eab308'
    };

    const getColorClass = () => {
      if (percentage >= 90) return 'text-red-500 border-red-500';
      if (percentage >= 70) return 'text-yellow-500 border-yellow-500';
      return `text-${color}-500 border-${color}-500`;
    };

    const getStrokeColor = () => {
      if (percentage >= 90) return colorMap.red;
      if (percentage >= 70) return colorMap.yellow;
      return colorMap[color] || colorMap.blue;
    };

    const circumference = 2 * Math.PI * 45; // radio de 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <IconComponent className={`w-5 h-5 ${getColorClass().split(' ')[0]}`} />
            <span className="text-sm font-medium text-gray-900">{title}</span>
          </div>
          <span className={`text-xs font-medium ${getColorClass().split(' ')[0]}`}>
            {value ? value.toFixed(1) : '0'}{unit}
          </span>
        </div>

        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={getStrokeColor()}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${getColorClass().split(' ')[0]}`}>
              {Math.round(percentage)}
            </span>
          </div>
        </div>

        <div className="mt-2 text-center">
          <div className="text-xs text-gray-500">
            {percentage >= 90 && (
              <span className="text-red-500 font-medium">⚠ Alto</span>
            )}
            {percentage >= 70 && percentage < 90 && (
              <span className="text-yellow-500 font-medium">⚠ Medio</span>
            )}
            {percentage < 70 && (
              <span className="text-green-500 font-medium">✓ Normal</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-3"></div>
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <GaugeComponent
        title="CPU"
        value={data.avg_cpu_usage}
        icon={Cpu}
        color="blue"
      />
      
      <GaugeComponent
        title="Memoria"
        value={data.avg_memory_usage}
        icon={MemoryStick}
        color="green"
      />
      
      <GaugeComponent
        title="Disco"
        value={data.disk_usage_percent}
        icon={HardDrive}
        color="purple"
      />
      
      <GaugeComponent
        title="Red"
        value={data.network_usage_percent || 0}
        icon={Activity}
        color="orange"
      />
    </div>
  );
};

export default ResourcesGauge;