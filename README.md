# IBM AI Platform - Frontend 🚀

Frontend de la plataforma de IA construido con React, Vite y Carbon Design System.

## 📋 Stack Tecnológico

- **React 18** - Framework UI
- **Vite** - Build tool y dev server
- **Carbon Design System** - Componentes IBM
- **Nginx Alpine** - Servidor web en producción
- **Docker** - Containerización

## 🏗️ Arquitectura

```
Frontend (React) → Nginx → Backend APIs:
  ├─ /api/stats/*    → stats-api:8003
  ├─ /api/rag/*      → rag-api:8004
  ├─ /api/fraude/*   → fraude-api:8001
  └─ /api/textosql/* → textosql-api:8002
```

## 🚀 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build
```

## 🐳 Docker

```bash
# Build y run
docker compose up --build frontend

# Ver logs
docker logs -f frontend

# Rebuild completo
docker compose build frontend && docker compose up -d frontend
```

## 📚 Documentación Principal

- **INTEGRACION_RAG_API_v3.md** - Integración completa RAG API con Milvus
- **STATS_API_ALIGNMENT_v2.md** - Alineación Stats API v2.0 (verificado)
- **CAMBIOS_ERROR_502.md** - Solución error 502 nginx
- **FRONTEND_API_INTEGRATION.md** - Guía general de integración APIs

## ⚙️ Servicios del Frontend

### 1. RAG Service (`src/services/ragService.js`)
```javascript
import ragService from './services/ragService';

// Health check
await ragService.checkHealth();

// Upload documento
await ragService.uploadDocument(file, {
  embedding_model: 'nomic-embed-text-v1.5',
  llm_model: 'mistral-7b'
});

// Query
await ragService.queryDocuments('¿Cómo funciona?', { top_k: 5 });
```

### 2. Stats Service (`src/services/statsService.js`)
```javascript
import statsService from './services/statsService';

// Dashboard summary
await statsService.getDashboardSummary();

// Services status
await statsService.getServicesStatus();

// Alerts
await statsService.getAlerts();
```

## 🔧 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
│   ├── carbon/    # Componentes Carbon DS personalizados
│   └── stats/     # Componentes de estadísticas
├── pages/          # Páginas de la aplicación
│   ├── DashboardPage.jsx
│   ├── DocumentAnalysisPage.jsx (RAG v3.0)
│   ├── MetricsPage.jsx
│   └── ...
├── services/       # Clientes API
│   ├── ragService.js      (RAG v3.0)
│   ├── statsService.js    (Stats v2.0)
│   └── ...
├── hooks/          # Custom React hooks
│   └── useStatsAPI.js
├── utils/          # Utilidades
│   └── apiClient.js
└── config/         # Configuración
    └── environment.js
```

## 🌐 Endpoints API

### Stats API v2.0 (✅ Verificado)
```
GET  /api/stats/dashboard/summary
GET  /api/stats/services/status
GET  /api/stats/alerts/active
POST /api/stats/alerts/{id}/resolve
GET  /api/stats/activity/recent
GET  /api/stats/errors/recent
GET  /api/stats/system/resources
GET  /api/stats/functionality/performance
GET  /api/stats/metrics/detailed
GET  /api/stats/trends/hourly
```

### RAG API v3.0
```
GET  /api/rag/health
GET  /api/rag/models
POST /api/rag/upload
POST /api/rag/query
GET  /api/rag/documents
DEL  /api/rag/documents/{id}
GET  /api/rag/stats
```

## 📦 Build & Deploy

```bash
# Build para producción
docker compose build frontend

# Deploy
docker compose up -d frontend

# Verificar logs
docker logs -f frontend

# Verificar configuración nginx generada
docker exec frontend cat /etc/nginx/conf.d/default.conf
```

## 🛠️ Troubleshooting

### Error 502 Bad Gateway
1. Verificar servicios backend: `docker ps | grep -E 'stats|rag|fraude'`
2. Ver logs nginx: `docker logs frontend`
3. Verificar DNS: `docker exec frontend getent hosts stats-api`

### Endpoints retornan 404
1. Verificar rutas en `nginx.conf.template`
2. Verificar que el servicio backend esté corriendo
3. Test directo: `curl http://localhost:8003/api/stats/health`

### Variables de entorno no funcionan
1. Verificar `Dockerfile` - ARG y ENV correctos
2. Verificar `docker-compose.yml` - build args
3. Rebuild completo: `docker compose build --no-cache frontend`

---

**Puerto**: 2012  
**Versión**: 3.0.0  
**Última actualización**: Diciembre 2025
