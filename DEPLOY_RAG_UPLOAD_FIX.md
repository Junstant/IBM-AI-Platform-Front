# 🔧 Fix Error 413 - Request Entity Too Large

## 📋 Problema
El error **413 Request Entity Too Large** ocurre al subir archivos >1MB porque Nginx tiene un límite por defecto muy bajo.

## ✅ Cambios Realizados en el Frontend

### 1. `nginx.conf.template` - Aumentado límite de upload a 100MB
```nginx
server {
    # ...
    
    # ✅ Configuración para uploads grandes (RAG)
    client_max_body_size 100M;
    client_body_timeout 300s;
    client_body_buffer_size 128k;
    
    # ...
    
    # ✅ NUEVO: Proxy para RAG API con configuración especial
    location /api/rag/ {
        proxy_pass http://${RAG_API_HOST}:${RAG_API_PORT}/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Configuración especial para uploads grandes
        client_max_body_size 100M;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_buffering off;
    }
}
```

### 2. `entrypoint.sh` - Agregadas variables RAG
```bash
VARS_TO_SUBST='... ${RAG_API_HOST} ${RAG_API_PORT} ...'
```

### 3. `src/config/environment.js` - Configuración RAG
```javascript
apis: {
  rag: import.meta.env.VITE_RAG_API_PORT || "8004",
},

rag: {
  apiPort: import.meta.env.VITE_RAG_API_PORT || "8004",
  baseUrl: "/api/rag"
},
```

---

## 🚀 Pasos para Aplicar en el Servidor

### **En el servidor de producción:**

```bash
# 1. Ir al directorio del frontend
cd /root/FrontAI  # O donde esté tu frontend

# 2. Hacer pull de los cambios
git pull origin main

# 3. Verificar que los archivos se actualizaron
cat nginx.conf.template | grep "client_max_body_size"
# Debería mostrar: client_max_body_size 100M;

cat entrypoint.sh | grep "RAG_API"
# Debería mostrar: ${RAG_API_HOST} ${RAG_API_PORT}

# 4. Detener el frontend
docker compose down frontend

# 5. Rebuild con --no-cache para asegurar cambios
docker compose build --no-cache frontend

# 6. Iniciar el frontend con las variables de entorno correctas
docker compose up -d frontend

# 7. Ver logs para verificar
docker logs -f frontend
# Debería ver la configuración generada con client_max_body_size 100M
```

---

## 🔍 Verificación

### **1. Verificar configuración de Nginx**
```bash
# Ver la configuración generada dentro del contenedor
docker exec frontend cat /etc/nginx/conf.d/default.conf | grep "client_max_body_size"

# Debería mostrar:
# client_max_body_size 100M;
```

### **2. Probar upload desde terminal**
```bash
# Crear archivo de prueba de 2MB
dd if=/dev/zero of=test_2mb.txt bs=1M count=2

# Probar upload
curl -X POST http://localhost:2012/api/rag/documents/upload \
  -F "file=@test_2mb.txt" \
  -v

# ✅ Respuesta esperada: HTTP/1.1 200 OK
# ❌ Si sigue dando 413, revisar los pasos anteriores
```

### **3. Probar desde la UI**
1. Abrir http://localhost:2012/document-analysis
2. Subir el PDF de 1.74MB
3. Debería funcionar sin error 413

---

## 📊 Resumen de Límites

| Componente | Límite | Configurado |
|------------|--------|-------------|
| **Nginx Global** | 100MB | ✅ `client_max_body_size 100M` |
| **Nginx RAG Location** | 100MB | ✅ `client_max_body_size 100M` |
| **Timeout de Body** | 300s | ✅ `client_body_timeout 300s` |
| **Timeout de Proxy** | 300s | ✅ `proxy_*_timeout 300s` |
| **Buffer de Body** | 128k | ✅ `client_body_buffer_size 128k` |

---

## 🐛 Troubleshooting

### **Si sigue dando 413:**
```bash
# 1. Verificar que el contenedor esté usando la nueva configuración
docker logs frontend | grep "client_max_body_size"

# 2. Verificar variables de entorno
docker exec frontend env | grep RAG

# 3. Rebuild COMPLETO sin caché
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Ver logs en tiempo real
docker logs -f frontend
```

### **Si el backend también da error:**
El backend RAG también necesita aumentar el límite a 100MB en `app.py`:
```python
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
```

---

## ✅ Checklist Final

- [ ] Pull de cambios en el servidor
- [ ] Verificar archivos actualizados (nginx.conf.template, entrypoint.sh)
- [ ] Rebuild del frontend sin caché
- [ ] Verificar configuración generada dentro del contenedor
- [ ] Probar upload con curl
- [ ] Probar upload desde UI
- [ ] Verificar logs para errores

---

## 📝 Notas Adicionales

- **Proxy buffering OFF**: `proxy_request_buffering off` permite uploads progresivos sin cargar todo en memoria
- **HTTP 1.1**: `proxy_http_version 1.1` requerido para chunked transfer encoding
- **Variables de entorno**: `RAG_API_HOST` y `RAG_API_PORT` deben estar definidas en el docker-compose del backend
- **Límite consistente**: Frontend (100MB) debe ser >= Backend (50MB o 100MB)

---

🎯 **Siguiente paso:** Aplicar estos comandos en el servidor de producción y probar el upload de archivos grandes.
