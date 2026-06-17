# 🚀 Despliegue en Vercel - Fanah Fragances

Guía paso a paso para desplegar la aplicación en Vercel.

## 📋 Requisitos Previos

1. **Cuenta de Vercel** - Regístrate en [vercel.com](https://vercel.com)
2. **Firebase Project** - Debes tener un proyecto en Firebase con Firestore habilitado
3. **Git Repository** - El código debe estar en un repositorio Git (GitHub, GitLab, Bitbucket)
4. **Firebase Service Account** - Credenciales de Firebase en formato JSON

## 🔧 Preparación Previa

### 1. Obtener las Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del Proyecto** → **Cuentas de Servicio**
4. Haz clic en **Generar Nueva Clave Privada**
5. Se descargará un archivo JSON con tus credenciales

### 2. Convertir JSON a Formato de Línea Única

Las credenciales de Firebase deben ser una **línea única minificada** sin saltos de línea:

```bash
# En PowerShell (Windows):
$json = Get-Content "path/to/firebase-key.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
Write-Host $json
```

```bash
# En Linux/Mac:
cat path/to/firebase-key.json | jq -c . > firebase-key-minified.txt
cat firebase-key-minified.txt
```

Copia el resultado completo (sin espacios ni saltos de línea).

## 📦 Pasos de Despliegue

### Opción 1: Dashboard de Vercel (Recomendado)

1. **Conectar Repositorio**
   - Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
   - Haz clic en "New Project"
   - Selecciona tu repositorio de GitHub/GitLab/Bitbucket

2. **Configurar Build Settings**
   - Framework: Dejarlo como "Other"
   - Build Command: `pnpm build`
   - Install Command: `pnpm install --no-frozen-lockfile`
   - Output Directory: `artifacts/decants-shop/dist/public`
   - Root Directory: `.` (raíz del monorepo)

3. **Configurar Variables de Entorno**
   
   Haz clic en "Environment Variables" y agrega:

   | Variable | Valor | Notas |
   |----------|-------|-------|
   | `ADMIN_USERNAME` | `admin` | Cambiar en producción |
   | `ADMIN_PASSWORD` | `Lujo 14` | Cambiar en producción |
   | `SESSION_SECRET` | `tu-clave-aleatoria-segura` | Generar una nueva |
   | `FIREBASE_SERVICE_ACCOUNT` | `{minified JSON}` | **Copiar la línea única sin saltos** |
   | `PORT` | `3001` | Vercel lo ignora, pero es requerido |

   **⚠️ IMPORTANTE**: El `FIREBASE_SERVICE_ACCOUNT` debe ser una **línea única** sin saltos de línea ni espacios adicionales.

4. **Deploy**
   - Haz clic en "Deploy"
   - Espera a que se complete el build
   - Tu app estará disponible en: `https://tu-proyecto.vercel.app`

### Opción 2: Usando Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desde la raíz del proyecto
vercel

# 3. Responde las preguntas:
# - Link to existing project? → No (primera vez) / Yes (proyectos existentes)
# - Project name? → fanah-fragances (o tu nombre preferido)
# - In which directory is your code? → . (punto - raíz)
# - Want to override settings? → Yes

# 4. Agregue las variables de entorno:
vercel env add ADMIN_USERNAME admin
vercel env add ADMIN_PASSWORD "Lujo 14"
vercel env add SESSION_SECRET "tu-clave-segura"
vercel env add FIREBASE_SERVICE_ACCOUNT "{minified-json}"
vercel env add PORT 3001

# 5. Deploy
vercel --prod
```

## 🔐 Variables de Entorno - Guía Detallada

### ADMIN_USERNAME y ADMIN_PASSWORD
Las credenciales para acceder al panel admin.
```
/admin/login
Username: admin
Password: Lujo 14
```

### SESSION_SECRET
Clave para firmar las cookies de sesión. Genera una string aleatoria y segura:
```bash
# En PowerShell:
-join ((1..32) | ForEach-Object { [char][byte]@(33..126) | Get-Random })

# En Linux/Mac:
openssl rand -hex 32
```

### FIREBASE_SERVICE_ACCOUNT
Debe ser exactamente así (UNA SOLA LÍNEA, sin espacios extra ni saltos):

```
{"type":"service_account","project_id":"tu-proyecto","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com"}
```

**Validar en Vercel:**
1. Copia la línea completa
2. Pégala en la variable `FIREBASE_SERVICE_ACCOUNT`
3. Vercel debe mostrar "✓ Saved"

## ✅ Verificar el Deploy

Después del deploy:

1. **Acceder a la tienda:**
   - URL: `https://tu-proyecto.vercel.app`
   - Debe cargar con colores turquesa/azul cristalino

2. **Acceder al admin:**
   - URL: `https://tu-proyecto.vercel.app/admin/login`
   - Username: `admin`
   - Password: `Lujo 14`

3. **Verificar health check:**
   - URL: `https://tu-proyecto.vercel.app/api/healthz`
   - Debe retornar JSON con status `"ok"`

4. **Crear un pedido de prueba:**
   - Agregar un producto al carrito
   - Ir a checkout
   - Seleccionar "Delivery Piura" o "Envío a Provincia"
   - Seleccionar "Yape" o "Contraentrega"
   - Verificar que el flujo sea correcto

## 🚨 Solución de Problemas

### Error: "Build failed"
- Verifica que el `FIREBASE_SERVICE_ACCOUNT` esté en una línea única
- Asegúrate que `SESSION_SECRET` no esté vacío
- Revisa los logs en Vercel dashboard

### Error: "Cannot find module"
- Ejecuta `pnpm install --no-frozen-lockfile` localmente
- Verifica que el `pnpm-lock.yaml` esté actualizado
- Sube el lock file al repositorio

### Error: "CORS o variables de entorno no cargadas"
- Verifica que las variables estén en la pestaña "Environment Variables" (no en `.env` local)
- Haz un redeploy manual: Ve a Vercel → Project → Deployments → Selecciona el último → "Redeploy"

### API retorna 500
- Verifica que `FIREBASE_SERVICE_ACCOUNT` esté correctamente formateado
- Comprueba los logs en Vercel: Project → Deployments → Functions (tab)
- Valida que las credenciales de Firebase sean correctas

## 📝 Actualizar Cambios

Después de hacer cambios en el código:

```bash
# 1. Haz commit y push a tu rama
git add .
git commit -m "Descripción de cambios"
git push origin main

# 2. Vercel desplegará automáticamente
# (si tienes configurado GitHub integration)

# O manualmente:
vercel --prod
```

## 🎯 Métodos de Pago y Envío

**Métodos de Envío Disponibles:**
- Delivery Piura (S/ 15.00)
- Envío a Provincia (S/ 25.00)
- Recojo (Gratis)

**Métodos de Pago Disponibles:**
- **Yape**: Muestra número y QR para pagar
- **Contraentrega**: Muestra confirmación inmediata

## 🎨 Personalización

La aplicación usa un **esquema de colores turquesa/azul cristalino**. Para cambiar colores, edita:

```
artifacts/decants-shop/src/index.css
```

Busca la sección de colores:
```css
--primary: 185 75% 48%; /* Azul turquesta cristalino */
```

Después de cambios, redeploy:
```bash
vercel --prod
```

## 📞 Soporte

Para problemas o dudas:
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- GitHub Issues: Abre un issue en el repositorio

---

**¡Tu aplicación está lista para producción! 🎉**
