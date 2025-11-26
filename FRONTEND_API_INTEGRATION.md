# 🚀 Guía de Integración Frontend - APIs Backend

> **Proyecto:** IBM AI Platform  
> **Fecha:** Noviembre 26, 2025  
> **Para:** Desarrolladores Frontend

---

## 📌 Importante: Usar Rutas de Proxy de Nginx

**❌ NUNCA hagas esto:**
```javascript
// ❌ MAL - Intenta conectar directamente al contenedor Docker
const response = await fetch('http://rag-api:8004/health');
const response = await fetch('http://localhost:8004/health');
```

**✅ SIEMPRE haz esto:**
```javascript
// ✅ BIEN - Usa las rutas de proxy de nginx
const response = await fetch('/api/rag/health');
const response = await fetch('/api/fraude/health');
const response = await fetch('/api/textosql/health');
const response = await fetch('/api/stats/health');
```

---

## 🌐 Arquitectura de Red

```
Usuario/Browser
    ↓
Nginx (Puerto 2012) ← Punto de entrada único
    ↓
    ├─→ /api/rag/*      → rag-api:8004
    ├─→ /api/fraude/*   → fraude-api:8001
    ├─→ /api/textosql/* → textosql-api:8002
    ├─→ /api/stats/*    → stats-api:8003
    ├─→ /api/admin/*    → stats-api:8003
    ├─→ /api/metrics/*  → stats-api:8003
    └─→ /proxy/8088/*   → mistral-7b:8080
```

**Regla de oro:** Todas las requests del frontend pasan por nginx usando `/api/*` o `/proxy/*`

---

## 📋 Tabla de Endpoints Frontend

| Servicio | Ruta Frontend | Backend Real | Ejemplo |
|----------|---------------|--------------|---------|
| **RAG API** | `/api/rag/*` | `rag-api:8004` | `/api/rag/health` |
| **Fraude** | `/api/fraude/*` | `fraude-api:8001` | `/api/fraude/analyze` |
| **TextoSQL** | `/api/textosql/*` | `textosql-api:8002` | `/api/textosql/query` |
| **Stats** | `/api/stats/*` | `stats-api:8003` | `/api/stats/general` |
| **Admin** | `/api/admin/*` | `stats-api:8003` | `/api/admin/users` |
| **Metrics** | `/api/metrics/*` | `stats-api:8003` | `/api/metrics/history` |
| **Modelos LLM** | `/proxy/{port}/*` | `{modelo}:8080` | `/proxy/8088/v1/chat` |

---

## 🔧 Ejemplos de Uso Correcto

### 1. RAG API - Subir Documento

```javascript
// ✅ CORRECTO
const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/rag/upload', {
      method: 'POST',
      body: formData
      // NO incluir Content-Type, el browser lo añade automáticamente con boundary
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Upload exitoso:', result);
    return result;
  } catch (error) {
    console.error('❌ Error en upload:', error);
    throw error;
  }
};
```

### 2. RAG API - Query/Búsqueda

```javascript
// ✅ CORRECTO
const queryRAG = async (question) => {
  try {
    const response = await fetch('/api/rag/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: question,
        top_k: 5,
        use_llm: true,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Query exitoso:', result);
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
};
```

### 3. RAG API - Health Check

```javascript
// ✅ CORRECTO
const checkRAGHealth = async () => {
  try {
    const response = await fetch('/api/rag/health');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('❌ RAG API no disponible:', error);
    return false;
  }
};
```

### 4. RAG API - Listar Documentos

```javascript
// ✅ CORRECTO
const fetchDocuments = async () => {
  try {
    const response = await fetch('/api/rag/documents');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return [];
  }
};
```

### 5. RAG API - Eliminar Documento

```javascript
// ✅ CORRECTO
const deleteDocument = async (documentId) => {
  try {
    const response = await fetch(`/api/rag/documents/${documentId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Documento eliminado:', result);
    return result;
  } catch (error) {
    console.error('❌ Error eliminando documento:', error);
    throw error;
  }
};
```

### 6. Stats API - Métricas

```javascript
// ✅ CORRECTO
const fetchSystemMetrics = async () => {
  try {
    const response = await fetch('/api/stats/general');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const metrics = await response.json();
    return metrics;
  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    return null;
  }
};
```

### 7. Fraude API - Analizar Transacción

```javascript
// ✅ CORRECTO
const analyzeTransaction = async (transaction) => {
  try {
    const response = await fetch('/api/fraude/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error analyzing transaction:', error);
    throw error;
  }
};
```

### 8. TextoSQL API - Query Natural

```javascript
// ✅ CORRECTO
const queryDatabase = async (database, question) => {
  try {
    const response = await fetch('/api/textosql/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        database_id: database,
        question: question,
        execute: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error querying database:', error);
    throw error;
  }
};
```

---

## 🛠️ Utility: API Client Completo

Crea un archivo `src/utils/apiClient.js`:

```javascript
/**
 * Cliente API unificado para IBM AI Platform
 * Usa rutas de proxy de nginx automáticamente
 */

class APIError extends Error {
  constructor(status, statusText, data) {
    super(`HTTP ${status}: ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

class APIClient {
  constructor(baseRoute) {
    this.baseRoute = baseRoute; // ej: '/api/rag'
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseRoute}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        }
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (e) {
          // Si no hay JSON, usar statusText
        }
        throw new APIError(response.status, response.statusText, errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Añadir datos adicionales
    Object.entries(additionalData).forEach(([key, value]) => {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData
      // NO incluir Content-Type, el browser lo añade automáticamente
    });
  }
}

// Instancias exportables
export const ragAPI = new APIClient('/api/rag');
export const statsAPI = new APIClient('/api/stats');
export const textoSQLAPI = new APIClient('/api/textosql');
export const fraudeAPI = new APIClient('/api/fraude');

export { APIError };

// Ejemplos de uso:
// import { ragAPI } from './utils/apiClient';
// const docs = await ragAPI.get('/documents');
// const result = await ragAPI.post('/query', { query: 'test' });
// await ragAPI.uploadFile('/upload', file);
```

---

## 🎯 React Hook: useRAG

Crea `src/hooks/useRAG.js`:

```javascript
import { useState, useCallback } from 'react';
import { ragAPI } from '../utils/apiClient';

export const useRAG = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = useCallback(async (question, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ragAPI.post('/query', {
        query: question,
        top_k: options.topK || 5,
        use_llm: options.useLLM !== false,
        stream: options.stream || false
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file, metadata = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ragAPI.uploadFile('/upload', file, { metadata });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ragAPI.get('/documents');
      return result.documents || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (docId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ragAPI.delete(`/documents/${docId}`);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ragAPI.get('/stats');
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const result = await ragAPI.get('/health');
      return result.status === 'healthy';
    } catch (err) {
      return false;
    }
  }, []);

  return {
    loading,
    error,
    query,
    uploadDocument,
    getDocuments,
    deleteDocument,
    getStats,
    checkHealth
  };
};
```

**Uso en componente:**

```jsx
import { useRAG } from '../hooks/useRAG';

const MyComponent = () => {
  const { query, uploadDocument, loading, error } = useRAG();
  const [answer, setAnswer] = useState('');

  const handleQuery = async () => {
    try {
      const result = await query('¿Qué es RAG?');
      setAnswer(result.answer);
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  const handleUpload = async (file) => {
    try {
      const result = await uploadDocument(file);
      console.log('Uploaded:', result);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {/* UI aquí */}
    </div>
  );
};
```

---

## 🐛 Debugging

### Ver requests en DevTools

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por **Fetch/XHR**
4. Haz un request y observa:
   - **Request URL:** Debe ser `/api/rag/...` (relativa)
   - **Status Code:** 200 OK (éxito) o 502 (backend caído)
   - **Response:** Datos JSON o mensaje de error

### Logs de nginx

```bash
# Ver logs del frontend (nginx)
docker-compose logs -f frontend

# Ver últimas 50 líneas
docker-compose logs --tail=50 frontend
```

### Logs del backend (RAG)

```bash
# Ver logs de RAG API
docker-compose logs -f rag-api

# Ver si está corriendo
docker ps | grep rag-api
```

### Test manual con curl

```bash
# Desde el host (fuera de Docker)
curl http://localhost:2012/api/rag/health

# Desde dentro del contenedor frontend
docker-compose exec frontend curl http://rag-api:8004/health
```

---

## ⚠️ Errores Comunes

### Error 502: Bad Gateway

**Causa:** Backend no está corriendo o no responde.

**Solución:**
```bash
# Verificar que rag-api esté corriendo
docker ps | grep rag-api

# Ver logs de rag-api
docker-compose logs rag-api

# Reiniciar servicio
docker-compose restart rag-api
```

### Error 404: Not Found

**Causa:** Ruta incorrecta o endpoint no existe.

**Verifica:**
- ✅ URL debe empezar con `/api/rag/`, `/api/fraude/`, etc.
- ✅ Endpoint existe en el backend (ver docs)
- ✅ Método HTTP correcto (GET, POST, DELETE)

### Error 413: Request Entity Too Large

**Causa:** Archivo muy grande (>100MB).

**Solución:** El límite ya está configurado en nginx (100MB), pero verifica:
```javascript
// Validar tamaño antes de subir
if (file.size > 100 * 1024 * 1024) {
  alert('Archivo muy grande. Máximo 100MB');
  return;
}
```

### Error CORS

**Causa:** Request desde dominio no permitido.

**No debería ocurrir** si estás haciendo requests desde el mismo dominio (nginx sirve frontend y backend).

**Si ocurre:** Verifica que estás usando rutas relativas (`/api/...`) y no absolutas (`http://...`).

---

## 📊 Monitoreo de Performance

```javascript
// Medir tiempo de respuesta
const measureRequestTime = async (url, options) => {
  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const end = performance.now();
    console.log(`⏱️ ${url}: ${(end - start).toFixed(0)}ms`);
    return response;
  } catch (error) {
    const end = performance.now();
    console.error(`⏱️ ${url}: ${(end - start).toFixed(0)}ms (ERROR)`);
    throw error;
  }
};

// Uso
const response = await measureRequestTime('/api/rag/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'test' })
});
```

---

## ✅ Checklist de Integración

- [ ] Todas las requests usan `/api/*` o `/proxy/*`
- [ ] No hay URLs hardcodeadas con `localhost:8004`, etc.
- [ ] Manejo de errores implementado (try-catch)
- [ ] Loading states para UX
- [ ] Validación de archivos antes de upload
- [ ] Logs de debugging en desarrollo
- [ ] Health checks antes de requests críticos
- [ ] Retry logic para requests fallidos
- [ ] Timeout configurado para requests largos

---

## 🎓 Recursos

- **Swagger/OpenAPI UI:** No disponible aún (TODO)
- **Logs del sistema:** `docker-compose logs -f`
- **Documentación backend:** Ver `BACKEND_API_DOCS.md`
- **Issues conocidos:** Ver `KNOWN_ISSUES.md`

---

**Última actualización:** Noviembre 26, 2025  
**Autor:** IBM AI Platform Team
