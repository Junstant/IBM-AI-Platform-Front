# 🔄 Alineación Frontend-Backend - IBM AI Platform

## Versión: 2.0.0
## Fecha: 2025-12-01

Este documento describe todos los cambios realizados en el frontend para alinearse con la especificación del backend (`STATS_API_SPECIFICATION.md v2.0.0`).

---

## ✅ Cambios Realizados

### 1. **Nombres de Funcionalidades Estandarizados**

El frontend ahora usa los mismos nombres que el backend para identificar funcionalidades:

| Frontend Anterior | Backend/Frontend Nuevo | Descripción |
|------------------|------------------------|-------------|
| `fraud-detection` | `fraud_detection` | Detección de fraude |
| `text-to-sql` | `text_to_sql` | Conversión texto a SQL |
| `rag-documents` | `rag_documents` | Sistema RAG documentos |
| `nlp-analysis` | `nlp_analysis` | Análisis de lenguaje natural |
| `chatbot` | `chatbot` | ✅ Ya correcto |

**Archivos actualizados:**
- ✅ `src/pages/MetricsPage.jsx` - Options en select de funcionalidad
- ✅ `src/services/statsService.js` - Documentación de tipos

---

### 2. **Estructura de Datos del Dashboard**

**Backend envía (STATS_API_SPECIFICATION.md):**
```json
{
  "active_models": 5,           // ✅ Modelos LLM activos
  "error_models": 0,            // ✅ Modelos LLM con error
  "active_apis": 4,             // ✨ NUEVO: APIs activas
  "error_apis": 0,              // ✨ NUEVO: APIs con error
  "daily_queries": 1247,        // ✅ Total de consultas hoy
  "daily_successful_queries": 1198,  // ✅ Consultas exitosas
  "daily_failed_queries": 49,   // ✨ NUEVO: Consultas fallidas
  "avg_response_time": 0.85,    // ✅ Tiempo promedio (segundos)
  "global_accuracy": 96.8,      // ✅ Precisión global (%)
  "timestamp": "2025-12-01T14:30:00Z"  // ✨ NUEVO: Timestamp
}
```

**Frontend espera:**
- ✅ `active_models` - Se usa en tarjeta "Modelos Activos"
- ✅ `error_models` - Se usa para mostrar errores
- ✅ `daily_queries` - Se usa en tarjeta "Consultas Hoy"
- ✅ `daily_successful_queries` - Para calcular tasa de éxito
- ✅ `avg_response_time` - Tarjeta "Tiempo de Respuesta"
- ✅ `global_accuracy` - Tarjeta "Precisión Global"

**Archivos actualizados:**
- ✅ `src/services/statsService.js` - Documentación de tipo `DashboardSummary`
- ✅ `src/pages/DashboardPage.jsx` - Ya usa campos correctos

---

### 3. **Servicios y Modelos (LLM + APIs)**

**Backend envía:**
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
      "failed_requests": 2,
      "avg_latency_ms": 245.3,
      "last_check": "2025-12-01T14:29:55Z",
      "metadata": {
        "port": 8085,
        "model_version": "1.0",
        "context_length": 8192
      }
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
      "failed_requests": 13,
      "avg_latency_ms": 156.2,
      "last_check": "2025-12-01T14:30:00Z",
      "metadata": {
        "host": "fraud-api",
        "port": 8001,
        "version": "2.1.0"
      }
    }
  ]
}
```

**Cambios de campos:**
| Campo Anterior | Campo Nuevo | Tipo |
|---------------|-------------|------|
| `model_id` | `service_name` | string |
| `name` | `display_name` | string |
| `uptime` | `uptime_seconds` | number |
| `requests_count` | `total_requests` | number |
| ➖ N/A | `successful_requests` | number ✨ NUEVO |
| ➖ N/A | `failed_requests` | number ✨ NUEVO |
| `avg_latency` | `avg_latency_ms` | number |
| ➖ N/A | `last_check` | string ✨ NUEVO |

**Archivos actualizados:**
- ✅ `src/services/statsService.js` - Tipo `ServiceStatus` actualizado
- ✅ `src/components/stats/ModelStatusCard.jsx` - Ya usa `service_name`, `display_name`, etc.
- ✅ `src/hooks/useStatsAPI.js` - Hook `useServicesStatus`

---

### 4. **Endpoints Actualizados**

Todos los endpoints ahora coinciden con la especificación del backend:

| Endpoint Anterior | Endpoint Nuevo | Método |
|------------------|----------------|--------|
| `/dashboard-summary` | `/dashboard/summary` | GET |
| `/models-status` | `/services/status` | GET |
| `/system-resources` | `/system/resources` | GET |
| `/hourly-trends` | `/trends/hourly` | GET |
| `/functionality-performance` | `/functionality/performance` | GET |
| `/recent-errors` | `/errors/recent` | GET |
| `/alerts` | `/alerts/active` | GET |
| ➖ N/A | `/activity/recent` | GET ✨ NUEVO |
| ➖ N/A | `/metrics/detailed` | GET ✨ NUEVO |

**Query Parameters añadidos:**
- `/errors/recent?limit=20` - Límite de errores
- `/trends/hourly?hours=24` - Horas hacia atrás
- `/activity/recent?limit=10` - Límite de actividades
- `/metrics/detailed?timeframe=today&funcionalidad=all` - Filtros avanzados

**Archivos actualizados:**
- ✅ `src/services/statsService.js` - Todos los métodos actualizados
- ✅ `src/hooks/useStatsAPI.js` - Todos los hooks actualizados

---

### 5. **Alertas (Estructura Completa)**

**Backend envía:**
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "type": "high_error_rate",
      "severity": "warning",
      "title": "Tasa de errores elevada",           // ✨ NUEVO
      "message": "La tasa de errores en Text-to-SQL supera el 5%",
      "timestamp": "2025-12-01T14:20:00Z",
      "funcionalidad": "text_to_sql",             // ✨ NUEVO
      "resolved": false,
      "metadata": {                                // ✨ NUEVO
        "error_rate": 7.2,
        "threshold": 5.0
      }
    }
  ],
  "total_active": 2,                              // ✨ NUEVO
  "timestamp": "2025-12-01T14:30:00Z"            // ✨ NUEVO
}
```

**Campos nuevos:**
- `title` - Título de la alerta
- `funcionalidad` - Funcionalidad relacionada
- `metadata` - Datos adicionales contextuales

**Archivos actualizados:**
- ✅ `src/services/statsService.js` - Tipo `Alert` actualizado
- ✅ `src/hooks/useStatsAPI.js` - `useAlerts()` extrae `result?.alerts`

---

### 6. **Actividad Reciente**

**Backend envía:**
```json
{
  "activities": [
    {
      "id": "activity_5234",
      "timestamp": "2025-12-01T14:28:00Z",
      "type": "model_health_check",
      "severity": "info",
      "title": "Health check completado",
      "description": "Todos los modelos LLM están operativos",
      "user": "system",
      "metadata": {
        "models_checked": 5,
        "all_healthy": true
      }
    }
  ],
  "total_today": 48,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend usa:**
- `activities[]` - Array de eventos
- `timestamp` - Para formatear fecha
- `title` - Título del evento
- `severity` - Para color coding (info, warning, success, critical)

**Archivos actualizados:**
- ✅ `src/services/statsService.js` - Tipo `Activity` documentado
- ✅ `src/hooks/useStatsAPI.js` - `useRecentActivity()` extrae `result?.activities`
- ✅ `src/pages/DashboardPage.jsx` - Ya renderiza actividades dinámicas

---

### 7. **Recursos del Sistema**

**Backend envía:**
```json
{
  "cpu_usage_percent": 45.3,
  "memory_usage_percent": 62.8,
  "memory_total_gb": 16.0,
  "memory_used_gb": 10.05,
  "disk_usage_percent": 38.5,
  "disk_total_gb": 500.0,
  "disk_used_gb": 192.5,
  "network_sent_mb": 2345.6,
  "network_recv_mb": 8976.2,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend usa:**
- ✅ Todos los campos directamente sin transformación
- ✅ `ResourcesGauge` component espera esta estructura

**Archivos actualizados:**
- ✅ `src/hooks/useStatsAPI.js` - `useSystemResources()` usa `/system/resources`

---

### 8. **Tendencias por Hora**

**Backend envía:**
```json
{
  "period_start": "2025-11-30T14:30:00Z",
  "period_end": "2025-12-01T14:30:00Z",
  "data": [
    {
      "hour": "2025-11-30T14:00:00Z",
      "requests_count": 52,
      "successful_requests": 50,
      "failed_requests": 2,
      "avg_response_time_ms": 234.5,
      "total_errors": 2
    }
  ]
}
```

**Frontend usa:**
- `data[]` - Array de puntos en el tiempo
- `hour` - Timestamp del punto
- `requests_count`, `avg_response_time_ms`, etc.

**Archivos actualizados:**
- ✅ `src/hooks/useStatsAPI.js` - `useHourlyTrends()` extrae `result?.data`

---

### 9. **Performance por Funcionalidad**

**Backend envía:**
```json
{
  "functionalities": [
    {
      "name": "chatbot",
      "display_name": "Chatbot",
      "total_requests": 423,
      "successful_requests": 418,
      "failed_requests": 5,
      "avg_response_time_ms": 856.3,
      "success_rate": 98.8,
      "error_rate": 1.2,
      "most_used_endpoint": "/api/llm/completion",
      "peak_hour": "10:00-11:00"
    }
  ],
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Cambios:**
- Root level: `functionalities[]` en lugar de array directo
- Campos: `name`, `display_name`, `total_requests`, etc.

**Archivos actualizados:**
- ✅ `src/hooks/useStatsAPI.js` - `useFunctionalityPerformance()` extrae `result?.functionalities`

---

### 10. **Errores Recientes**

**Backend envía:**
```json
{
  "errors": [
    {
      "id": 12458,
      "timestamp": "2025-12-01T14:25:32Z",
      "endpoint": "/api/fraude/predict_all_from_db",
      "http_method": "GET",
      "status_code": 500,
      "error_type": "DatabaseConnectionError",
      "error_message": "Could not connect to PostgreSQL",
      "funcionalidad": "fraud_detection",
      "client_ip": "172.18.0.5",
      "response_time_ms": 5234.2
    }
  ],
  "total_errors_today": 49,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Campos nuevos:**
- `funcionalidad` - Funcionalidad que generó el error
- `error_type` - Tipo de excepción
- `response_time_ms` - Tiempo antes del error

**Archivos actualizados:**
- ✅ `src/hooks/useStatsAPI.js` - `useRecentErrors()` extrae `result?.errors`

---

### 11. **Métricas Detalladas (Página /metrics)**

**Backend envía:**
```json
{
  "period": {
    "start": "2025-12-01T00:00:00Z",
    "end": "2025-12-01T23:59:59Z",
    "timeframe": "today"
  },
  "summary": {
    "total_requests": 1247,
    "successful_requests": 1198,
    "failed_requests": 49,
    "avg_response_time_ms": 856.3,
    "median_response_time_ms": 456.2,      // ✨ NUEVO
    "p95_response_time_ms": 2134.5,        // ✨ NUEVO: Percentil 95
    "p99_response_time_ms": 3456.7,        // ✨ NUEVO: Percentil 99
    "success_rate": 96.1,
    "total_data_transferred_mb": 145.6
  },
  "by_functionality": [...],
  "by_status_code": {...},
  "top_endpoints": [...],
  "slowest_endpoints": [...]
}
```

**Nuevos campos de percentiles:**
- `median_response_time_ms` - Mediana (P50)
- `p95_response_time_ms` - Percentil 95
- `p99_response_time_ms` - Percentil 99

**Archivos actualizados:**
- ✅ `src/pages/MetricsPage.jsx` - Ya espera esta estructura
- ✅ Muestra P95 y median en tarjetas

---

## 📋 Resumen de Compatibilidad

### ✅ Totalmente Alineado
- [x] Dashboard Summary (4 tarjetas principales)
- [x] Services Status (modelos + APIs separados)
- [x] Alertas activas
- [x] Actividad reciente
- [x] Errores recientes
- [x] Tendencias por hora
- [x] Performance por funcionalidad
- [x] Recursos del sistema
- [x] Métricas detalladas

### 🔄 Cambios de Endpoints
- [x] Todos los endpoints actualizados a nueva estructura
- [x] Query parameters añadidos donde corresponde
- [x] Tipos TypeScript/JSDoc documentados

### 📝 Documentación
- [x] `statsService.js` - Tipos actualizados
- [x] `useStatsAPI.js` - Hooks actualizados
- [x] Este documento (`FRONTEND_BACKEND_ALIGNMENT.md`)

---

## 🚀 Próximos Pasos para Backend

1. **Crear tablas PostgreSQL:**
   ```sql
   CREATE TABLE api_metrics (...);
   CREATE TABLE service_health (...);
   ```

2. **Implementar middleware de métricas** (ver `STATS_API_SPECIFICATION.md`)

3. **Implementar endpoints en orden de prioridad:**
   - **Alta**: `/dashboard/summary`, `/services/status`, `/system/resources`
   - **Media**: `/functionality/performance`, `/errors/recent`, `/alerts/active`
   - **Baja**: `/metrics/detailed`

4. **Health checks automáticos:**
   - Cron job cada 30 segundos
   - Actualizar tabla `service_health`

5. **Sistema de alertas:**
   - Reglas de threshold (error_rate > 5%, response_time > 2s)
   - Insertar en tabla de alertas

---

## 📊 Testing Frontend

El frontend está listo para recibir datos del backend. Para probar:

1. **Dashboard**: Visitar `/` - Espera datos de `/api/stats/dashboard/summary`
2. **Métricas**: Visitar `/metrics` - Espera datos de `/api/stats/metrics/detailed`
3. **Componentes individuales**: ResourcesGauge, PerformanceChart, etc.

**Fallback behavior:**
- Si endpoint no responde: Muestra loading state
- Si endpoint retorna error: Muestra empty state con mensaje
- Si datos incompletos: Usa valores por defecto (0, "N/A", etc.)

---

## 🔗 Referencias

- **Especificación Backend**: `STATS_API_SPECIFICATION.md`
- **Resumen de Cambios**: `METRICS_UPDATE_SUMMARY.md`
- **Configuración Frontend**: `src/config/environment.js`

---

**Fecha de última actualización**: 2025-12-01
**Versión del frontend**: 2.0.0
**Versión de la API esperada**: 2.0.0
