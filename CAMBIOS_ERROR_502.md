# 🔧 Resumen de Cambios - Corrección Error 502

## 📋 Archivos Modificados

### 1. ✅ `nginx.conf.template` - CORREGIDO
**Problema:** El `rewrite` y `resolver` estaban causando conflictos.

**Solución aplicada:**
```nginx
# ANTES (❌ Problemático)
location /api/rag/ {
    resolver 127.0.0.11 valid=30s ipv6=off;
    set $rag_backend "http://${RAG_API_HOST}:${RAG_API_PORT}";
    rewrite ^/api/rag/(.*) /$1 break;
    proxy_pass $rag_backend;
    # ...
}

# DESPUÉS (✅ Correcto)
location /api/rag/ {
    proxy_pass http://${RAG_API_HOST}:${RAG_API_PORT}/;
    proxy_set_header Host $host;
    # ...
}
```

**Por qué funciona ahora:**
- El trailing `/` en `proxy_pass` hace que nginx reemplace `/api/rag/` con `/`
- Ejemplo: `/api/rag/health` → `http://rag-api:8004/health` ✅

---

### 2. ✅ `entrypoint.sh` - MEJORADO
**Mejora:** Ahora espera a que los servicios backend estén disponibles en DNS antes de arrancar nginx.

**Función añadida:**
```bash
wait_for_host() {
  # Espera hasta 60s a que un host resuelva en DNS
  # Evita el error "host not found in upstream"
}
```

---

### 3. ✅ `src/utils/apiClient.js` - NUEVO
**Utilidad completa para hacer requests a las APIs.**

**Características:**
- ✅ Manejo automático de errores
- ✅ Upload de archivos con FormData
- ✅ Streaming (Server-Sent Events)
- ✅ Health checks
- ✅ Retry con exponential backoff
- ✅ Timeout configurable

**Instancias exportadas:**
```javascript
import { ragAPI, statsAPI, textoSQLAPI, fraudeAPI } from './utils/apiClient';
```

---

### 4. ✅ `FRONTEND_API_INTEGRATION.md` - NUEVO
**Documentación completa para desarrolladores frontend.**

**Incluye:**
- ✅ Tabla de rutas de proxy
- ✅ Ejemplos de código para cada API
- ✅ Debugging y troubleshooting
- ✅ Errores comunes y soluciones
- ✅ React hooks y utilities

---

## 🚀 Cómo Aplicar los Cambios

### Paso 1: Rebuild del Frontend
```bash
cd /root/FrontAI  # o donde esté tu frontend

# Rebuild la imagen
docker-compose build frontend

# O si usas otro compose
docker-compose -f docker-compose.yml build frontend
```

### Paso 2: Reiniciar Servicios
```bash
# Reiniciar frontend
docker-compose restart frontend

# O reiniciar todo el stack
docker-compose down
docker-compose up -d
```

### Paso 3: Verificar Logs
```bash
# Ver logs del frontend
docker-compose logs -f frontend

# Deberías ver:
# 🔍 Checking backend services availability...
# ✅ Host 'rag-api' resolved successfully.
# 🚀 Starting nginx...
```

### Paso 4: Test Manual
```bash
# Desde el host
curl http://localhost:2012/api/rag/health

# Debería retornar:
# {"status":"healthy","service":"RAG API",...}
```

---

## 🔍 Verificación de Funcionamiento

### 1. Health Check de RAG API
```bash
curl http://localhost:2012/api/rag/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "service": "RAG API with Milvus Vector Database",
  "version": "3.0.0"
}
```

### 2. Listar Documentos
```bash
curl http://localhost:2012/api/rag/documents
```

**Resultado esperado:**
```json
{
  "documents": [],
  "total": 0
}
```

### 3. Test de Upload (desde browser)
En DevTools Console:
```javascript
const testUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/rag/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log(await response.json());
  };
  input.click();
};

testUpload();
```

---

## 📊 Debugging del Error 502

### Si sigue ocurriendo el error 502:

#### 1. Verificar que rag-api esté corriendo
```bash
docker ps | grep rag-api

# Debería mostrar:
# CONTAINER ID   IMAGE          STATUS         PORTS
# abc123...      rag-api:latest Up 5 minutes   0.0.0.0:8004->8004/tcp
```

#### 2. Ver logs de rag-api
```bash
docker-compose logs rag-api --tail=50

# Buscar errores como:
# - Connection refused
# - Out of memory
# - Import errors
# - Port already in use
```

#### 3. Test directo a rag-api (sin nginx)
```bash
# Desde el host
curl http://localhost:8004/health

# O desde dentro del contenedor frontend
docker-compose exec frontend curl http://rag-api:8004/health
```

#### 4. Verificar variables de entorno
```bash
docker-compose exec frontend env | grep RAG

# Debería mostrar:
# RAG_API_HOST=rag-api
# RAG_API_PORT=8004
```

#### 5. Ver configuración generada de nginx
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Buscar la sección de RAG:
# location /api/rag/ {
#     proxy_pass http://rag-api:8004/;
#     ...
# }
```

---

## 🎯 Uso del Nuevo API Client

### En `DocumentAnalysisPage.jsx` (o cualquier componente):

```javascript
import { ragAPI, APIError } from '../utils/apiClient';

// ✅ Upload de documento
const handleUpload = async (file) => {
  try {
    const result = await ragAPI.uploadFile('/upload', file, {
      metadata: { category: 'manual' }
    });
    console.log('✅ Upload exitoso:', result);
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 413) {
        alert('Archivo muy grande (máx 100MB)');
      } else if (error.status === 502) {
        alert('Servicio no disponible. Intenta más tarde.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  }
};

// ✅ Query/búsqueda
const handleQuery = async (question) => {
  try {
    const result = await ragAPI.post('/query', {
      query: question,
      top_k: 5,
      use_llm: true
    });
    console.log('✅ Respuesta:', result.answer);
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
};

// ✅ Listar documentos
const fetchDocs = async () => {
  try {
    const data = await ragAPI.get('/documents');
    setDocuments(data.documents || []);
  } catch (error) {
    console.error('❌ Error fetching docs:', error);
  }
};

// ✅ Eliminar documento
const deleteDoc = async (docId) => {
  try {
    await ragAPI.delete(`/documents/${docId}`);
    console.log('✅ Documento eliminado');
    fetchDocs(); // Recargar lista
  } catch (error) {
    console.error('❌ Error eliminando:', error);
  }
};

// ✅ Health check
const checkHealth = async () => {
  const isHealthy = await ragAPI.checkHealth();
  console.log('RAG API:', isHealthy ? '✅ Healthy' : '❌ Down');
};
```

---

## 🔄 Migración de Código Existente

### ANTES (código viejo):
```javascript
const fetchDocuments = async () => {
  try {
    const response = await fetch('/api/rag/documents');
    if (response.ok) {
      const data = await response.json();
      setDocuments(data.documents || []);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### DESPUÉS (con nuevo client):
```javascript
import { ragAPI } from '../utils/apiClient';

const fetchDocuments = async () => {
  try {
    const data = await ragAPI.get('/documents');
    setDocuments(data.documents || []);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**Ventajas:**
- ✅ Menos código repetitivo
- ✅ Manejo de errores automático
- ✅ Logs más informativos
- ✅ Retry automático opcional

---

## 📚 Recursos Adicionales

### Documentación
- **Frontend Integration:** `FRONTEND_API_INTEGRATION.md`
- **Backend API Docs:** (El documento que compartiste)
- **Milvus Migration:** `MILVUS_MIGRATION.md`

### Comandos Útiles
```bash
# Logs en tiempo real
docker-compose logs -f frontend rag-api

# Restart de servicios específicos
docker-compose restart frontend rag-api

# Rebuild completo
docker-compose down
docker-compose build
docker-compose up -d

# Ejecutar comando en contenedor
docker-compose exec frontend sh
docker-compose exec rag-api bash

# Ver variables de entorno
docker-compose exec frontend env
docker-compose exec rag-api env
```

---

## ✅ Checklist Final

- [ ] `nginx.conf.template` actualizado (sin `rewrite` problemático)
- [ ] `entrypoint.sh` actualizado (con `wait_for_host`)
- [ ] `src/utils/apiClient.js` creado
- [ ] Frontend rebuildeado (`docker-compose build frontend`)
- [ ] Servicios reiniciados (`docker-compose restart`)
- [ ] Health check funciona (`curl http://localhost:2012/api/rag/health`)
- [ ] Upload de documentos funciona (test desde UI)
- [ ] Query/búsqueda funciona (test desde UI)
- [ ] No más errores 502 en logs

---

## 🆘 Si Aún No Funciona

1. **Compartir logs completos:**
   ```bash
   docker-compose logs frontend --tail=100 > frontend.log
   docker-compose logs rag-api --tail=100 > rag-api.log
   ```

2. **Verificar docker-compose.yml:**
   - ¿Están definidas las variables `RAG_API_HOST` y `RAG_API_PORT`?
   - ¿El servicio frontend tiene `depends_on: rag-api`?
   - ¿Están en la misma red Docker?

3. **Test de conectividad:**
   ```bash
   docker-compose exec frontend ping -c 3 rag-api
   docker-compose exec frontend curl -v http://rag-api:8004/health
   ```

---

**Última actualización:** Noviembre 26, 2025  
**Status:** Listo para aplicar 🚀
