import { useState } from 'react';

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

  const addToast = ({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message, duration };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove después de duration + animación
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration + 300);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};
