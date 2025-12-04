# IBM AI Platform - Frontend

Frontend de la plataforma de inteligencia artificial construido con React, Vite y Carbon Design System para IBM Power Systems (PPC64LE).

## Stack Tecnológico

- React 18 + Vite
- Carbon Design System + Carbon Charts
- Tailwind CSS
- Docker + Nginx Alpine

## Inicio Rápido

```bash
# Desarrollo local
npm install
npm run dev

# Docker (Producción)
docker compose up --build frontend
```

## Arquitectura

```
Frontend (React + Nginx) → Backend APIs:
  ├─ /api/stats/*    → stats-api:8003
  ├─ /api/rag/*      → rag-api:8004
  ├─ /api/fraude/*   → fraude-api:8001
  └─ /api/textosql/* → textosql-api:8002
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables (Carbon DS)
├── pages/          # Vistas principales de la aplicación
├── services/       # Clientes API (ragService, statsService)
├── hooks/          # Custom React hooks
├── utils/          # Utilidades y helpers
└── config/         # Configuración de entorno
```

## Funcionalidades

- **Dashboard**: Métricas en tiempo real de modelos LLM y APIs
- **RAG Documents**: Análisis semántico con Milvus + embeddings
- **Fraud Detection**: ML para detección de fraude
- **Text-to-SQL**: Conversión lenguaje natural a SQL
- **NLP Analysis**: Procesamiento de lenguaje natural
- **Image Generator**: Generación de imágenes con IA
- **Chatbot**: Asistente conversacional con LLM

## Scripts Disponibles

```bash
npm run dev        # Servidor desarrollo (localhost:5173)
npm run build      # Build producción
npm run preview    # Preview build local
npm run demo       # Deploy completo Docker
```

## Configuración Docker

El contenedor se construye automáticamente con `setup.sh` del backend. Variables de entorno en `docker-compose.yml`:

- `VITE_STATS_API_URL`: URL de Stats API
- `VITE_RAG_API_URL`: URL de RAG API
- `VITE_FRAUD_API_URL`: URL de Fraud API
- `VITE_TEXTOSQL_API_URL`: URL de Text-to-SQL API

## Despliegue

```bash
# Build y deploy
docker compose build frontend && docker compose up -d frontend

# Verificar logs
docker logs -f frontend

# Reconstrucción completa (sin cache)
docker compose build --no-cache frontend
```

## Troubleshooting

**502 Bad Gateway**: Verificar que servicios backend estén corriendo (`docker ps`)  
**404 Endpoints**: Revisar configuración nginx en `nginx.conf.template`  
**Variables entorno**: Rebuild con `--no-cache` para forzar actualización

---

**Puerto**: 2012 | **Versión**: 3.0.0 | **Arquitectura**: Compatible PPC64LE
