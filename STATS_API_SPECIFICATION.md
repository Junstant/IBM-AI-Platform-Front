# 📊 API de Estadísticas y Métricas - Especificación Backend

## Versión: 2.0.0
## Fecha: 2025-12-01

Esta documentación define la estructura completa de datos que el **backend de estadísticas** debe proveer para que el frontend pueda mostrar métricas en tiempo real.

---

## 🎯 Arquitectura de Métricas

El backend debe implementar un **middleware de métricas** que registre en la base de datos:
- Todas las peticiones HTTP (endpoint, método, headers)
- Tiempo de respuesta de cada petición
- Código de estado HTTP
- IP del cliente
- Timestamp de la petición
- Página/funcionalidad de origen
- Errores y excepciones

### Base de Datos Recomendada

**Tabla: `api_metrics`**
```sql
CREATE TABLE api_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endpoint VARCHAR(255) NOT NULL,           -- Ej: "/api/fraude/predict_single_transaction"
    http_method VARCHAR(10) NOT NULL,         -- GET, POST, PUT, DELETE
    status_code INTEGER NOT NULL,             -- 200, 404, 500, etc.
    response_time_ms FLOAT NOT NULL,          -- Tiempo en milisegundos
    client_ip VARCHAR(45),                    -- IPv4 o IPv6
    user_agent TEXT,
    funcionalidad VARCHAR(100),               -- chatbot, fraud_detection, text_to_sql, etc.
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    error_message TEXT,                       -- Si status_code >= 400
    error_type VARCHAR(100)                   -- ValueError, TimeoutError, etc.
);

CREATE INDEX idx_timestamp ON api_metrics(timestamp);
CREATE INDEX idx_endpoint ON api_metrics(endpoint);
CREATE INDEX idx_funcionalidad ON api_metrics(funcionalidad);
CREATE INDEX idx_status_code ON api_metrics(status_code);
```

**Tabla: `service_health`**
```sql
CREATE TABLE service_health (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL UNIQUE, -- gemma-2b, mistral-7b, fraud_api, rag_api, etc.
    service_type VARCHAR(50) NOT NULL,         -- llm_model, api_endpoint
    status VARCHAR(20) NOT NULL,               -- online, offline, error, degraded
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uptime_seconds BIGINT DEFAULT 0,
    total_requests BIGINT DEFAULT 0,
    successful_requests BIGINT DEFAULT 0,
    failed_requests BIGINT DEFAULT 0,
    avg_latency_ms FLOAT DEFAULT 0,
    last_error TEXT,
    metadata JSONB                             -- Info adicional (puerto, host, versión)
);
```

---

## 📡 Endpoints Requeridos

Base URL: `/api/stats/`

### 1. Dashboard Summary
**GET** `/api/stats/dashboard/summary`

Resumen general para las 4 tarjetas principales del dashboard.

**Response:**
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

**Cálculo de campos:**
- `active_models`: COUNT de service_health WHERE service_type='llm_model' AND status='online'
- `error_models`: COUNT de service_health WHERE service_type='llm_model' AND status IN ('offline', 'error')
- `active_apis`: COUNT de service_health WHERE service_type='api_endpoint' AND status='online'
- `error_apis`: COUNT de service_health WHERE service_type='api_endpoint' AND status IN ('offline', 'error')
- `daily_queries`: COUNT de api_metrics WHERE DATE(timestamp) = TODAY
- `daily_successful_queries`: COUNT WHERE status_code < 400
- `daily_failed_queries`: COUNT WHERE status_code >= 400
- `avg_response_time`: AVG(response_time_ms) / 1000 (convertir a segundos)
- `global_accuracy`: (daily_successful_queries / daily_queries) * 100

---

### 2. Models & APIs Status
**GET** `/api/stats/services/status`

Lista completa de modelos LLM y APIs con su estado de salud.

**Response:**
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
      "service_name": "mistral-7b",
      "display_name": "Mistral 7B",
      "status": "online",
      "uptime_seconds": 86100,
      "total_requests": 589,
      "successful_requests": 585,
      "failed_requests": 4,
      "avg_latency_ms": 412.7,
      "last_check": "2025-12-01T14:29:58Z",
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
    }
  ]
}
```

---

### 3. System Resources
**GET** `/api/stats/system/resources`

Recursos del sistema (CPU, RAM, disco, red).

**Response:**
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

**Implementación sugerida (Python):**
```python
import psutil

def get_system_resources():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net = psutil.net_io_counters()
    
    return {
        "cpu_usage_percent": cpu,
        "memory_usage_percent": memory.percent,
        "memory_total_gb": round(memory.total / (1024**3), 2),
        "memory_used_gb": round(memory.used / (1024**3), 2),
        "disk_usage_percent": disk.percent,
        "disk_total_gb": round(disk.total / (1024**3), 2),
        "disk_used_gb": round(disk.used / (1024**3), 2),
        "network_sent_mb": round(net.bytes_sent / (1024**2), 2),
        "network_recv_mb": round(net.bytes_recv / (1024**2), 2),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
```

---

### 4. Hourly Trends
**GET** `/api/stats/trends/hourly?hours=24`

Tendencias de las últimas N horas (para gráficos de línea).

**Query Parameters:**
- `hours` (opcional): Número de horas hacia atrás (default: 24)

**Response:**
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
    }
    // ... 22 horas más
  ]
}
```

**Query SQL ejemplo:**
```sql
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as requests_count,
    COUNT(*) FILTER (WHERE status_code < 400) as successful_requests,
    COUNT(*) FILTER (WHERE status_code >= 400) as failed_requests,
    AVG(response_time_ms) as avg_response_time_ms,
    COUNT(*) FILTER (WHERE status_code >= 500) as total_errors
FROM api_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour ASC;
```

---

### 5. Functionality Performance
**GET** `/api/stats/functionality/performance`

Rendimiento por funcionalidad (chatbot, fraude, text-to-sql, etc.).

**Response:**
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

---

### 6. Recent Errors
**GET** `/api/stats/errors/recent?limit=20`

Errores recientes con detalles.

**Query Parameters:**
- `limit` (opcional): Máximo de errores a retornar (default: 20)

**Response:**
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

---

### 7. Active Alerts
**GET** `/api/stats/alerts/active`

Alertas activas del sistema.

**Response:**
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

**POST** `/api/stats/alerts/{alert_id}/resolve`

Marcar alerta como resuelta.

**Response:**
```json
{
  "success": true,
  "alert_id": "alert_001",
  "resolved_at": "2025-12-01T14:35:00Z"
}
```

---

### 8. Recent Activity
**GET** `/api/stats/activity/recent?limit=10`

Actividad reciente del sistema (eventos, acciones, cambios).

**Query Parameters:**
- `limit` (opcional): Máximo de eventos a retornar (default: 10)

**Response:**
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

---

### 9. Detailed Metrics (Nueva página)
**GET** `/api/stats/metrics/detailed?timeframe=today&funcionalidad=all`

Métricas detalladas para la nueva página de métricas.

**Query Parameters:**
- `timeframe`: today | week | month | custom
- `start_date` (opcional): ISO 8601 timestamp
- `end_date` (opcional): ISO 8601 timestamp
- `funcionalidad` (opcional): all | chatbot | fraud_detection | text_to_sql | rag_documents

**Response:**
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
    }
  ],
  "slowest_endpoints": [
    {
      "endpoint": "/api/textosql/query",
      "avg_response_time_ms": 2456.7,
      "p95_response_time_ms": 4234.5
    }
  ],
  "timestamp": "2025-12-01T14:30:00Z"
}
```

---

## 🔧 Implementación del Middleware (Python/FastAPI)

```python
from fastapi import Request, status
from typing import Callable
import time
from datetime import datetime
import asyncpg

# Middleware de métricas
@app.middleware("http")
async def metrics_middleware(request: Request, call_next: Callable):
    start_time = time.time()
    
    # Identificar funcionalidad basada en la ruta
    funcionalidad = identify_functionality(request.url.path)
    
    response = None
    error_message = None
    error_type = None
    
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        status_code = 500
        error_message = str(e)
        error_type = type(e).__name__
        response = JSONResponse(
            status_code=500,
            content={"error": error_message}
        )
    
    # Calcular tiempo de respuesta
    response_time_ms = (time.time() - start_time) * 1000
    
    # Registrar en base de datos (async)
    await log_metric(
        endpoint=request.url.path,
        http_method=request.method,
        status_code=status_code,
        response_time_ms=response_time_ms,
        client_ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
        funcionalidad=funcionalidad,
        error_message=error_message,
        error_type=error_type
    )
    
    return response

def identify_functionality(path: str) -> str:
    """Identifica la funcionalidad basada en la ruta"""
    if "/proxy/" in path or "/completion" in path:
        return "chatbot"
    elif "/fraude" in path or "/fraud" in path:
        return "fraud_detection"
    elif "/textosql" in path:
        return "text_to_sql"
    elif "/rag" in path:
        return "rag_documents"
    elif "/nlp" in path:
        return "nlp_analysis"
    else:
        return "unknown"

async def log_metric(**kwargs):
    """Guarda métrica en PostgreSQL"""
    async with asyncpg.create_pool(DATABASE_URL) as pool:
        await pool.execute("""
            INSERT INTO api_metrics 
            (endpoint, http_method, status_code, response_time_ms, 
             client_ip, user_agent, funcionalidad, error_message, error_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """, 
            kwargs['endpoint'],
            kwargs['http_method'],
            kwargs['status_code'],
            kwargs['response_time_ms'],
            kwargs['client_ip'],
            kwargs['user_agent'],
            kwargs['funcionalidad'],
            kwargs.get('error_message'),
            kwargs.get('error_type')
        )
```

---

## 📝 Notas de Implementación

1. **Zona horaria**: Todos los timestamps deben estar en UTC (ISO 8601 con sufijo 'Z')
2. **Paginación**: Para endpoints con muchos resultados, usar `limit` y `offset`
3. **Caché**: Considerar Redis para cachear métricas por 30-60 segundos
4. **Agregación**: Calcular métricas agregadas cada minuto/hora en lugar de en tiempo real
5. **Retención**: Mantener métricas detalladas por 30 días, agregadas por 1 año
6. **Health checks**: Ejecutar cada 30 segundos para actualizar service_health
7. **Alertas**: Sistema de reglas para generar alertas automáticamente

---

## 🚀 Prioridad de Implementación

1. ✅ **Alta**: `/dashboard/summary`, `/services/status`
2. ✅ **Alta**: `/system/resources`, `/trends/hourly`
3. ✅ **Media**: `/functionality/performance`, `/errors/recent`
4. ✅ **Media**: `/alerts/active`, `/activity/recent`
5. ✅ **Baja**: `/metrics/detailed` (para página dedicada)

---

**Contacto**: Frontend espera esta estructura. Cualquier cambio debe coordinarse.
