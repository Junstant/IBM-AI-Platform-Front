import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Notification Component - IBM AI Platform
 * Componente reutilizable para notificaciones toast con animaciones
 * 
 * @param {Object} props
 * @param {string} props.type - Tipo de notificación: 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.title - Título de la notificación
 * @param {string} props.message - Mensaje de la notificación
 * @param {number} props.duration - Duración en ms (default: 5000)
 * @param {function} props.onClose - Callback cuando se cierra
 */

const ToastNotification = ({ type = 'info', title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Duración de la animación de salida
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success/10',
      borderColor: 'border-success',
      iconColor: 'text-success',
      titleColor: 'text-success',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger',
      iconColor: 'text-danger',
      titleColor: 'text-danger',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-carbon-yellow-10',
      borderColor: 'border-carbon-yellow-30',
      iconColor: 'text-carbon-yellow-50',
      titleColor: 'text-carbon-yellow-50',
    },
    info: {
      icon: Info,
      bgColor: 'bg-interactive/10',
      borderColor: 'border-interactive',
      iconColor: 'text-interactive',
      titleColor: 'text-interactive',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border-l-4 p-04 mb-03 rounded-sm shadow-lg transition-all duration-300 ${
        isExiting ? 'animate-toast-exit' : 'animate-toast-enter'
      }`}
    >
      <div className="flex items-start space-x-03">
        {/* Ícono */}
        <div className={`${config.iconColor} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-label font-semibold ${config.titleColor} mb-01`}>
              {title}
            </h4>
          )}
          {message && (
            <p className="text-caption text-text-primary whitespace-pre-wrap break-words">
              {message}
            </p>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de progreso */}
      {duration > 0 && (
        <div className="mt-02 h-1 bg-ui-03 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.iconColor.replace('text-', 'bg-')} animate-toast-progress`}
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      )}
    </div>
  );
};

/**
 * Toast Container Component
 * Contenedor para múltiples notificaciones toast
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-06 z-[9999] w-full max-w-md space-y-03 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastNotification;
