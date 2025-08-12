# Para levantar toda la demo
npm run demo

# Para ver logs
npm run docker:logs

# Para bajar todo
npm run docker:stop

# Construir y ejecutar
docker-compose up -d --build

# Ver la app en http://localhost:3000

# Parar todo
docker-compose down

# Paso 1: Clonar repositorio
git clone <tu-repositorio>
cd bancoMarfil

# Paso 2: Verificar docker
docker --version
docker-compose --version

# Paso 3: Levantar
docker-compose up -d --build
