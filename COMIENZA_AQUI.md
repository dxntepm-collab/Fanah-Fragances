# 🚀 COMIENZA AQUÍ

## Inicio Rápido (30 segundos)

### Opción 1: Más Simple (Recomendado)
```bash
pnpm dev:managed
```

### Opción 2: Directo
```bash
pnpm dev
```

### Opción 3: Script Standalone (Windows)
```bash
.\start-dev.ps1
```

---

## ✅ Una vez iniciado...

### URLs de acceso:
- **Tienda**: http://localhost:5173
- **Admin**: http://localhost:5173/admin/login
- **Contraseña Admin**: `Lujo14`

---

## 📚 Documentación Completa

Lee [DESARROLLO.md](./DESARROLLO.md) para:
- Troubleshooting
- Comandos disponibles
- Estructura del proyecto
- Configuración de desarrollo

---

## ⚡ Lo más importante

**El comando `pnpm dev:managed` inicia AMBOS servidores y los mantiene corriendo automáticamente, reiniciándolos si fallan.**

NO dejes los servidores parados. Si alguien intenta entrar al admin y los servidores no están corriendo, no podrá entrar.

---

## 🔧 Requisitos

- Node.js v18+ (verifica con `node --version`)
- pnpm (verifica con `pnpm --version`)

Si no tienes pnpm: `npm install -g pnpm`

---

## 📞 Problemas?

1. Intenta: `pnpm fresh` (limpia e reinstala todo)
2. Lee [DESARROLLO.md](./DESARROLLO.md)
3. Verifica los logs: `.api-server.log` y `.frontend.log`
