# 🔥 CRÍTICO: Fix para Contador de Queries de Stats API

**Fecha**: 2025-12-04  
**Prioridad**: Alta  
**Impacto**: El contador `daily_queries` aumenta descontroladamente  
**Estado**: Requiere implementación en backend

---

## 🎯 Problema

### Descripción
El campo `daily_queries` en `/api/stats/dashboard/summary` incrementa con **TODOS** los requests HTTP que recibe el servidor, incluyendo:

- ✅ Requests de demos AI (correcto)
- ❌ Requests de estadísticas (incorrecto)
- ❌ Requests administrativos (incorrecto)
- ❌ Health checks (incorrecto)

### Ejemplo Real

**Escenario**: Usuario abre el dashboard y lo deja abierto 5 minutos.

**Requests Automáticos del Frontend**:
- `GET /api/stats/dashboard/summary` cada 30s → **10 requests**
- `GET /api/stats/services/status` cada 10s → **30 requests**
- `GET /api/stats/alerts/active` cada 15s → **20 requests**
- `GET /api/stats/activity/recent` cada 30s → **10 requests**

**Total en 5 minutos**: 70 requests de estadísticas

**Resultado**: El contador `daily_queries` aumenta +70 solo por monitoreo, sin ninguna query AI real.

**Si el usuario hace F5 (refresh)**: +4 requests adicionales por cada refresh.

### Impacto

```
Día 1: Usuario abre dashboard → daily_queries: 1000 (solo monitoreo)
Día 2: Usuario usa chatbot 5 veces → daily_queries: 1005 (996% son stats)
Día 3: Dashboard abierto 8 horas → daily_queries: 5760 (99.9% son stats)
```

**El contador es inútil** porque no refleja el uso real de AI.

---

## ✅ Solución Requerida

### Principio: Solo Contar Queries de Demos AI

El contador `daily_queries` debe incrementar **ÚNICAMENTE** cuando:
- Usuario interactúa con un modelo LLM
- Usuario sube un documento a RAG
- Usuario hace una query a RAG
- Usuario detecta fraude
- Usuario genera SQL desde texto

### Endpoints que NO Deben Contar

Excluir todos los endpoints relacionados con **monitoreo, administración y métricas**:

```
❌ /api/stats/*                    # Estadísticas
❌ /api/stats/dashboard/summary    # Dashboard
❌ /api/stats/services/status      # Estado de servicios
❌ /api/stats/alerts/active        # Alertas activas
❌ /api/stats/activity/recent      # Actividad reciente

❌ /api/admin/*                    # Administración
❌ /api/admin/resolve-alert/*      # Resolver alertas

❌ /api/metrics/*                  # Métricas detalladas

❌ /health                         # Health check
❌ /api/stats/health               # Health check de stats
```

### Endpoints que SÍ Deben Contar

Solo contar requests a **demos de inteligencia artificial**:

#### 1. Chatbot (LLM)
```
✅ POST /proxy/{port}/completion
✅ POST /proxy/{port}/v1/chat/completions
✅ POST /proxy/{port}/generate

Ejemplos:
✅ POST /proxy/8085/completion           # Gemma 2B
✅ POST /proxy/8088/completion           # Mistral 7B
✅ POST /proxy/8087/v1/chat/completions  # Gemma 12B
```

#### 2. RAG API
```
✅ POST /api/rag/query         # Query con RAG
✅ POST /api/rag/upload        # Upload de documento
✅ POST /api/rag/documents     # Operaciones con documentos
```

#### 3. Fraud Detection
```
✅ POST /api/fraude/predict_single_transaction
✅ POST /api/fraude/predict_batch
✅ POST /predict_single_transaction  # Ruta directa
```

#### 4. Text-to-SQL
```
✅ POST /api/textosql/generate
✅ POST /api/textosql/query
```

---

## 🛠️ Implementación Sugerida

### Opción 1: Middleware de FastAPI (Recomendado)

**Archivo**: `backend/middleware/stats_middleware.py`

```python
from fastapi import Request
import re
from datetime import datetime

# Patterns de endpoints AI (que SÍ deben contar)
AI_ENDPOINTS_PATTERNS = [
    r'^/proxy/\d+/completion$',              # LLM completion
    r'^/proxy/\d+/v1/chat/completions$',     # LLM chat (OpenAI format)
    r'^/proxy/\d+/generate$',                # LLM generate
    r'^/api/rag/query$',                     # RAG query
    r'^/api/rag/upload$',                    # RAG upload
    r'^/api/rag/documents',                  # RAG documents operations
    r'^/api/fraude/predict',                 # Fraud detection
    r'^/predict_single_transaction$',        # Fraud (direct route)
    r'^/api/textosql/generate$',             # Text-to-SQL
    r'^/api/textosql/query$',                # Text-to-SQL query
]

# Patterns de endpoints a EXCLUIR (que NO deben contar)
EXCLUDED_ENDPOINTS_PATTERNS = [
    r'^/api/stats/',        # Todas las rutas de stats
    r'^/api/admin/',        # Todas las rutas admin
    r'^/api/metrics/',      # Todas las rutas de métricas
    r'^/health$',           # Health check
    r'^/api/.*/health$',    # Health checks de servicios
]

def should_count_query(request_path: str, request_method: str) -> bool:
    """
    Determina si un request debe contar como query AI.
    
    Args:
        request_path: Ruta del request (ej: "/api/rag/query")
        request_method: Método HTTP (POST, GET, etc.)
    
    Returns:
        True si debe contar, False si no
    """
    # Solo contar POST requests (queries activas, no lecturas)
    if request_method != "POST":
        return False
    
    # Verificar si está en lista de exclusión
    for pattern in EXCLUDED_ENDPOINTS_PATTERNS:
        if re.match(pattern, request_path):
            return False
    
    # Verificar si está en lista de endpoints AI
    for pattern in AI_ENDPOINTS_PATTERNS:
        if re.match(pattern, request_path):
            return True
    
    # Por defecto, no contar
    return False

async def stats_counter_middleware(request: Request, call_next):
    """
    Middleware para contar queries AI correctamente.
    """
    # Procesar el request
    response = await call_next(request)
    
    # Determinar si debe contar
    if should_count_query(request.url.path, request.method):
        # Solo contar si fue exitoso (2xx)
        if 200 <= response.status_code < 300:
            # Incrementar contador en DB
            await increment_daily_queries(
                endpoint=request.url.path,
                timestamp=datetime.utcnow(),
                status_code=response.status_code
            )
    
    return response

async def increment_daily_queries(endpoint: str, timestamp: datetime, status_code: int):
    """
    Incrementar contador de queries diarias en la base de datos.
    
    Args:
        endpoint: Endpoint llamado
        timestamp: Timestamp del request
        status_code: Código de respuesta HTTP
    """
    # TODO: Implementar inserción en DB
    # Ejemplo con PostgreSQL:
    # await db.execute(
    #     "INSERT INTO ai_queries (endpoint, timestamp, status_code) VALUES ($1, $2, $3)",
    #     endpoint, timestamp, status_code
    # )
    pass
```

**Integración en `main.py`**:

```python
from fastapi import FastAPI
from middleware.stats_middleware import stats_counter_middleware

app = FastAPI()

# Agregar middleware
app.middleware("http")(stats_counter_middleware)

# ... resto de la aplicación
```

---

### Opción 2: Contador Explícito en Cada Endpoint

Si no se usa middleware, incrementar manualmente en cada endpoint AI:

```python
@app.post("/api/rag/query")
async def rag_query(query: QueryRequest):
    try:
        # Procesar query
        result = await process_rag_query(query)
        
        # Incrementar contador de queries AI
        await increment_daily_queries(
            endpoint="/api/rag/query",
            timestamp=datetime.utcnow(),
            status_code=200
        )
        
        return result
    except Exception as e:
        # No contar queries fallidas
        raise e

@app.post("/proxy/{port}/completion")
async def llm_completion(port: int, request: CompletionRequest):
    try:
        # Procesar completion
        result = await process_llm_completion(port, request)
        
        # Incrementar contador
        await increment_daily_queries(
            endpoint=f"/proxy/{port}/completion",
            timestamp=datetime.utcnow(),
            status_code=200
        )
        
        return result
    except Exception as e:
        raise e
```

**⚠️ Desventaja**: Más código repetitivo, fácil olvidar agregar en nuevos endpoints.

---

## 🗄️ Esquema de Base de Datos

### Tabla Sugerida: `ai_queries_log`

```sql
CREATE TABLE ai_queries_log (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL,  -- 'llm', 'rag', 'fraud', 'textosql'
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    status_code INTEGER NOT NULL,
    response_time_ms FLOAT,
    user_id VARCHAR(100),  -- Opcional: si hay autenticación
    metadata JSONB,        -- Opcional: datos adicionales
    
    INDEX idx_timestamp (timestamp),
    INDEX idx_service_type (service_type),
    INDEX idx_endpoint (endpoint)
);
```

### Query para `daily_queries`

```sql
-- Queries de las últimas 24 horas
SELECT COUNT(*) as daily_queries
FROM ai_queries_log
WHERE timestamp >= NOW() - INTERVAL '24 hours'
  AND status_code >= 200 
  AND status_code < 300;

-- Queries exitosas vs fallidas
SELECT 
    COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as successful_queries,
    COUNT(*) FILTER (WHERE status_code >= 400) as failed_queries
FROM ai_queries_log
WHERE timestamp >= NOW() - INTERVAL '24 hours';

-- Queries por servicio
SELECT 
    service_type,
    COUNT(*) as queries,
    AVG(response_time_ms) as avg_response_time
FROM ai_queries_log
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY service_type;
```

---

## ✅ Testing y Verificación

### 1. Verificar que Stats NO Incrementan el Contador

```bash
# Obtener contador actual
COUNTER_BEFORE=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')

# Hacer múltiples requests de stats
for i in {1..10}; do
  curl -s http://localhost:8003/api/stats/dashboard/summary > /dev/null
  curl -s http://localhost:8003/api/stats/services/status > /dev/null
  curl -s http://localhost:8003/api/stats/alerts/active > /dev/null
done

# Obtener contador después
COUNTER_AFTER=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')

# Verificar que NO cambió
if [ "$COUNTER_BEFORE" -eq "$COUNTER_AFTER" ]; then
  echo "✅ PASS: Contador no incrementó con requests de stats"
else
  echo "❌ FAIL: Contador incrementó de $COUNTER_BEFORE a $COUNTER_AFTER"
fi
```

---

### 2. Verificar que Queries AI SÍ Incrementan el Contador

```bash
# Obtener contador actual
COUNTER_BEFORE=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')

# Hacer 3 queries AI reales
curl -X POST http://localhost:8003/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'

curl -X POST http://localhost:8003/proxy/8088/completion \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "max_tokens": 10}'

curl -X POST http://localhost:8003/api/fraude/predict_single_transaction \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "category": "test"}'

# Obtener contador después
COUNTER_AFTER=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')

# Calcular diferencia
DIFF=$((COUNTER_AFTER - COUNTER_BEFORE))

# Verificar que incrementó correctamente
if [ "$DIFF" -eq 3 ]; then
  echo "✅ PASS: Contador incrementó correctamente (+3)"
else
  echo "❌ FAIL: Contador incrementó $DIFF (esperado: 3)"
fi
```

---

### 3. Test de Stress (Dashboard Abierto)

```bash
# Simular dashboard abierto por 1 minuto
COUNTER_BEFORE=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')

echo "Simulando dashboard abierto por 1 minuto..."
for i in {1..6}; do
  # Simular polling cada 10 segundos
  curl -s http://localhost:8003/api/stats/dashboard/summary > /dev/null
  curl -s http://localhost:8003/api/stats/services/status > /dev/null
  curl -s http://localhost:8003/api/stats/alerts/active > /dev/null
  curl -s http://localhost:8003/api/stats/activity/recent > /dev/null
  sleep 10
done

COUNTER_AFTER=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')

# Verificar que NO cambió (o cambió muy poco)
DIFF=$((COUNTER_AFTER - COUNTER_BEFORE))
if [ "$DIFF" -le 5 ]; then
  echo "✅ PASS: Dashboard polling no incrementa contador significativamente (Δ=$DIFF)"
else
  echo "❌ FAIL: Dashboard polling incrementó contador $DIFF veces"
fi
```

---

### 4. Verificar Logs

```bash
# Ver queries registradas en los últimos 5 minutos
SELECT endpoint, service_type, timestamp, status_code
FROM ai_queries_log
WHERE timestamp >= NOW() - INTERVAL '5 minutes'
ORDER BY timestamp DESC
LIMIT 20;

# Verificar que NO hay endpoints de stats
SELECT COUNT(*) as invalid_entries
FROM ai_queries_log
WHERE endpoint LIKE '/api/stats/%'
   OR endpoint LIKE '/api/admin/%'
   OR endpoint LIKE '/api/metrics/%';

-- Debería retornar: 0
```

---

## 📊 Resultados Esperados

### Antes del Fix
```
Dashboard abierto 8 horas → daily_queries: 5760 (99% stats)
Usuario usa chatbot 10 veces → daily_queries: 5770 (0.17% AI)
```

### Después del Fix
```
Dashboard abierto 8 horas → daily_queries: 0 (stats no cuentan)
Usuario usa chatbot 10 veces → daily_queries: 10 (100% AI)
Usuario usa RAG 5 veces → daily_queries: 15 (100% AI)
```

---

## 🎯 Checklist de Implementación

### Backend
- [ ] Crear middleware `stats_counter_middleware.py`
- [ ] Definir patterns de endpoints AI y excluidos
- [ ] Implementar función `should_count_query()`
- [ ] Integrar middleware en `main.py`
- [ ] Crear tabla `ai_queries_log` en DB
- [ ] Implementar función `increment_daily_queries()`
- [ ] Modificar query de `daily_queries` en dashboard/summary
- [ ] Modificar queries de `daily_successful_queries` y `daily_failed_queries`

### Testing
- [ ] Ejecutar test: Stats NO incrementan contador
- [ ] Ejecutar test: Queries AI SÍ incrementan contador
- [ ] Ejecutar test de stress: Dashboard abierto 1 minuto
- [ ] Verificar logs de DB: solo endpoints AI
- [ ] Verificar dashboard muestra números correctos

### Verificación Final
- [ ] Abrir dashboard en navegador
- [ ] Dejar abierto 5 minutos
- [ ] Verificar que `daily_queries` no aumenta
- [ ] Hacer 5 queries al chatbot
- [ ] Verificar que `daily_queries` aumentó exactamente +5
- [ ] Hacer F5 múltiples veces
- [ ] Verificar que `daily_queries` no aumenta con refresh

---

## 📝 Notas Importantes

### Consideraciones de Performance

**Middleware es rápido**: Solo evalúa regex patterns, sin llamadas a DB en cada request.

**Inserción async**: La función `increment_daily_queries()` debe ser async para no bloquear requests.

**Batch inserts**: Si hay mucho tráfico, considerar insertar en lotes cada 10 segundos en lugar de individualmente.

### Consideraciones de Arquitectura PPC64le

**Compatible**: Regex y FastAPI middleware funcionan en PPC64le sin cambios.

**DB**: PostgreSQL y MongoDB soportan PPC64le nativamente.

**Sin dependencias externas**: No requiere librerías especiales.

### Setup Automático

**Agregar a `setup.sh`**:
```bash
# Crear tabla de logs si no existe
docker exec stats-api python -c "
from app.database import create_ai_queries_table
create_ai_queries_table()
"
```

---

## 🔗 Referencias

- Documento principal: `STATS_API_DOCUMENTATION.md`
- Frontend: `src/pages/DashboardPage.jsx` (líneas 35-45)
- Backend: `backend/routers/stats.py` (endpoint dashboard/summary)

---

**Última Actualización**: 2025-12-04  
**Autor**: DevOps Team  
**Prioridad**: 🔥 Alta - Bloqueante para métricas correctas
