# 📚 Índice de Documentación - IBM AI Platform Frontend

**Fecha**: 2025-12-04  
**Versión**: 2.1

---

## 🎯 Guía Rápida

### Para Desarrolladores Frontend
Leer en orden:
1. `README.md` - Introducción general del proyecto
2. `STATS_API_DOCUMENTATION.md` - Especificación completa de Stats API
3. `src/config/environment.js` - Configuración centralizada

### Para Desarrolladores Backend (Stats API)
Leer en orden:
1. `STATS_API_DOCUMENTATION.md` - Especificación completa y fixes aplicados
2. `STATS_QUERY_COUNTER_FIX.md` - **CRÍTICO**: Fix para contador de queries

### Para DevOps
Leer en orden:
1. `STATS_API_DOCUMENTATION.md` - Arquitectura y endpoints
2. `Dockerfile` + `docker-compose.yml` - Configuración de contenedores
3. `entrypoint.sh` + `nginx.conf.template` - Configuración de proxy

---

## 📄 Documentos Disponibles

### 1. STATS_API_DOCUMENTATION.md ⭐
**Documento Principal** - Consolidación completa de:
- Estado del sistema (Frontend ✅ | Backend ⚠️)
- Correcciones aplicadas al frontend con código específico
- Arquitectura general y red Docker
- 6 endpoints detallados con ejemplos
- Problemas pendientes del backend
- Testing y verificación completa

**Cuándo Leer**: Siempre primero al trabajar con Stats API.

**Secciones Clave**:
- ✅ Frontend fixes aplicados (líneas específicas de código)
- ⚠️ Problemas pendientes del backend (nombres de campos, IDs faltantes)
- 🔥 CRÍTICO: Contador de queries incrementa incorrectamente

---

### 2. STATS_QUERY_COUNTER_FIX.md 🔥
**Documento Específico** - Fix crítico para contador de queries.

**Problema**: `daily_queries` cuenta requests de stats en lugar de solo AI demos.

**Contenido**:
- Descripción detallada del problema con ejemplos
- Lista de endpoints a excluir (stats, admin, metrics)
- Lista de endpoints a incluir (chatbot, RAG, fraude, textosql)
- Implementación sugerida con middleware FastAPI
- Esquema de base de datos
- Tests completos de verificación

**Cuándo Leer**: Antes de implementar fix en backend stats.

**Prioridad**: 🔥 Alta - Bloqueante para métricas correctas

---

### 3. README.md
**Documento General** - Introducción al proyecto.

**Contenido**:
- Descripción del proyecto
- Instrucciones de instalación
- Estructura del código
- Comandos útiles

**Cuándo Leer**: Primera vez trabajando en el proyecto.

---

### 4. src/config/environment.js
**Configuración Centralizada** - Todos los parámetros del frontend.

**Contenido**:
- Puertos de servicios
- Modelos LLM disponibles
- Parámetros de generación (temperatura, max_tokens, etc.)
- Timeouts y límites
- Configuración UI (intervalos de refresh, animaciones)

**Cuándo Modificar**:
- Agregar nuevo modelo LLM
- Cambiar puerto de servicio
- Ajustar timeouts
- Cambiar frecuencia de actualización del dashboard

**Ventaja**: Un solo archivo para toda la configuración.

---

## 🔄 Historial de Cambios

### 2025-12-04 - Versión 2.1
**Frontend**:
- ✅ Implementado optional chaining en FunctionalityMetrics.jsx
- ✅ Implementado optional chaining en MetricsPage.jsx
- ✅ Validación de alert.id antes de mostrar botón resolver
- ✅ Fix en flujo de streaming del chatbot (isLoading correcto)

**Backend** (Pendiente):
- ⚠️ Agregar campo `id` a alertas
- ⚠️ Cambiar `total_queries_24h` → `daily_queries`
- ⚠️ Cambiar `avg_accuracy` → `global_accuracy`
- 🔥 Implementar filtrado de contador de queries

**Documentación**:
- ✅ Creado STATS_API_DOCUMENTATION.md (consolidación completa)
- ✅ Creado STATS_QUERY_COUNTER_FIX.md (fix específico)
- ✅ Eliminado FRONTEND_FIXES_APPLIED.md (consolidado)
- ✅ Eliminado stats-metrics-feature.md (consolidado)

---

## 🎯 Problemas Conocidos

### Prioridad Alta (Bloqueantes)

#### 1. ❌ Campo `id` Faltante en Alertas
**Endpoint**: `GET /api/stats/alerts/active`  
**Impacto**: Botón de resolver no aparece, requests fallan con 404  
**Documento**: STATS_API_DOCUMENTATION.md → Sección "Problemas Pendientes"

#### 2. ❌ Nombres de Campos Incorrectos
**Endpoint**: `GET /api/stats/dashboard/summary`  
**Campos**: `total_queries_24h` (debe ser `daily_queries`), `avg_accuracy` (debe ser `global_accuracy`)  
**Impacto**: Frontend usa fallback (muestra 0 o "N/A")  
**Documento**: STATS_API_DOCUMENTATION.md → Sección "Dashboard Summary"

#### 3. 🔥 Contador de Queries Incluye Stats
**Endpoint**: `GET /api/stats/dashboard/summary`  
**Campo**: `daily_queries`  
**Impacto**: Contador aumenta descontroladamente con requests de monitoreo  
**Documento**: STATS_QUERY_COUNTER_FIX.md (completo)

---

## 📊 Estado Actual del Sistema

### Frontend ✅
```
Estado:    100% funcional y resiliente
Versión:   2.1
Cambios:   Defensive programming con optional chaining
Tests:     Todos pasando
Deploy:    Requiere rebuild después de cambios
```

### Backend Stats API ⚠️
```
Estado:    Funcional pero requiere ajustes
Versión:   2.0 (requiere actualización a 2.1)
Endpoints: Todos responden 200 OK
Issues:    3 problemas pendientes (ver arriba)
Tests:     Requiere implementación de fixes para pasar
```

---

## 🛠️ Comandos Útiles

### Testing Backend
```bash
# Verificar dashboard summary
curl http://localhost:8003/api/stats/dashboard/summary | jq

# Verificar alertas (debe tener "id")
curl http://localhost:8003/api/stats/alerts/active | jq '.[].id'

# Verificar servicios (debe tener "service_type")
curl http://localhost:8003/api/stats/services/status | jq '.[].service_type'

# Test contador de queries (no debe aumentar con stats)
BEFORE=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')
curl -s http://localhost:8003/api/stats/dashboard/summary > /dev/null
AFTER=$(curl -s http://localhost:8003/api/stats/dashboard/summary | jq '.daily_queries')
echo "Before: $BEFORE, After: $AFTER (should be equal)"
```

### Rebuild Frontend
```bash
# Desarrollo local
npm run dev

# Producción (Docker)
docker compose build frontend
docker compose up -d frontend
```

### Logs
```bash
# Frontend logs
docker logs frontend -f --tail 100

# Backend stats logs
docker logs stats-api -f --tail 100

# Nginx logs
docker exec frontend tail -f /var/log/nginx/access.log
```

---

## 🔗 Enlaces Externos

### Frontend
- **URL Producción**: http://52.117.41.85:2012
- **Dashboard**: http://52.117.41.85:2012/
- **Métricas**: http://52.117.41.85:2012/metrics
- **Chatbot**: http://52.117.41.85:2012/chatbot

### Backend Stats API
- **Base URL**: http://stats-api:8003 (red interna)
- **Health Check**: http://stats-api:8003/health
- **Docs (Swagger)**: http://stats-api:8003/docs

---

## 👥 Contactos

**Frontend**: Equipo Frontend  
**Backend Stats**: Equipo Backend  
**DevOps**: Equipo DevOps  
**Arquitectura**: Power S1022 (PPC64le) - CentOS 9

---

## 📝 Notas Importantes

### ⚠️ Arquitectura Especial
- **CPU**: Power S1022 (arquitectura PPC64le)
- **OS**: Linux CentOS 9
- **Docker**: Todo corre en contenedores
- **Setup**: Automatizado con `setup.sh` (NO soluciones temporales)

### ⚠️ Recursos Limitados
- Optimizar para bajo consumo de CPU/RAM
- Evitar operaciones costosas en endpoints frecuentes
- Usar índices en DB para queries pesadas

### ⚠️ Despliegues Frecuentes
- Servidores se destruyen y despliegan constantemente
- Todo debe estar en `setup.sh`
- No hay acceso manual post-deploy
- Documentar TODO en este repo

---

**Última Actualización**: 2025-12-04  
**Mantenido por**: DevOps Team  
**Versión**: 2.1
