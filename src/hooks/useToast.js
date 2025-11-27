import { useState } from 'react';
import config from '../config/environment';

/**
 * Hook personalizado para gestionar toasts
 * @returns {Object} { toasts, addToast, removeToast }
 * 
 * @example
 * const { toasts, addToast, removeToast } = useToast();
 * 
 * addToast({
 *   type: 'success',
 *   title: '¡Éxito!',
 *   message: 'Operación completada correctamente',
 *   duration: 5000
 * });
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', title, message, duration = config.ui.toastDuration }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message, duration };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove después de duration + animación de salida
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration + config.ui.toastFadeDuration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};
