# 📊 Actualización del Sistema de Métricas - Resumen de Cambios

## Fecha: 2025-12-01

---

## 🎯 Objetivos Completados

1. ✅ **Documentación API de Métricas**: `STATS_API_SPECIFICATION.md`
2. ✅ **Separación de Modelos y APIs** en el Dashboard
3. ✅ **Nueva Página de Métricas Detalladas**: `/metrics`
4. ✅ **Actividad Reciente Dinámica** (no hardcodeada)
5. ✅ **Actualización de servicios** para soportar nuevos endpoints
6. ✅ **Hooks actualizados** para consumir nuevos datos

---

## 📁 Archivos Creados

### 1. `STATS_API_SPECIFICATION.md`
Documentación completa de la API de estadísticas que el backend debe implementar:

**Endpoints documentados:**
- `GET /api/stats/dashboard/summary` - Resumen del dashboard
- `GET /api/stats/services/status` - Estado de modelos LLM y APIs
- `GET /api/stats/system/resources` - Recursos del sistema (CPU, RAM, disco)
- `GET /api/stats/trends/hourly` - Tendencias por hora
- `GET /api/stats/functionality/performance` - Rendimiento por funcionalidad
- `GET /api/stats/errors/recent` - Errores recientes
- `GET /api/stats/alerts/active` - Alertas activas
- `POST /api/stats/alerts/{id}/resolve` - Resolver alerta
- `GET /api/stats/activity/recent` - Actividad reciente del sistema
- `GET /api/stats/metrics/detailed` - Métricas detalladas (nueva página)

**Estructura de Base de Datos:**
```sql
-- Tabla para métricas de API
CREATE TABLE api_metrics (
    id, timestamp, endpoint, http_method, status_code,
    response_time_ms, client_ip, funcionalidad, error_message
);

-- Tabla para salud de servicios
CREATE TABLE service_health (
    id, service_name, service_type, status, last_check,
    uptime_seconds, total_requests, successful_requests,
    failed_requests, avg_latency_ms, metadata
);
```

**Middleware de Python/FastAPI:**
- Ejemplo completo de middleware para registrar métricas
- Función para identificar funcionalidad automáticamente
- Logging asíncrono a PostgreSQL

### 2. `src/pages/MetricsPage.jsx`
Nueva página completa de métricas detalladas con:

**Features:**
- 📊 4 tarjetas de métricas principales
- 🔍 Filtros por timeframe (hoy, semana, mes) y funcionalidad
- 📈 Tabla de rendimiento por funcionalidad
- 📉 Distribución por código de estado HTTP
- 🏆 Top 5 endpoints más usados
- 🐌 Top 5 endpoints más lentos
- 📥 Exportación a Excel con múltiples hojas

**Datos mostrados:**
- Total requests, éxito/fallo, tasa de éxito
- Tiempo promedio, mediana, P95, P99
- Errores totales y distribución
- Análisis por funcionalidad
- Análisis por endpoint

---

## 📝 Archivos Modificados

### 1. `src/services/statsService.js`
**Cambios:**
- ✅ Nuevo método `getServicesStatus()` - obtiene modelos LLM + APIs
- ✅ Actualizado `getModelsStatus()` - backward compatibility
- ✅ Actualizado `getSystemResources()` - ruta corregida a `/system/resources`
- ✅ Nuevo método `getRecentActivity(limit)` - actividad reciente
- ✅ Nuevo método `getDetailedMetrics(params)` - métricas detalladas

**Endpoints actualizados:**
```javascript
'/dashboard/summary'          // antes: '/dashboard-summary'
'/services/status'            // NUEVO
'/system/resources'           // antes: '/system-resources'
'/activity/recent'            // NUEVO
'/metrics/detailed'           // NUEVO
```

### 2. `src/hooks/useStatsAPI.js`
**Nuevos hooks:**
- ✅ `useRecentActivity(limit, refreshInterval)` - actividad reciente
- ✅ `useServicesStatus(refreshInterval)` - modelos + APIs

**Exportado:**
```javascript
return {
  // ... hooks existentes
  useRecentActivity,
  useServicesStatus,
  // ...
};
```

### 3. `src/pages/DashboardPage.jsx`
**Cambios principales:**

**ANTES:**
```jsx
const { useModelsStatus } = useStatsAPI();
const { data: models } = useModelsStatus();

{/* Una sección con "Estado de Modelos IA" */}
{models.map(model => <ModelStatusCard model={model} />)}

{/* Actividad hardcodeada */}
{[
  { time: "Hace 2 min", action: "Modelo entrenado", type: "success" }
].map(...)}
```

**AHORA:**
```jsx
const { useServicesStatus, useRecentActivity } = useStatsAPI();
const { data: services } = useServicesStatus();
const { data: recentActivity } = useRecentActivity(10);

const models = services?.llm_models || [];
const apis = services?.api_endpoints || [];

{/* Dos secciones separadas */}
<Card>
  <h2>🧠 Modelos LLM</h2>
  {models.map(model => <ModelStatusCard model={model} />)}
</Card>

<Card>
  <h2>💻 APIs de Backend</h2>
  {apis.map(api => <ModelStatusCard model={api} isAPI={true} />)}
</Card>

{/* Actividad dinámica */}
{recentActivity.map(activity => (
  <div>
    <p>{activity.title}</p>
    <p>{new Date(activity.timestamp).toLocaleString()}</p>
  </div>
))}
```

**Estructura visual:**
- 4 tarjetas superiores (Modelos activos, Consultas, Tiempo, Precisión)
- 2 secciones separadas: Modelos LLM y APIs de Backend
- Actividad reciente con datos reales del backend
- Estados de carga y vacío mejorados

### 4. `src/components/stats/ModelStatusCard.jsx`
**Cambios:**
- ✅ Nuevo prop `isAPI` para diferenciar modelos de APIs
- ✅ Soporte para status: `online`, `offline`, `degraded`, `error`
- ✅ Muestra `display_name`, `service_name`, `avg_latency_ms`
- ✅ Calcula tasa de éxito: `successful_requests / total_requests`
- ✅ Soporte para metadata del servicio

**Antes vs Ahora:**
```jsx
// ANTES
<h3>{model.model_name}</h3>
<p>{model.model_type} • {model.model_size}</p>

// AHORA
<h3>{model.display_name || model.service_name}</h3>
<p>{isAPI ? `API ${metadata.version}` : `${model_type} • ${model_size}`}</p>
```

### 5. `src/components/Sidebar.jsx`
**Cambios:**
- ✅ Reorganización de menú
- ✅ Agregado enlace a `/metrics` con ícono `BarChart3`
- ✅ Agregados enlaces directos a todas las funcionalidades

**Menú actualizado:**
```
- Dashboard (/)
- Chatbot IA (/chatbot)
- Detección de Fraude (/fraud-detection)
- Text-to-SQL (/text-to-sql)
- Análisis Documentos (/document-analysis)
- Análisis NLP (/nlp)
- Generador Imágenes (/image-generator)
- Métricas Detalladas (/metrics) 🆕
- Analytics IA (/analytics)
- Configuración (/settings)
```

### 6. `src/App.jsx`
**Cambios:**
- ✅ Importado `MetricsPage`
- ✅ Agregado route `/metrics`

```jsx
import MetricsPage from "./pages/MetricsPage";

<Route path="/metrics" element={<MetricsPage />} />
```

---

## 🔧 Cambios Técnicos

### Componentes Stats

#### ResourcesGauge
**Debe mostrar (esperando del backend):**
- CPU usage percent
- Memory usage percent + total/used GB
- Disk usage percent + total/used GB
- Network sent/received MB

**Endpoint esperado:** `GET /api/stats/system/resources`

#### PerformanceChart
**Debe graficar (esperando del backend):**
- Tiempo de respuesta por hora
- Consultas por hora
- Datos de las últimas 24 horas

**Endpoint esperado:** `GET /api/stats/trends/hourly?hours=24`

#### ErrorsTable
**Debe mostrar (esperando del backend):**
- Timestamp, endpoint, status code
- Error type, error message
- Funcionalidad, client IP

**Endpoint esperado:** `GET /api/stats/errors/recent?limit=20`

#### FunctionalityMetrics
**Debe mostrar (esperando del backend):**
- Total requests por funcionalidad
- Success rate, avg response time
- Most used endpoint, peak hour

**Endpoint esperado:** `GET /api/stats/functionality/performance`

#### AlertsPanel
**Debe mostrar (esperando del backend):**
- Alertas activas con severidad (critical, warning, info)
- Timestamp, funcionalidad
- Botón para resolver

**Endpoints esperados:**
- `GET /api/stats/alerts/active`
- `POST /api/stats/alerts/{id}/resolve`

---

## 📊 Estructura de Datos Esperada

### Dashboard Summary
```json
{
  "active_models": 5,
  "error_models": 0,
  "active_apis": 4,
  "error_apis": 0,
  "daily_queries": 1247,
  "daily_successful_queries": 1198,
  "avg_response_time": 0.85,
  "global_accuracy": 96.8
}
```

### Services Status
```json
{
  "llm_models": [
    {
      "service_name": "gemma-2b",
      "display_name": "Gemma 2B",
      "status": "online",
      "uptime_seconds": 86400,
      "total_requests": 342,
      "successful_requests": 340,
      "avg_latency_ms": 245.3,
      "metadata": { "port": 8085 }
    }
  ],
  "api_endpoints": [
    {
      "service_name": "fraud_detection_api",
      "display_name": "Fraud Detection API",
      "status": "online",
      "uptime_seconds": 172800,
      "total_requests": 1523,
      "successful_requests": 1510,
      "avg_latency_ms": 156.2,
      "metadata": { "host": "fraud-api", "port": 8001 }
    }
  ]
}
```

### Recent Activity
```json
{
  "activities": [
    {
      "id": "activity_5234",
      "timestamp": "2025-12-01T14:28:00Z",
      "type": "model_health_check",
      "severity": "info",
      "title": "Health check completado",
      "description": "Todos los modelos LLM están operativos"
    }
  ]
}
```

---

## 🚀 Próximos Pasos para el Backend

### 1. Crear Tablas en PostgreSQL
Ejecutar DDL del archivo `STATS_API_SPECIFICATION.md`:
- `api_metrics` - métricas de cada request
- `service_health` - estado de cada servicio

### 2. Implementar Middleware
Agregar middleware a FastAPI que registre:
- Endpoint, método, status code
- Tiempo de respuesta
- IP del cliente, funcionalidad
- Errores y excepciones

### 3. Implementar Endpoints
Crear los 10 endpoints documentados en `/api/stats/`:
- `/dashboard/summary`
- `/services/status`
- `/system/resources`
- `/trends/hourly`
- `/functionality/performance`
- `/errors/recent`
- `/alerts/active`
- `/alerts/{id}/resolve`
- `/activity/recent`
- `/metrics/detailed`

### 4. Health Checks Automáticos
Implementar job que cada 30 segundos:
- Ping a todos los modelos LLM
- Ping a todas las APIs de backend
- Actualizar tabla `service_health`

### 5. Sistema de Alertas
Implementar reglas para generar alertas:
- Error rate > 5%
- Avg response time > 2s
- Service offline > 5 min
- CPU/Memory > 90%

---

## 📸 Screenshots (esperadas)

### Dashboard
- ✅ 4 tarjetas: Modelos activos, Consultas, Tiempo, Precisión
- ✅ 2 secciones: Modelos LLM (5 cards) + APIs Backend (4 cards)
- ✅ Panel de alertas activas
- ✅ Gráficos de rendimiento (tiempo de respuesta + consultas/hora)
- ✅ Actividad reciente con datos reales

### Página de Métricas (/metrics)
- ✅ Filtros por timeframe y funcionalidad
- ✅ 4 tarjetas de métricas principales
- ✅ Tabla de rendimiento por funcionalidad
- ✅ Distribución por HTTP status code
- ✅ Top endpoints más usados
- ✅ Top endpoints más lentos
- ✅ Botón para exportar a Excel

---

## 🔍 Testing

### Verificar Frontend (sin backend):
```bash
cd IBM-AI-FRONT
npm run dev
```

**Navegación:**
1. Dashboard (/) - verás placeholders si no hay backend
2. Métricas (/metrics) - mostrará "Error al cargar métricas"

### Verificar con Mock Data:
Temporalmente, puedes crear data mock en `statsService.js`:
```javascript
async getDashboardSummary() {
  // return await statsAPI.get('/dashboard/summary');
  return {
    active_models: 5,
    error_models: 0,
    daily_queries: 1247,
    // ...
  };
}
```

### Verificar Backend (cuando esté listo):
```bash
curl http://localhost:2012/api/stats/dashboard/summary
curl http://localhost:2012/api/stats/services/status
curl http://localhost:2012/api/stats/system/resources
```

---

## 📝 Notas Importantes

1. **Backward Compatibility**: `useModelsStatus()` sigue funcionando pero internamente usa `useServicesStatus()`

2. **Timezone**: Todos los timestamps deben estar en UTC (ISO 8601 con 'Z')

3. **Refresh Intervals**:
   - Dashboard summary: cada 30s
   - Services status: cada 30s
   - System resources: cada 10s
   - Alertas: cada 60s
   - Actividad reciente: cada 60s

4. **Estados de Loading**: Todos los componentes tienen estados de carga y vacío

5. **Error Handling**: Todos los endpoints tienen try/catch y muestran errores al usuario

---

## ✅ Checklist para Deployment

- [ ] Backend implementa tabla `api_metrics`
- [ ] Backend implementa tabla `service_health`
- [ ] Backend implementa middleware de métricas
- [ ] Backend implementa 10 endpoints de `/api/stats/`
- [ ] Backend implementa health checks automáticos
- [ ] Backend implementa sistema de alertas
- [ ] Frontend compilado con `npm run build`
- [ ] Docker compose actualizado con variables de entorno
- [ ] Nginx config actualizado con proxy `/api/stats/`
- [ ] Testing de todos los endpoints
- [ ] Verificación de métricas en tiempo real
- [ ] Verificación de exportación a Excel

---

**Contacto**: Si el backend tiene dudas sobre algún endpoint, consultar `STATS_API_SPECIFICATION.md`
