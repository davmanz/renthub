from pathlib import Path
from datetime import timedelta
import os
# from dotenv import load_dotenv

# Load environment variables from .env file
# load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

#Parseo de hosthosts_env = os.environ.get("ALLOWED_HOSTS", "")
hosts_env = os.environ.get("ALLOWED_HOSTS", "")
if hosts_env:
    # Separa por comas y quita espacios sobrantes
    ALLOWED_HOSTS = [h.strip() for h in hosts_env.split(",")]
else:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False").lower() in ("1", "true", "yes")
# FRONTEND_URL
FRONTEND_URL = os.environ.get("FRONTEND_URL")
# DOMINIO
DOMINIO = os.environ.get("DOMINIO", "localhost")
# AXES_FAILURE_LIMIT
AXES_FAILURE = os.environ.get("AXES_FAILURE_LIMIT", 5)
# AXES_COOLOFF_TIME
AXES_COOLOFF = os.environ.get("AXES_COOLOFF_TIME", 5)
# AXES_LOCKOUT_PARAMETERS
AXES_LOCKOUT = [os.environ.get("AXES_LOCKOUT_PARAMETERS"), "ip_address"]
AXES_RESET = os.environ.get("AXES_RESET_ON_SUCCESS", True) 
TIME_Z = os.environ.get("TIME_ZONE", "UTC")

# Variables de la base de datos
USER= os.environ.get("POSTGRES_USER", default="renthub")
PASSWORD= os.environ.get("POSTGRES_PASSWORD", default="renthub")
HOST= os.environ.get("POSTGRES_HOST", default="localhost")
PORT= os.environ.get("POSTGRES_PORT", default="5432")
NAME= os.environ.get("POSTGRES_DB", default="renthub_db")

# Variables Database
POSTGRES_DB = {
    "NAME": NAME,
    "USER": USER,
    "PASSWORD":PASSWORD,
    "HOST": HOST,
    "PORT": PORT,
}

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "rest_framework",
    "rest_framework_simplejwt",
    "axes",
    "core",
    "corsheaders",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'axes.middleware.AxesMiddleware',
]

ROOT_URLCONF = 'renthub.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'renthub.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': POSTGRES_DB["NAME"],
        'USER': POSTGRES_DB["USER"],
        'PASSWORD': POSTGRES_DB["PASSWORD"],
        'HOST': POSTGRES_DB["HOST"],
        'PORT': POSTGRES_DB["PORT"],
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = TIME_Z

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = "core.CustomUser"

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'axes.backends.AxesStandaloneBackend'
]

# Configuracion de Rest Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# Configuracion de Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
}
# Configuracion de Axes
AXES_FAILURE_LIMIT = AXES_FAILURE
AXES_COOLOFF_TIME = timedelta(minutes=int(AXES_COOLOFF))
AXES_LOCKOUT_PARAMETERS = AXES_LOCKOUT
AXES_RESET_ON_SUCCESS = AXES_RESET 

CORS_ALLOWED_ORIGINS = [
    str(FRONTEND_URL),
]

CORS_ALLOW_CREDENTIALS = True  # Para permitir el envío de cookies y headers de autenticación

# Indica a Django que confíe en el header X-Forwarded-Proto para detectar HTTPS correctamente
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Opcionalmente, fuerza a que siempre use HTTPS para las URLs generadas por build_absolute_uri()
SECURE_SSL_REDIRECT = True  # (recomendado si solo usas HTTPS)