import React, { useState, useEffect } from 'react';
import { pingAPI } from '../utils/simplePing';

const SimpleStatus = ({ url, name }) => {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      const result = await pingAPI(url);
      setIsConnected(result);
    };
    
    checkConnection();
    // Verificar cada 10 segundos
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [url]);

  if (isConnected === null) {
    return <span className="text-yellow-600">🔍 Verificando...</span>;
  }

  return (
    <span className={isConnected ? "text-green-600" : "text-red-600"}>
      {isConnected ? "🟢" : "🔴"} {name} {isConnected ? "conectado" : "desconectado"}
    </span>
  );
};

export default SimpleStatus;