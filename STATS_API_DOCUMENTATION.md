# 📊 Stats API - Documentación Completa

**Versión**: 2.1  
**Fecha**: 2025-12-04  
**Puerto Backend**: 8003  
**Base Path**: `/api/stats`  
**Estado**: Frontend 100% funcional | Backend requiere ajustes específicos

---

## 📋 Tabla de Contenidos

1. [Estado del Sistema](#estado-del-sistema)
2. [Correcciones Aplicadas al Frontend](#correcciones-aplicadas-al-frontend)
3. [Arquitectura General](#arquitectura-general)
4. [Endpoints Requeridos](#endpoints-requeridos)
5. [Problemas Pendientes del Backend](#problemas-pendientes-del-backend)
6. [Testing y Verificación](#testing-y-verificación)

---

## 🎯 Estado del Sistema

### Frontend ✅
- **Estado**: Completamente funcional y resiliente
- **Cambios**: Implementadas validaciones defensivas con optional chaining
- **Comportamiento**: No crashea con datos faltantes/indefinidos
- **Versión**: 2.1 (con fixes aplicados el 2025-12-04)

### Backend ⚠️
- **Estado**: Funcional pero requiere ajustes en estructura de datos
- **Endpoints**: Todos responden 200 OK
- **Problemas**: 
  1. Nombres de campos incorrectos en algunas respuestas
  2. Campo `id` faltante en alertas
  3. **CRÍTICO**: Contador de queries incluye requests de stats (ver sección específica)

---

## 🔧 Correcciones Aplicadas al Frontend

### 1. Error: "Cannot read properties of undefined (reading 'success_rate')"

**Causa**: Componentes accedían a propiedades sin validar existencia del objeto.

**Solución Aplicada**:
```javascript
// ❌ ANTES:
functionality.success_rate

// ✅ DESPUÉS:
functionality?.success_rate || 0
```

**Archivos Modificados**:
- `src/components/stats/FunctionalityMetrics.jsx` (4 ubicaciones)
- `src/pages/MetricsPage.jsx` (8 campos en Excel export)

**Líneas Específicas Modificadas**:

**FunctionalityMetrics.jsx**:
```javascript
// Línea 77-80: Validación inicial
if (!functionality) return null;

// Línea 161: Success rate en badge
{functionality?.success_rate || 0}%

// Línea 170-171: Clases condicionales
className={`transition-all duration-500 ${
  (functionality?.success_rate || 0) >= 90 ? 'bg-success' : 
  (functionality?.success_rate || 0) >= 70 ? 'bg-warning' : 'bg-danger'
}`}

// Línea 173: Width del progress bar
width: `${functionality?.success_rate || 0}%`
```

**MetricsPage.jsx**:
```javascript
// Línea 33: Validación de summary
if (!metrics || !metrics.summary)

// Líneas 45-52: Campos con optional chaining
const data = [
  ['Total Requests', metrics.summary?.total_requests || 0],
  ['Success Rate', `${metrics.summary?.success_rate || 0}%`],
  ['Avg Response Time', `${metrics.summary?.avg_response_time || 0}s`],
  ['Active Services', metrics.summary?.active_services || 0],
  ['Total Errors', metrics.summary?.total_errors || 0],
  ['Uptime', `${metrics.summary?.uptime_hours || 0}h`],
  ['Daily Queries', metrics.summary?.daily_queries || 0],
  ['Peak Load', metrics.summary?.peak_load || 0],
];
```

---

### 2. Error: POST /api/stats/admin/resolve-alert/undefined

**Causa**: Backend retorna alertas sin el campo `id` (o con `id: null`).

**Solución Aplicada**:
```javascript
// ❌ ANTES:
{onResolveAlert && (
  <button onClick={() => onResolveAlert(alert.id)}>

// ✅ DESPUÉS:
{onResolveAlert && alert.id && (
  <button onClick={() => onResolveAlert(alert.id)}>
```

**Archivos Modificados**:
- `src/components/stats/AlertsPanel.jsx` (línea 143)

**Resultado**: Botón de resolver solo aparece si la alerta tiene un `id` válido, previniendo requests a `/api/stats/admin/resolve-alert/undefined`.

---

### 3. Validaciones Defensivas Implementadas

#### A. Optional Chaining (`?.`)
Todos los accesos a propiedades anidadas usan optional chaining:
```javascript
summary?.active_models || 0
metrics?.summary?.success_rate || 0
functionality?.success_rate || 0
alert?.severity || 'medium'
```

#### B. Valores por Defecto
Todos los valores numéricos tienen fallback:
```javascript
const value = data?.field || 0;
const text = data?.field || 'N/A';
const array = data?.items || [];
```

#### C. Validación de Existencia
Componentes validan datos antes de renderizar:
```javascript
if (!data || data.length === 0) {
  return <EmptyState />;
}
```

#### D. Validación de Arrays
Arrays se validan antes de iterar:
```javascript
const services = Array.isArray(data) ? data : [];
services.filter(...).map(...)
```

---

## 🏗️ Arquitectura General

```
Cliente (Browser)
    ↓ http://52.117.41.85:2012/api/stats/*
    
Frontend Container (Nginx Alpine)
    ↓ proxy_pass http://stats-api:8003/api/stats/*
    
Backend Stats API (FastAPI en contenedor stats-api)
    ↓ Consultas a DB
    
Base de Datos (PostgreSQL/MongoDB)
```

### Configuración Nginx (Frontend)
```nginx
location /api/stats/ {
    proxy_pass http://stats-api:8003/api/stats/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/admin/ {
    proxy_pass http://stats-api:8003/api/admin/;
    # ... mismos headers
}

location /api/metrics/ {
    proxy_pass http://stats-api:8003/api/metrics/;
    # ... mismos headers
}
```

### Red Docker
- **Red**: `app-network`
- **DNS Interno**: Servicios se comunican por nombre de contenedor
- **IPs Asignadas**: 172.18.0.x (asignación automática por Docker)

---

## 🔌 Endpoints Requeridos

### 1. Dashboard Summary
**Endpoint**: `GET /api/stats/dashboard/summary`  
**Usado en**: `DashboardPage.jsx`  
**Frecuencia**: Cada 30 segundos  
**Estado Actual**: ⚠️ Funciona pero nombres de campos incorrectos

#### Respuesta Requerida:
```json
{
  "active_models": 5,
  "error_models": 0,
  "active_apis": 3,
  "error_apis": 0,
  "daily_queries": 2735,
  "daily_successful_queries": 2400,
  "daily_failed_queries": 335,
  "avg_response_time": 1.23,
  "global_accuracy": 87.71,
  "timestamp": "2025-12-04T00:14:23Z"
}
```

#### ⚠️ Problema Actual:
El backend actualmente devuelve:
```json
{
  "total_queries_24h": 2735,  // ❌ DEBE SER: "daily_queries"
  "avg_accuracy": 87.71        // ❌ DEBE SER: "global_accuracy"
}
```

**Frontend está preparado para los nombres correctos**, pero tiene fallback para no crashear.

#### Campos Obligatorios:
| Campo | Tipo | Rango | Descripción |
|-------|------|-------|-------------|
| `active_models` | integer | ≥0 | Modelos LLM activos (status="online") |
| `error_models` | integer | ≥0 | Modelos LLM con error (status="error") |
| `active_apis` | integer | ≥0 | APIs activas (fraude, textosql, rag) |
| `error_apis` | integer | ≥0 | APIs con error |
| `daily_queries` | integer | ≥0 | **Solo AI demos** (ver sección específica) |
| `daily_successful_queries` | integer | ≥0 | Consultas exitosas |
| `daily_failed_queries` | integer | ≥0 | Consultas fallidas |
| `avg_response_time` | float | ≥0 | Tiempo promedio en **segundos** |
| `global_accuracy` | float | 0-100 | Precisión global (0-100) |
| `timestamp` | string | ISO | ISO 8601 timestamp |

---

### 2. Services Status
**Endpoint**: `GET /api/stats/services/status`  
**Usado en**: `DashboardPage.jsx`, `MetricsPage.jsx`  
**Frecuencia**: Cada 10 segundos  
**Estado Actual**: ✅ Funciona correctamente

#### Respuesta Requerida:
```json
[
  {
    "service_name": "mistral-7b",
    "service_type": "llm",
    "display_name": "Mistral 7B",
    "status": "online",
    "uptime_seconds": 3600,
    "total_requests": 450,
    "successful_requests": 445,
    "failed_requests": 5,
    "avg_latency_ms": 234.5,
    "last_check": "2025-12-04T00:14:23Z",
    "metadata": {
      "port": "8088",
      "version": "v0.2.0",
      "gpu_enabled": true
    }
  },
  {
    "service_name": "fraud-detection",
    "service_type": "fraud",
    "display_name": "Fraud Detection API",
    "status": "online",
    "uptime_seconds": 7200,
    "total_requests": 1200,
    "successful_requests": 1180,
    "failed_requests": 20,
    "avg_latency_ms": 89.3,
    "last_check": "2025-12-04T00:14:23Z",
    "metadata": {
      "port": "8001",
      "model": "xgboost"
    }
  }
]
```

#### ⚠️ Campo CRÍTICO: `service_type`
Este campo es **ESENCIAL** para el filtrado correcto:

**En DashboardPage.jsx**: Solo muestra servicios con `service_type: "llm"` en la sección de modelos.
**En MetricsPage.jsx**: Muestra todos los servicios agrupados por tipo.

**Valores Permitidos**:
- `"llm"` - Modelos de lenguaje (mistral-7b, gemma-2b, etc.)
- `"fraud"` - API de detección de fraude
- `"textosql"` - API de Text-to-SQL
- `"rag"` - API de RAG (Retrieval-Augmented Generation)

#### Campos Obligatorios:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `service_name` | string | ID único del servicio |
| `service_type` | string | **CRÍTICO**: "llm" \| "fraud" \| "textosql" \| "rag" |
| `display_name` | string | Nombre para mostrar en UI |
| `status` | string | "online" \| "offline" \| "error" \| "degraded" |
| `uptime_seconds` | integer | Tiempo activo en segundos |
| `total_requests` | integer | Total requests desde inicio |
| `successful_requests` | integer | Requests exitosos |
| `failed_requests` | integer | Requests fallidos |
| `avg_latency_ms` | float | Latencia promedio en milisegundos |
| `last_check` | string | ISO 8601 timestamp del último health check |
| `metadata` | object | Metadata adicional (flexible) |

---

### 3. Active Alerts
**Endpoint**: `GET /api/stats/alerts/active`  
**Usado en**: `DashboardPage.jsx`, `AlertsPanel.jsx`  
**Frecuencia**: Cada 15 segundos  
**Estado Actual**: ⚠️ Funciona pero falta campo `id`

#### Respuesta Requerida:
```json
[
  {
    "id": "alert_001",
    "type": "high_latency",
    "severity": "warning",
    "title": "Alta latencia detectada",
    "message": "Mistral 7B tiene latencia de 2.5s (umbral: 1.5s)",
    "timestamp": "2025-12-04T00:10:00Z",
    "service_name": "mistral-7b",
    "metadata": {
      "current_value": 2.5,
      "threshold": 1.5,
      "unit": "seconds"
    }
  },
  {
    "id": "alert_002",
    "type": "service_down",
    "severity": "critical",
    "title": "Servicio caído",
    "message": "gemma-2b no responde a health checks",
    "timestamp": "2025-12-04T00:12:00Z",
    "service_name": "gemma-2b",
    "metadata": {
      "last_seen": "2025-12-04T00:05:00Z",
      "attempts": 5
    }
  }
]
```

#### ⚠️ Problema Actual:
El backend actualmente devuelve alertas **SIN** el campo `id`:
```json
[
  {
    // ❌ FALTA: "id": "alert_001",
    "type": "high_latency",
    "severity": "warning",
    // ...resto de campos
  }
]
```

**Resultado**: El botón de "Resolver" no aparece (frontend lo valida con `alert.id &&`).

**Solución Backend Requerida**: Agregar campo `id` único a cada alerta.

#### Campos Obligatorios:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | **CRÍTICO**: ID único de la alerta |
| `type` | string | Tipo de alerta (custom strings) |
| `severity` | string | "info" \| "warning" \| "critical" |
| `title` | string | Título corto de la alerta |
| `message` | string | Descripción detallada |
| `timestamp` | string | ISO 8601 timestamp |
| `service_name` | string | Servicio relacionado (opcional) |
| `metadata` | object | Metadata adicional (opcional) |

---

### 4. Recent Activity
**Endpoint**: `GET /api/stats/activity/recent?limit=10`  
**Usado en**: `DashboardPage.jsx`  
**Frecuencia**: Cada 30 segundos  
**Estado Actual**: ✅ Funciona correctamente

#### Respuesta Requerida:
```json
[
  {
    "id": "act_001",
    "type": "query",
    "service": "mistral-7b",
    "status": "success",
    "timestamp": "2025-12-04T00:14:23Z",
    "response_time": 1.23,
    "details": "Completado exitosamente"
  },
  {
    "id": "act_002",
    "type": "error",
    "service": "gemma-2b",
    "status": "error",
    "timestamp": "2025-12-04T00:14:20Z",
    "response_time": 0.0,
    "details": "Connection timeout"
  }
]
```

#### Query Parameters:
- `limit` (integer, default: 10): Cantidad de actividades a retornar
- `service` (string, opcional): Filtrar por servicio específico
- `status` (string, opcional): Filtrar por status ("success" | "error")

---

### 5. Resolve Alert (Admin)
**Endpoint**: `POST /api/stats/admin/resolve-alert/{alert_id}?resolved_by={username}`  
**Usado en**: `AlertsPanel.jsx` (cuando se hace clic en "Resolver")  
**Estado Actual**: ❌ Retorna 404 porque recibe `undefined` como alert_id

#### Request:
```
POST /api/stats/admin/resolve-alert/alert_001?resolved_by=admin
Content-Type: application/json
```

#### Respuesta Esperada (200 OK):
```json
{
  "success": true,
  "alert_id": "alert_001",
  "resolved_by": "admin",
  "resolved_at": "2025-12-04T00:15:00Z"
}
```

#### Respuesta de Error (404 Not Found):
```json
{
  "detail": "Alert not found"
}
```

#### ⚠️ Problema Actual:
```
POST /api/stats/admin/resolve-alert/undefined?resolved_by=admin HTTP/1.0" 404 Not Found
```

**Causa**: Las alertas retornadas por `/api/stats/alerts/active` no tienen campo `id`.  
**Solución**: Agregar campo `id` a las alertas (ver sección 3).

---

### 6. Health Check
**Endpoint**: `GET /api/stats/health` o `GET /health`  
**Usado en**: Health checks automáticos, diagnóstico  
**Frecuencia**: Bajo demanda  
**Estado Actual**: ✅ Funciona correctamente

#### Respuesta Esperada:
```json
{
  "status": "healthy",
  "service": "stats-api",
  "version": "2.0.0",
  "timestamp": "2025-12-04T00:14:23Z"
}
```

---

## ⚠️ Problemas Pendientes del Backend

### Prioridad Alta (Bloqueantes)

#### 1. ❌ Campo `id` Faltante en Alertas
**Endpoint Afectado**: `GET /api/stats/alerts/active`

**Problema**:
```json
// ❌ ACTUAL:
[
  {
    "type": "high_latency",
    "severity": "warning",
    // ... SIN ID
  }
]

// ✅ REQUERIDO:
[
  {
    "id": "alert_001",  // ← DEBE EXISTIR
    "type": "high_latency",
    "severity": "warning",
    // ...
  }
]
```

**Impacto**: Botón de resolver alertas no aparece, requests fallan con 404.

**Solución**:
```python
# Backend FastAPI example
alerts = [
    {
        "id": f"alert_{uuid.uuid4().hex[:8]}",  # Generar ID único
        "type": "high_latency",
        # ...resto de campos
    }
]
```

---

#### 2. ❌ Nombres de Campos Incorrectos en Dashboard Summary
**Endpoint Afectado**: `GET /api/stats/dashboard/summary`

**Problema**:
```json
// ❌ ACTUAL:
{
  "total_queries_24h": 2735,
  "avg_accuracy": 87.71
}

// ✅ REQUERIDO:
{
  "daily_queries": 2735,      // ← Cambiar nombre
  "global_accuracy": 87.71    // ← Cambiar nombre
}
```

**Impacto**: Frontend usa fallback (muestra 0 o "N/A"), pero datos no se muestran correctamente.

**Solución**:
```python
# Backend FastAPI example
summary = {
    "daily_queries": get_daily_queries(),      # NO "total_queries_24h"
    "global_accuracy": get_accuracy(),         # NO "avg_accuracy"
    # ...resto de campos correctos
}
```

---

#### 3. 🔥 CRÍTICO: Contador de Queries Incluye Requests de Stats
**Endpoint Afectado**: `GET /api/stats/dashboard/summary`  
**Campo**: `daily_queries`

**Problema**: El contador `daily_queries` incrementa con CADA request, incluyendo:
- ❌ `GET /api/stats/dashboard/summary` (cada 30s)
- ❌ `GET /api/stats/services/status` (cada 10s)
- ❌ `GET /api/stats/alerts/active` (cada 15s)
- ❌ `GET /api/stats/activity/recent` (cada 30s)
- ❌ `POST /api/stats/admin/resolve-alert/*`
- ❌ Cualquier refresh (F5) del dashboard

**Resultado**: El contador aumenta descontroladamente (ej: +1000 solo por tener el dashboard abierto).

**Solución Requerida**: Ver documento específico `STATS_QUERY_COUNTER_FIX.md`.

**Endpoints que NO deben contar**:
- `/api/stats/*` - Endpoints de estadísticas
- `/api/admin/*` - Endpoints administrativos
- `/api/metrics/*` - Endpoints de métricas
- `/health` - Health checks

**Endpoints que SÍ deben contar** (solo demos AI):
- `/proxy/{model_port}/completion` - Chatbot LLM
- `/proxy/{model_port}/v1/chat/completions` - Chatbot LLM (formato OpenAI)
- `/api/rag/query` - RAG query
- `/api/rag/upload` - RAG upload
- `/api/fraude/predict_single_transaction` - Fraude detection
- `/api/textosql/generate` - Text-to-SQL generation

---

### Prioridad Media (No bloqueantes)

#### 4. ⚠️ Campo `service_type` Inconsistente
**Endpoint Afectado**: `GET /api/stats/services/status`

**Problema**: Algunos servicios no tienen `service_type` o tienen valores incorrectos.

**Valores Permitidos**:
- `"llm"` - Modelos de lenguaje
- `"fraud"` - Detección de fraude
- `"textosql"` - Text-to-SQL
- `"rag"` - RAG API

**Verificación**:
```bash
curl http://localhost:8003/api/stats/services/status | jq '.[].service_type'
```

---

## ✅ Testing y Verificación

### Comandos de Verificación

#### 1. Dashboard Summary
```bash
curl http://localhost:8003/api/stats/dashboard/summary | jq
```

**Validar**:
- ✅ Campo `daily_queries` (no `total_queries_24h`)
- ✅ Campo `global_accuracy` (no `avg_accuracy`)
- ✅ Todos los campos numéricos ≥ 0
- ✅ `timestamp` en formato ISO 8601

---

#### 2. Services Status
```bash
curl http://localhost:8003/api/stats/services/status | jq
```

**Validar**:
- ✅ Array con al menos 1 servicio
- ✅ Todos tienen campo `service_type`
- ✅ `service_type` es uno de: "llm", "fraud", "textosql", "rag"
- ✅ `status` es uno de: "online", "offline", "error", "degraded"

---

#### 3. Active Alerts
```bash
curl http://localhost:8003/api/stats/alerts/active | jq
```

**Validar**:
- ✅ Cada alerta tiene campo `id` (string único)
- ✅ `severity` es uno de: "info", "warning", "critical"
- ✅ `timestamp` en formato ISO 8601

**Probar Resolución**:
```bash
# Obtener ID de una alerta
ALERT_ID=$(curl -s http://localhost:8003/api/stats/alerts/active | jq -r '.[0].id')

# Intentar resolver
curl -X POST "http://localhost:8003/api/stats/admin/resolve-alert/${ALERT_ID}?resolved_by=admin"
```

**Resultado Esperado**: 200 OK (no 404)

---

#### 4. Recent Activity
```bash
curl 'http://localhost:8003/api/stats/activity/recent?limit=10' | jq
```

**Validar**:
- ✅ Array con máximo 10 items
- ✅ Ordenados por `timestamp` DESC (más reciente primero)
- ✅ Cada item tiene `id`, `type`, `service`, `status`, `timestamp`

---

### Frontend Testing

#### 1. Dashboard Page
```bash
# Abrir dashboard en navegador
http://52.117.41.85:2012/

# Verificar en Console del navegador:
# - ✅ Sin errores de "Cannot read properties of undefined"
# - ✅ Sin requests a /api/stats/admin/resolve-alert/undefined
# - ✅ Tarjetas muestran números (no "0" o "N/A")
# - ✅ Servicios LLM aparecen en sección de modelos
```

#### 2. Metrics Page
```bash
# Abrir métricas
http://52.117.41.85:2012/metrics

# Verificar:
# - ✅ Gráficos se renderizan correctamente
# - ✅ Tabla de servicios muestra todos los tipos
# - ✅ Botón "Exportar Excel" funciona
# - ✅ Sin errores en console
```

#### 3. Alerts Panel
```bash
# Si hay alertas activas:
# - ✅ Botón "Resolver" aparece solo si la alerta tiene ID
# - ✅ Clic en "Resolver" envía request con ID válido (no undefined)
# - ✅ Alerta desaparece después de resolver
```

---

## 📚 Documentos Relacionados

### 1. STATS_QUERY_COUNTER_FIX.md
Documento específico sobre cómo arreglar el contador de queries para que no incremente con requests de stats.

**Contenido**:
- Problema detallado con ejemplos
- Lista de endpoints a excluir
- Lista de endpoints a incluir
- Implementación sugerida (middleware FastAPI)
- Testing específico

### 2. FRONTEND_ENDPOINTS_VERIFICATION.md
Verificación de alineación entre frontend y backend (si existe).

### 3. STATS_API_ALIGNMENT_v2.md
Documentación de alineación de rutas (si existe).

---

## 🎯 Resumen de Acciones Requeridas

### Frontend ✅ (Completado)
- [x] Implementar optional chaining en FunctionalityMetrics.jsx
- [x] Implementar optional chaining en MetricsPage.jsx
- [x] Validar alert.id antes de mostrar botón de resolver
- [x] Agregar valores por defecto en todas las propiedades
- [x] Crear documentación completa

### Backend ⚠️ (Pendiente)

#### Prioridad Alta
- [ ] Agregar campo `id` a alertas en `/api/stats/alerts/active`
- [ ] Cambiar `total_queries_24h` → `daily_queries` en dashboard/summary
- [ ] Cambiar `avg_accuracy` → `global_accuracy` en dashboard/summary
- [ ] **CRÍTICO**: Filtrar contador de queries para excluir requests de stats (ver STATS_QUERY_COUNTER_FIX.md)

#### Prioridad Media
- [ ] Verificar que todos los servicios tengan `service_type` correcto
- [ ] Validar que todos los endpoints retornen timestamps ISO 8601
- [ ] Agregar tests unitarios para estructura de respuestas

#### Verificación Final
- [ ] Ejecutar comandos de testing (sección anterior)
- [ ] Verificar dashboard sin errores de console
- [ ] Probar resolución de alertas
- [ ] Verificar que contador de queries no aumente con F5

---

## 📝 Notas Importantes

### Compatibilidad con PPC64le
Este backend corre en arquitectura **PPC64le** (Power S1022) con **CentOS 9**. Cualquier cambio debe ser compatible con esta arquitectura.

### Docker y Setup Automático
Todo debe estar en `setup.sh` - **NO se permiten soluciones temporales** que requieran acciones manuales. El contenedor se destruye y despliega frecuentemente en servidores vírgenes.

### Recursos Limitados
Optimizar para **bajo consumo de CPU y memoria RAM**. Evitar operaciones costosas en endpoints que se llaman frecuentemente (cada 10-30s).

### Red Interna Docker
Frontend (Nginx) y Backend (Stats API) se comunican por red interna Docker (`app-network`). No exponer puertos innecesarios al exterior.

---

**Última Actualización**: 2025-12-04  
**Autor**: DevOps Team  
**Estado**: Documento consolidado y actualizado con todos los fixes aplicados
