import config from '../config/environment';

// Función simple para hacer ping
export const simplePing = async (url) => {
  try {
    if (!url) {
      return { 
        status: 'disconnected', 
        message: 'URL no proporcionada',
        timestamp: new Date().toLocaleTimeString()
      };
    }

    // Para URLs que empiezan con /proxy/ (modelos llama.cpp)
    if (url.includes('/proxy/')) {
      // Intentar con el endpoint de health de llama.cpp
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(config.timeouts.health), // Timeout desde config
      });

      if (response.ok) {
        return { 
          status: 'connected', 
          message: 'Modelo disponible',
          timestamp: new Date().toLocaleTimeString()
        };
      } else {
        return { 
          status: 'error', 
          message: `HTTP ${response.status}`,
          timestamp: new Date().toLocaleTimeString()
        };
      }
    }

    // Para otras URLs (APIs normales)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(config.timeouts.health), // Timeout desde config
    });

    if (response.ok) {
      return { 
        status: 'connected', 
        message: 'Conectado',
        timestamp: new Date().toLocaleTimeString()
      };
    } else {
      return { 
        status: 'error', 
        message: `HTTP ${response.status}`,
        timestamp: new Date().toLocaleTimeString()
      };
    }
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error.name === 'TimeoutError') {
      return { 
        status: 'timeout', 
        message: `Timeout (${config.timeouts.health / 1000}s)`,
        timestamp: new Date().toLocaleTimeString()
      };
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        status: 'disconnected', 
        message: 'No se puede conectar',
        timestamp: new Date().toLocaleTimeString()
      };
    }

    return { 
      status: 'error', 
      message: error.message || 'Error desconocido',
      timestamp: new Date().toLocaleTimeString()
    };
  }
};