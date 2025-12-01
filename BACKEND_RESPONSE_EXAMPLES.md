# 🔌 Ejemplos de Respuestas Backend - IBM AI Platform

## Versión: 2.0.0
## Fecha: 2025-12-01

Este documento contiene ejemplos EXACTOS de cómo el backend debe responder a cada endpoint para que el frontend funcione correctamente.

---

## 1. Dashboard Summary
**Endpoint**: `GET /api/stats/dashboard/summary`

**Response (200 OK)**:
```json
{
  "active_models": 5,
  "error_models": 0,
  "active_apis": 4,
  "error_apis": 0,
  "daily_queries": 1247,
  "daily_successful_queries": 1198,
  "daily_failed_queries": 49,
  "avg_response_time": 0.85,
  "global_accuracy": 96.8,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend Usa**:
- `active_models` → Tarjeta "Modelos Activos"
- `daily_queries` → Tarjeta "Consultas Hoy"
- `avg_response_time` → Tarjeta "Tiempo de Respuesta"
- `global_accuracy` → Tarjeta "Precisión Global"

---

## 2. Services Status (Models + APIs)
**Endpoint**: `GET /api/stats/services/status`

**Response (200 OK)**:
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
    },
    {
      "service_name": "gemma-4b",
      "display_name": "Gemma 4B",
      "status": "online",
      "uptime_seconds": 86100,
      "total_requests": 289,
      "successful_requests": 285,
      "failed_requests": 4,
      "avg_latency_ms": 389.7,
      "last_check": "2025-12-01T14:29:58Z",
      "metadata": {
        "port": 8086,
        "model_version": "1.0",
        "context_length": 8192
      }
    },
    {
      "service_name": "mistral-7b",
      "display_name": "Mistral 7B",
      "status": "online",
      "uptime_seconds": 85900,
      "total_requests": 589,
      "successful_requests": 585,
      "failed_requests": 4,
      "avg_latency_ms": 412.7,
      "last_check": "2025-12-01T14:29:59Z",
      "metadata": {
        "port": 8088,
        "model_version": "0.3",
        "context_length": 32768
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
    },
    {
      "service_name": "rag_api",
      "display_name": "RAG Document API",
      "status": "online",
      "uptime_seconds": 172500,
      "total_requests": 892,
      "successful_requests": 885,
      "failed_requests": 7,
      "avg_latency_ms": 523.8,
      "last_check": "2025-12-01T14:29:57Z",
      "metadata": {
        "host": "rag-api",
        "port": 8002,
        "version": "3.0.1"
      }
    },
    {
      "service_name": "textosql_api",
      "display_name": "Text-to-SQL API",
      "status": "online",
      "uptime_seconds": 172300,
      "total_requests": 634,
      "successful_requests": 620,
      "failed_requests": 14,
      "avg_latency_ms": 1234.5,
      "last_check": "2025-12-01T14:29:56Z",
      "metadata": {
        "host": "textosql-api",
        "port": 8003,
        "version": "1.5.2"
      }
    },
    {
      "service_name": "stats_api",
      "display_name": "Stats API",
      "status": "online",
      "uptime_seconds": 172700,
      "total_requests": 2341,
      "successful_requests": 2338,
      "failed_requests": 3,
      "avg_latency_ms": 45.2,
      "last_check": "2025-12-01T14:30:00Z",
      "metadata": {
        "host": "stats-api",
        "port": 8004,
        "version": "2.0.0"
      }
    }
  ]
}
```

**Frontend Usa**:
- `llm_models[]` → Sección "🧠 Modelos LLM" del Dashboard
- `api_endpoints[]` → Sección "💻 APIs de Backend" del Dashboard
- `status` → Color coding (online=verde, offline=gris, error=rojo)
- `successful_requests / total_requests` → Cálculo de tasa de éxito

---

## 3. System Resources
**Endpoint**: `GET /api/stats/system/resources`

**Response (200 OK)**:
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

**Frontend Usa**:
- `cpu_usage_percent` → Gauge de CPU
- `memory_usage_percent` → Gauge de Memoria
- `disk_usage_percent` → Gauge de Disco
- Color coding: <50% verde, 50-80% amarillo, >80% rojo

---

## 4. Hourly Trends
**Endpoint**: `GET /api/stats/trends/hourly?hours=24`

**Response (200 OK)**:
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
    },
    {
      "hour": "2025-11-30T15:00:00Z",
      "requests_count": 67,
      "successful_requests": 65,
      "failed_requests": 2,
      "avg_response_time_ms": 198.3,
      "total_errors": 2
    },
    {
      "hour": "2025-11-30T16:00:00Z",
      "requests_count": 89,
      "successful_requests": 87,
      "failed_requests": 2,
      "avg_response_time_ms": 245.1,
      "total_errors": 2
    }
    // ... 21 horas más (total 24 puntos)
  ]
}
```

**Frontend Usa**:
- `data[]` → Array de puntos para el gráfico de línea
- `hour` → Eje X (timestamps)
- `requests_count`, `avg_response_time_ms` → Eje Y

---

## 5. Functionality Performance
**Endpoint**: `GET /api/stats/functionality/performance`

**Response (200 OK)**:
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
    },
    {
      "name": "fraud_detection",
      "display_name": "Detección de Fraude",
      "total_requests": 312,
      "successful_requests": 308,
      "failed_requests": 4,
      "avg_response_time_ms": 234.1,
      "success_rate": 98.7,
      "error_rate": 1.3,
      "most_used_endpoint": "/api/fraude/predict_single_transaction",
      "peak_hour": "14:00-15:00"
    },
    {
      "name": "text_to_sql",
      "display_name": "Text-to-SQL",
      "total_requests": 189,
      "successful_requests": 182,
      "failed_requests": 7,
      "avg_response_time_ms": 1234.7,
      "success_rate": 96.3,
      "error_rate": 3.7,
      "most_used_endpoint": "/api/textosql/query",
      "peak_hour": "09:00-10:00"
    },
    {
      "name": "rag_documents",
      "display_name": "RAG Documentos",
      "total_requests": 156,
      "successful_requests": 152,
      "failed_requests": 4,
      "avg_response_time_ms": 678.9,
      "success_rate": 97.4,
      "error_rate": 2.6,
      "most_used_endpoint": "/api/rag/query",
      "peak_hour": "11:00-12:00"
    }
  ],
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend Usa**:
- `functionalities[]` → Tabla de performance
- `name` → Identificador (debe ser snake_case)
- `success_rate` → Color coding en tabla

---

## 6. Recent Errors
**Endpoint**: `GET /api/stats/errors/recent?limit=20`

**Response (200 OK)**:
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
      "error_message": "Could not connect to PostgreSQL: connection timeout",
      "funcionalidad": "fraud_detection",
      "client_ip": "172.18.0.5",
      "response_time_ms": 5234.2
    },
    {
      "id": 12450,
      "timestamp": "2025-12-01T14:18:15Z",
      "endpoint": "/api/textosql/query",
      "http_method": "POST",
      "status_code": 400,
      "error_type": "ValidationError",
      "error_message": "Invalid database_id: 'invalid_db'",
      "funcionalidad": "text_to_sql",
      "client_ip": "172.18.0.5",
      "response_time_ms": 12.3
    }
  ],
  "total_errors_today": 49,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend Usa**:
- `errors[]` → Tabla de errores recientes
- `error_type` → Badge de tipo de error
- `funcionalidad` → Para filtrar por página

---

## 7. Active Alerts
**Endpoint**: `GET /api/stats/alerts/active`

**Response (200 OK)**:
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "type": "high_error_rate",
      "severity": "warning",
      "title": "Tasa de errores elevada",
      "message": "La tasa de errores en Text-to-SQL supera el 5% (actual: 7.2%)",
      "timestamp": "2025-12-01T14:20:00Z",
      "funcionalidad": "text_to_sql",
      "resolved": false,
      "metadata": {
        "error_rate": 7.2,
        "threshold": 5.0
      }
    },
    {
      "id": "alert_002",
      "type": "slow_response",
      "severity": "critical",
      "title": "Tiempo de respuesta crítico",
      "message": "Mistral 7B tiene un tiempo de respuesta promedio de 5.2s (esperado: <2s)",
      "timestamp": "2025-12-01T13:45:00Z",
      "funcionalidad": "chatbot",
      "resolved": false,
      "metadata": {
        "avg_response_time": 5.2,
        "threshold": 2.0,
        "model": "mistral-7b"
      }
    }
  ],
  "total_active": 2,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend Usa**:
- `alerts[]` → Lista de alertas en Dashboard
- `severity` → Color coding (critical=rojo, warning=amarillo, info=azul)
- `title` → Título de la alerta (antes solo había `message`)

---

## 8. Recent Activity
**Endpoint**: `GET /api/stats/activity/recent?limit=10`

**Response (200 OK)**:
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
    },
    {
      "id": "activity_5233",
      "timestamp": "2025-12-01T14:15:00Z",
      "type": "high_traffic",
      "severity": "warning",
      "title": "Tráfico elevado detectado",
      "description": "El endpoint /api/fraude/predict_single_transaction recibió 120 requests en 5 minutos",
      "user": "system",
      "metadata": {
        "endpoint": "/api/fraude/predict_single_transaction",
        "requests_count": 120,
        "time_window_minutes": 5
      }
    },
    {
      "id": "activity_5232",
      "timestamp": "2025-12-01T14:00:00Z",
      "type": "backup_completed",
      "severity": "success",
      "title": "Backup de base de datos completado",
      "description": "Backup automático de PostgreSQL finalizado exitosamente",
      "user": "system",
      "metadata": {
        "database": "bank_transactions",
        "backup_size_mb": 234.5,
        "duration_seconds": 12.3
      }
    }
  ],
  "total_today": 48,
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend Usa**:
- `activities[]` → Feed de actividad en Dashboard (reemplaza hardcoded data)
- `severity` → Color coding (success=verde, warning=amarillo, info=azul, critical=rojo)
- `timestamp` → Se formatea con `new Date().toLocaleString()`

---

## 9. Detailed Metrics (Página /metrics)
**Endpoint**: `GET /api/stats/metrics/detailed?timeframe=today&funcionalidad=all`

**Response (200 OK)**:
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
    "median_response_time_ms": 456.2,
    "p95_response_time_ms": 2134.5,
    "p99_response_time_ms": 3456.7,
    "success_rate": 96.1,
    "total_data_transferred_mb": 145.6
  },
  "by_functionality": [
    {
      "funcionalidad": "chatbot",
      "requests": 423,
      "success_rate": 98.8,
      "avg_response_time_ms": 856.3,
      "total_errors": 5,
      "endpoints": [
        {
          "endpoint": "/proxy/8085/completion",
          "requests": 145,
          "avg_response_time_ms": 678.2
        },
        {
          "endpoint": "/proxy/8088/completion",
          "requests": 189,
          "avg_response_time_ms": 912.4
        }
      ]
    },
    {
      "funcionalidad": "fraud_detection",
      "requests": 312,
      "success_rate": 98.7,
      "avg_response_time_ms": 234.1,
      "total_errors": 4
    }
  ],
  "by_status_code": {
    "200": 1145,
    "201": 53,
    "400": 12,
    "404": 18,
    "500": 19
  },
  "top_endpoints": [
    {
      "endpoint": "/api/fraude/predict_single_transaction",
      "requests": 234,
      "avg_response_time_ms": 234.1,
      "success_rate": 99.1
    },
    {
      "endpoint": "/proxy/8088/completion",
      "requests": 189,
      "avg_response_time_ms": 912.4,
      "success_rate": 98.4
    }
  ],
  "slowest_endpoints": [
    {
      "endpoint": "/api/textosql/query",
      "avg_response_time_ms": 2456.7,
      "p95_response_time_ms": 4234.5
    },
    {
      "endpoint": "/api/rag/query",
      "avg_response_time_ms": 1678.3,
      "p95_response_time_ms": 3012.1
    }
  ],
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Frontend Usa**:
- `summary` → 4 tarjetas de métricas principales
- `by_functionality[]` → Tabla de rendimiento por funcionalidad
- `by_status_code` → Grid de códigos HTTP
- `top_endpoints[]` → Tabla de endpoints más usados
- `slowest_endpoints[]` → Tabla de endpoints más lentos

---

## ⚠️ Notas Importantes

### Timestamps
- ✅ **SIEMPRE** usar formato ISO 8601 con UTC: `"2025-12-01T14:30:00Z"`
- ❌ **NUNCA** usar timestamps Unix: `1701435000`
- ❌ **NUNCA** omitir la `Z` final: `"2025-12-01T14:30:00"`

### Nombres de Funcionalidades
- ✅ **USAR** snake_case: `fraud_detection`, `text_to_sql`, `rag_documents`
- ❌ **NO USAR** kebab-case: `fraud-detection`, `text-to-sql`
- ❌ **NO USAR** camelCase: `fraudDetection`, `textToSql`

### Nombres de Servicios
- ✅ **Modelos LLM**: `gemma-2b`, `gemma-4b`, `mistral-7b`, `deepseek-8b`
- ✅ **APIs**: `fraud_detection_api`, `rag_api`, `textosql_api`, `stats_api`

### Estados de Servicios
- ✅ **Valores válidos**: `"online"`, `"offline"`, `"error"`, `"degraded"`, `"maintenance"`
- ❌ **NO USAR**: `"active"`, `"inactive"`, `"down"`, `"up"`

### Severidades
- ✅ **Alertas/Actividades**: `"info"`, `"warning"`, `"critical"`, `"success"`
- ❌ **NO USAR**: `"low"`, `"medium"`, `"high"`, `"error"`

---

## 🧪 Testing con curl

```bash
# Dashboard Summary
curl http://localhost:8000/api/stats/dashboard/summary

# Services Status
curl http://localhost:8000/api/stats/services/status

# System Resources
curl http://localhost:8000/api/stats/system/resources

# Hourly Trends (últimas 24 horas)
curl http://localhost:8000/api/stats/trends/hourly?hours=24

# Functionality Performance
curl http://localhost:8000/api/stats/functionality/performance

# Recent Errors (límite 20)
curl http://localhost:8000/api/stats/errors/recent?limit=20

# Active Alerts
curl http://localhost:8000/api/stats/alerts/active

# Recent Activity (límite 10)
curl http://localhost:8000/api/stats/activity/recent?limit=10

# Detailed Metrics
curl "http://localhost:8000/api/stats/metrics/detailed?timeframe=today&funcionalidad=all"

# Resolve Alert
curl -X POST http://localhost:8000/api/stats/alerts/alert_001/resolve
```

---

## 📋 Checklist de Implementación Backend

- [ ] **PostgreSQL**: Tablas `api_metrics` y `service_health` creadas
- [ ] **Middleware**: Logging automático de todas las requests
- [ ] **Health Checks**: Cron job cada 30 segundos para actualizar `service_health`
- [ ] **Dashboard Summary**: Endpoint implementado con todos los campos
- [ ] **Services Status**: Endpoint que retorna `llm_models` y `api_endpoints`
- [ ] **System Resources**: Endpoint con `psutil` para CPU, RAM, disco
- [ ] **Hourly Trends**: Query con agregación por hora
- [ ] **Functionality Performance**: Agregación por `funcionalidad`
- [ ] **Recent Errors**: Query con filtro `status_code >= 400`
- [ ] **Active Alerts**: Sistema de reglas y notificaciones
- [ ] **Recent Activity**: Log de eventos del sistema
- [ ] **Detailed Metrics**: Cálculo de percentiles P95, P99
- [ ] **Alerting System**: Reglas automáticas (error_rate > 5%, response_time > 2s)

---

**Última actualización**: 2025-12-01
**Versión de API esperada**: 2.0.0
