/**
 * 🐛 DEBUG COMPONENT - Temporary
 * Muestra todas las variables de entorno y configuración
 * ELIMINAR en producción
 */

import React from 'react';
import config from '../config/environment';

const DebugConfig = () => {
  const envVars = {
    VITE_API_HOST: import.meta.env.VITE_API_HOST,
    VITE_GEMMA_2B_PORT: import.meta.env.VITE_GEMMA_2B_PORT,
    VITE_GEMMA_4B_PORT: import.meta.env.VITE_GEMMA_4B_PORT,
    VITE_GEMMA_12B_PORT: import.meta.env.VITE_GEMMA_12B_PORT,
    VITE_MISTRAL_PORT: import.meta.env.VITE_MISTRAL_PORT,
    VITE_DEEPSEEK_8B_PORT: import.meta.env.VITE_DEEPSEEK_8B_PORT,
    VITE_TEXTOSQL_API_PORT: import.meta.env.VITE_TEXTOSQL_API_PORT,
    VITE_FRAUD_DETECTION_PORT: import.meta.env.VITE_FRAUD_DETECTION_PORT,
    VITE_STATS_API_PORT: import.meta.env.VITE_STATS_API_PORT,
    VITE_RAG_API_PORT: import.meta.env.VITE_RAG_API_PORT,
    VITE_EMBEDDINGS_PORT: import.meta.env.VITE_EMBEDDINGS_PORT,
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000',
      color: '#0f0',
      padding: '10px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 99999,
      fontSize: '11px',
      fontFamily: 'monospace',
    }}>
      <div style={{ marginBottom: '10px', borderBottom: '1px solid #0f0', paddingBottom: '5px' }}>
        <strong>🐛 DEBUG CONFIG</strong>
        <button 
          onClick={() => console.table(envVars)}
          style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '10px' }}
        >
          Log to Console
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <strong style={{ color: '#ff0' }}>📦 ENV VARS (import.meta.env):</strong>
          <pre style={{ margin: 0, marginTop: '5px', color: '#0ff' }}>
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong style={{ color: '#ff0' }}>⚙️ CONFIG OBJECT:</strong>
          <pre style={{ margin: 0, marginTop: '5px', color: '#0ff' }}>
            {JSON.stringify({
              'llm.ports': config.llm.ports,
              'availableModels': config.llm.availableModels.map(m => ({
                id: m.id,
                name: m.name,
                port: m.port
              }))
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugConfig;
