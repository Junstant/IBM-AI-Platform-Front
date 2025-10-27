import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { simplePing } from '../utils/simplePing';

const SimpleStatus = ({ url, name, interval = 10000 }) => {
  const [status, setStatus] = useState({ 
    status: 'disconnected', 
    message: 'Verificando...',
    timestamp: new Date().toLocaleTimeString()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    if (!url) {
      setStatus({ 
        status: 'disconnected', 
        message: 'No configurado',
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    setIsChecking(true);
    try {
      const result = await simplePing(url);
      setStatus(result);
    } catch (error) {
      setStatus({ 
        status: 'error' + error.message, 
        message: 'Error de verificación',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, interval);
    return () => clearInterval(timer);
  }, [url, interval]);

  const getStatusConfig = () => {
    switch (status.status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'timeout':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${config.bgColor} ${config.borderColor}`}>
      <StatusIcon className={`w-4 h-4 ${config.color} ${isChecking ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {name}
        </span>
        <span className={`text-xs ${config.color}`}>
          {status.message} • {status.timestamp}
        </span>
      </div>
    </div>
  );
};

export default SimpleStatus;