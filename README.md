# RentHub

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-22+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/django-5.1-green.svg)](https://www.djangoproject.com/)

RentHub es una aplicación web **full‑stack** para la gestión de alquileres de propiedades. El proyecto se compone de un frontend en React/TypeScript y un backend REST en Django, todo orquestado mediante Docker Compose junto con una base de datos PostgreSQL.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
  - [Con Docker (Recomendado)](#con-docker-recomendado)
  - [Instalación Manual](#instalación-manual)
- [Configuración](#configuración)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Contribuir](#contribuir)
- [Seguridad](#seguridad)
- [Licencia](#licencia)

## ✨ Características

- 🔐 **Autenticación JWT** con roles de usuario (superadmin, admin, tenant)
- 👥 **Gestión de usuarios** personalizada con verificación de email
- 📄 **Gestión de contratos** de alquiler con documentación
- 💳 **Historial de pagos** y seguimiento de rentas
- 🧺 **Reservas de lavandería** con sistema de turnos
- 🏢 **Gestión de edificios** y habitaciones
- 📊 **Dashboard** con estadísticas y métricas
- 🔒 **Seguridad robusta** con rate limiting y protección contra fuerza bruta
- 📱 **Interfaz responsive** con Material UI
- 🐳 **Despliegue fácil** con Docker

## 📁 Estructura del Proyecto

```
renthub/
├── renthub-frontend/      # Cliente React con TypeScript y Vite
│   ├── src/
│   │   ├── api/          # Configuración de API y endpoints
│   │   ├── components/   # Componentes React reutilizables
│   │   ├── constants/    # Constantes y configuraciones
│   │   ├── context/      # Context API (Auth, etc.)
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── routes/       # Configuración de rutas
│   │   └── types/        # Definiciones de tipos TypeScript
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── renthub-backend/       # API REST con Django
│   ├── core/             # Aplicación principal
│   │   ├── models.py     # Modelos de datos
│   │   ├── views.py      # Vistas y endpoints
│   │   ├── serializers.py # Serializers DRF
│   │   ├── permissions.py # Permisos personalizados
│   │   └── management/   # Comandos personalizados
│   ├── renthub/          # Configuración del proyecto
│   ├── Dockerfile
│   └── requirements.txt
├── renthub-env/          # Variables de entorno de ejemplo
│   ├── backend.env.example
│   └── frontend.env.example
├── docker-compose.yml    # Orquestación de servicios
├── SECURITY.md          # Políticas de seguridad
├── CONTRIBUTING.md      # Guía de contribución
└── README.md
```

## 🔧 Requisitos Previos

### Para Docker (Recomendado)
- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

### Para Instalación Manual
- [Python](https://www.python.org/downloads/) 3.12+
- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/installation) 9+
- [PostgreSQL](https://www.postgresql.org/download/) 15+

## 🚀 Instalación

### Con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/davmanz/renthub.git
   cd renthub
   ```

2. **Configurar variables de entorno**
   ```bash
   cp renthub-env/backend.env.example renthub-env/backend.env
   cp renthub-env/frontend.env.example renthub-env/frontend.env
   ```
   
   Edita los archivos `.env` con tus configuraciones:
   - Genera un `SECRET_KEY` seguro para Django
   - Configura credenciales de base de datos
   - Ajusta URLs según tu entorno

3. **Construir y levantar servicios**
   ```bash
   docker-compose build
   docker-compose up
   ```

4. **Inicializar base de datos** (en otra terminal)
   ```bash
   docker-compose exec renthub-backend python manage.py migrate
   docker-compose exec renthub-backend python manage.py init_data
   ```

5. **Acceder a la aplicación**
   - Frontend: https://localhost
   - Backend API: https://localhost/api
   - Admin Panel: https://localhost/api/admin

### Instalación Manual

#### Backend

1. **Configurar entorno virtual**
   ```bash
   cd renthub-backend
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar base de datos PostgreSQL**
   ```bash
   # Crear base de datos
   createdb renthub_db
   ```

4. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en renthub-backend con las variables necesarias
   export SECRET_KEY="tu-secret-key-aqui"
   export POSTGRES_DB="renthub_db"
   export POSTGRES_USER="tu-usuario"
   export POSTGRES_PASSWORD="tu-password"
   # ... más variables según backend.env.example
   ```

5. **Ejecutar migraciones**
   ```bash
   python manage.py migrate
   python manage.py init_data
   ```

6. **Iniciar servidor**
   ```bash
   python manage.py runserver
   ```

#### Frontend

1. **Instalar dependencias**
   ```bash
   cd renthub-frontend
   pnpm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp ../renthub-env/frontend.env.example .env
   # Editar .env con la URL del backend
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   pnpm run dev
   ```

4. **O construir para producción**
   ```bash
   pnpm run build
   pnpm run preview
   ```

## ⚙️ Configuración

### Variables de Entorno

#### Backend (backend.env)
- `SECRET_KEY`: Clave secreta de Django (obligatorio)
- `DEBUG`: Modo debug (False en producción)
- `ALLOWED_HOSTS`: Hosts permitidos
- `POSTGRES_*`: Configuración de PostgreSQL
- `EMAIL_*`: Configuración de email
- `AXES_*`: Configuración de seguridad

#### Frontend (frontend.env)
- `VITE_API_URL`: URL del backend API

Ver archivos `.env.example` para más detalles.

### Datos Iniciales

El comando `python manage.py init_data` crea:
- Tipos de documento (DNI, Pasaporte, etc.)
- Usuario superadmin por defecto
- Datos de ejemplo para desarrollo

## 🎯 Uso

### Roles de Usuario

- **Superadmin**: Control total del sistema
- **Admin**: Gestión de contratos, pagos y usuarios
- **Tenant**: Inquilino con acceso a su información

### Funcionalidades Principales

1. **Gestión de Usuarios**
   - Registro y verificación por email
   - Perfiles con foto y referencias
   - Cambio de contraseña seguro

2. **Gestión de Contratos**
   - Crear y editar contratos de alquiler
   - Adjuntar documentación
   - Seguimiento de fechas y montos

3. **Pagos**
   - Registrar pagos de renta
   - Historial completo
   - Comprobantes

4. **Lavandería**
   - Reservar turnos
   - Ver disponibilidad
   - Gestión de vouchers

## 🛠️ Desarrollo

### Ejecutar Tests

```bash
# Backend
cd renthub-backend
python manage.py test

# Frontend
cd renthub-frontend
pnpm test
```

### Linting

```bash
# Backend (configurar primero flake8, black)
flake8 .
black .

# Frontend
pnpm run lint
```

### Crear Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

## 🧪 Testing

El proyecto incluye tests para componentes críticos:
- Tests de modelos y serializers
- Tests de autenticación y permisos
- Tests de endpoints de API

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de testing.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## 🔒 Seguridad

Para reportar vulnerabilidades de seguridad, consulta [SECURITY.md](SECURITY.md).

Características de seguridad:
- ✅ Autenticación JWT
- ✅ Rate limiting
- ✅ Protección contra fuerza bruta (Django Axes)
- ✅ CORS configurado
- ✅ HTTPS enforcement
- ✅ Validación de archivos subidos
- ✅ Contraseñas hasheadas

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- **David Manzanares** - [davmanz](https://github.com/davmanz)

## 🙏 Agradecimientos

- Django y Django REST Framework
- React y Material UI
- Comunidad open source

---

**Nota**: Este es un proyecto en desarrollo activo. Las características pueden cambiar.

Para más información, consulta la documentación en el repositorio o abre un issue.
