# RentHub

RentHub es una aplicación web **full‑stack** para la gestión de alquileres de propiedades. El proyecto se compone de un frontend en React/TypeScript y un backend REST en Django, todo orquestado mediante Docker Compose junto con una base de datos PostgreSQL.

## Estructura del proyecto

- **renthub-frontend/** – Cliente React creado con Vite y pnpm.
- **renthub-backend/**  – API REST desarrollada con Django y Django REST Framework.
- **renthub-env/**      – Archivos de variables de entorno de ejemplo utilizados por Docker.
- **docker-compose.yml** – Configuración de contenedores para desarrollo.

## Puesta en marcha rápida con Docker

docker-compose build
docker-compose up

El comando anterior levanta PostgreSQL, el backend de Django y el frontend en Nginx. Las variables definidas en `renthub-env` pueden ajustarse según tu entorno local.

## Instalación manual

### Frontend

cd renthub-frontend
pnpm install
pnpm run build

### Backend

cd renthub-backend
pip install -r requirements.txt
python manage.py migrate

Puedes iniciar el servidor de desarrollo con:

python manage.py runserver

El comando `python manage.py init_data` carga datos iniciales en la base de datos (usuarios, tipos de documento, etc.).

## Archivos de entorno

Dentro de la carpeta `renthub-env` encontrarás:

- `backend.env`   – Variables para el backend (Django, base de datos, etc.).
- `frontend.env`  – Variables para el frontend (URL de la API y ajustes de UI).

Copia o modifica estos archivos según tus necesidades antes de ejecutar los contenedores.

## Características principales

- Autenticación y gestión de usuarios personalizada.
- API REST para manejar contratos, pagos y entidades de alquiler.
- Interfaz web React con Material UI y enrutamiento mediante React Router.
- Archivos estáticos y media servidos a través de Nginx.

¡Listo! Con estas instrucciones deberías poder levantar y desarrollar RentHub sin problemas.
