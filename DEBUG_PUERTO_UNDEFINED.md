# 🐛 DEBUG: Puerto Undefined

## Problema
Los modelos muestran `puerto undefined` al intentar hacer requests:
```
http://169.62.182.38:2012/proxy/undefined/completion
```

## Cambios Realizados

### 1. ✅ Componente de Debug Agregado
**Archivo:** `src/components/DebugConfig.jsx`

Componente temporal que muestra:
- Variables de entorno (`import.meta.env.VITE_*`)
- Objeto `config` completo
- Puertos de modelos disponibles

**Visible en:** Parte inferior de ChatbotPage (barra negra con texto verde)

### 2. ✅ Logs en chatbotService
**Archivo:** `src/services/chatbotService.js`

Agregados logs en consola para ver:
```javascript
console.log("🐛 [chatbotService] sendCompletion called with:", {
  modelId: model.id,
  modelName: model.name,
  modelPort: model.port,
  modelObject: model
});
```

### 3. ✅ Configuración Corregida
**Archivo:** `src/config/environment.js`

- ❌ Eliminado: DeepSeek 1.5B (no existe en docker-compose)
- ✅ Mantenidos: 5 modelos reales (Gemma 2B/4B/12B, Mistral 7B, DeepSeek 8B)

---

## 🔍 Pasos de Debugging

### Paso 1: Verificar Variables de Entorno en Build

**En el servidor (donde está el docker-compose):**

```bash
cd /root/BackAI

# Ver qué variables se están pasando al build
docker-compose config | grep -A 20 "frontend:"

# Rebuild del frontend SIN CACHE
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Ver logs del build
docker-compose logs frontend | grep -i "vite"
```

### Paso 2: Inspeccionar el Container

```bash
# Entrar al container
docker exec -it frontend sh

# Ver variables de entorno del build (si están disponibles)
env | grep VITE

# Ver el dist compilado
cat /usr/share/nginx/html/index.html | grep -o "VITE_[A-Z_]*" | sort | uniq
```

### Paso 3: Verificar en el Navegador

1. Abrir http://169.62.182.38:2012
2. Ir a ChatbotPage
3. **Mirar la barra negra en la parte inferior** (DebugConfig)
4. Abrir DevTools Console (F12)
5. Buscar logs que empiecen con `🐛 [chatbotService]`

**Deberías ver:**
```javascript
🐛 [chatbotService] sendCompletion called with: {
  modelId: "gemma-2b",
  modelName: "Gemma 2B",
  modelPort: "8085",  // <-- Esto NO debe ser undefined
  modelObject: {...}
}
```

### Paso 4: Verificar el .env del Backend

```bash
cd /root/BackAI
cat .env | grep -E "GEMMA|MISTRAL|DEEPSEEK"
```

**Debe mostrar:**
```bash
GEMMA_2B_PORT=8085
GEMMA_4B_PORT=8086
GEMMA_12B_PORT=8087
MISTRAL_PORT=8088
DEEPSEEK_8B_PORT=8089
```

---

## 📊 Diagnóstico Esperado

### Caso A: Variables NO llegan al build
**Síntoma:** DebugConfig muestra `undefined` en ENV VARS

**Causa:** Variables no se pasan en `docker-compose build`

**Solución:**
```bash
# Verificar que docker-compose.yml tenga:
build:
  args:
    - VITE_GEMMA_2B_PORT=${GEMMA_2B_PORT}
    # ... etc
```

### Caso B: Variables llegan pero config.llm.availableModels tiene undefined
**Síntoma:** ENV VARS ok, pero `availableModels[].port` es undefined

**Causa:** Bug en `environment.js` al leer `import.meta.env`

**Solución:** Verificar que Vite esté embebiendo las variables en build time

### Caso C: Todo OK en DebugConfig pero request falla
**Síntoma:** Puertos correctos en debug pero URL tiene `undefined`

**Causa:** Bug en cómo se pasa el modelo al chatbotService

**Solución:** Revisar `ChatbotPage.jsx` línea donde se llama `chatbotService.sendCompletion()`

---

## 🧪 Test Rápido

### Desarrollo Local (sin Docker)

```bash
cd c:\Users\LucasEmanuelJung\Desktop\Lucas\IBM\IBM-AI-FRONT

# Crear .env (si no existe)
copy .env.example .env

# Editar .env y agregar:
# VITE_API_HOST=169.62.182.38
# VITE_GEMMA_2B_PORT=8085
# VITE_GEMMA_4B_PORT=8086
# VITE_GEMMA_12B_PORT=8087
# VITE_MISTRAL_PORT=8088
# VITE_DEEPSEEK_8B_PORT=8089

# Instalar (si no lo has hecho)
npm install

# Iniciar dev server
npm run dev
```

Abrir http://localhost:5173 y ver si DebugConfig muestra puertos correctos.

---

## 📝 Checklist

- [ ] Variables en `.env` del backend están correctas
- [ ] `docker-compose.yml` pasa todas las variables con `VITE_*` prefix
- [ ] `Dockerfile` declara TODOS los `ARG VITE_*` y `ENV VITE_*`
- [ ] Rebuild con `--no-cache` completado
- [ ] DebugConfig muestra puertos correctos en navegador
- [ ] Logs de consola muestran `modelPort` correcto
- [ ] Request NO contiene `/proxy/undefined/`

---

## 🚨 Si Nada Funciona

### Opción Nuclear: Hardcodear temporalmente

En `src/config/environment.js`:

```javascript
// TEMPORAL: Hardcodear puertos para debugging
availableModels: [
  {
    id: "gemma-2b",
    name: "Gemma 2B",
    port: "8085", // HARDCODED
    // ...
  },
  // ...
]
```

Esto confirmará si el problema es:
- Variables de entorno (si hardcodeo funciona)
- Otra cosa (si hardcodeo también falla)

---

## 📞 Siguiente Paso

**Ejecuta Paso 1 y Paso 3**, luego reporta:

1. ¿Qué muestra DebugConfig en la barra negra?
2. ¿Qué dicen los logs de consola con `🐛`?
3. ¿La URL sigue teniendo `undefined`?

Con esa info sabremos EXACTAMENTE dónde está el problema.
