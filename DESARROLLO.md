# 🚀 Fanah Fragances - Desarrollo

Guía para mantener los servidores de desarrollo corriendo sin problemas.

## ⚡ Inicio Rápido

### Windows (PowerShell)
```powershell
# Opción 1: Script automático que mantiene los servidores corriendo
.\start-dev.ps1

# Opción 2: Comando directo
pnpm dev
```

### Linux/Mac
```bash
# Opción 1: Script automático que mantiene los servidores corriendo
./start-dev.sh

# Opción 2: Comando directo
pnpm dev
```

## 📍 URLs de Acceso

Una vez iniciados los servidores:

- **Frontend (Tienda)**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
- **API Server**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## 🔐 Credenciales del Admin

- **Usuario**: (sin usuario, solo contraseña)
- **Contraseña**: `Lujo14`

## 📦 Estructura de Servidores

### API Server (puerto 3000)
- Stack: Express.js + TypeScript
- Base de datos: Firebase Firestore
- Ubicación: `artifacts/api-server`
- Comando: `pnpm -C artifacts/api-server dev`

### Frontend (puerto 5173)
- Stack: React + Vite + TypeScript
- UI Framework: Radix UI + Tailwind CSS
- Ubicación: `artifacts/decants-shop`
- Comando: `pnpm -C artifacts/decants-shop dev`

## 🛠️ Comandos Disponibles

```bash
# Iniciar ambos servidores en paralelo (recomendado)
pnpm dev

# Iniciar solo API server
pnpm dev:api

# Iniciar solo frontend
pnpm dev:frontend

# Iniciar limpio (elimina node_modules y reinstala)
pnpm fresh

# Verificar tipos TypeScript
pnpm typecheck

# Build para producción
pnpm build
```

## 🔄 Auto-reinicio de Servidores

Los scripts `start-dev.ps1` (Windows) y `start-dev.sh` (Linux/Mac) incluyen:

- ✅ Verificación de puertos en uso
- ✅ Limpieza automática de procesos anteriores
- ✅ Monitoreo continuo de servidores
- ✅ **Auto-reinicio si un servidor se cae**
- ✅ Logs en tiempo real

## 🐛 Solución de Problemas

### Puerto ya en uso

Si ves error "Port 5173 is already in use":

```powershell
# Windows
Get-Process -Name node | Stop-Process -Force

# Linux/Mac
killall node
```

### API Server no responde

```bash
# Verificar si está corriendo
curl http://localhost:3000/api/health

# Ver logs del API
tail -f .api-server.log  # Linux/Mac
Get-Content -Tail 50 -Wait .api-server.log  # Windows
```

### Frontend no carga

```bash
# Verificar si está corriendo
curl http://localhost:5173/

# Ver logs del frontend
tail -f .frontend.log  # Linux/Mac
Get-Content -Tail 50 -Wait .frontend.log  # Windows
```

### Limpiar todo y empezar de nuevo

```bash
pnpm fresh
```

## 📊 Monitoreo

### Ver estado de los servidores

```bash
# Listar procesos Node en Windows
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Ver qué usa los puertos
netstat -ano | findstr "3000\|5173"  # Windows
lsof -i :3000,:5173  # Linux/Mac
```

## 🔧 Configuración de Variables de Entorno

### API Server (.env.local)
```
PORT=3000
NODE_ENV=development
ADMIN_PASSWORD=Lujo14
FIREBASE_SERVICE_ACCOUNT={...}
```

### Frontend (.env)
```
PORT=5173
BASE_PATH=/
```

Ambos están pre-configurados, no es necesario cambiarlos.

## 💾 Datos en Firestore

- Base de datos: `fanah-fragances`
- Colecciones: `products`, `brands`, `orders`, `carts`
- Autenticación: Firebase Admin SDK

## 🚨 Importante

**NUNCA dejes los servidores parados** cuando estés trabajando. Si se caen:

1. Los usuarios no podrán acceder a la tienda
2. El admin panel no funcionará
3. Las órdenes no se guardarán

**Solución**: Usa `start-dev.ps1` o `pnpm dev` que mantienen los servidores en línea automáticamente.

## 📞 Soporte

Si algo falla:
1. Verifica que Node.js esté instalado (`node --version`)
2. Verifica que pnpm esté instalado (`pnpm --version`)
3. Ejecuta `pnpm fresh` para limpiar e reinstalar
4. Revisa los logs (`.api-server.log`, `.frontend.log`)
5. Asegúrate de estar en el directorio raíz del proyecto
