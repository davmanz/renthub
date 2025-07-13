import os
import json
import base64
import logging
import traceback
from pathlib import Path
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request


# Configura el logger al inicio del módulo
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CORREO = os.environ.get("CORREO_REMITENTE")
TOKEN_PATH = Path(__file__).parent / "crd/token.json"
GMAIL_SENDER = CORREO


class GmailTokenExpiredError(Exception):
    """Se lanza cuando el token de Gmail ha expirado y no se puede usar."""
    pass


def get_gmail_credentials():
    """Carga y refresca credenciales desde token.json (manejo automático del refresh_token)."""
    logger.debug(f"Intentando cargar credenciales desde {TOKEN_PATH}")
    if not TOKEN_PATH.exists():
        msg = f"No se encuentra el archivo de credenciales: {TOKEN_PATH}"
        logger.error(msg)
        raise FileNotFoundError(msg)

    with open(TOKEN_PATH, "r") as token_file:
        credentials_info = json.load(token_file)

    creds = Credentials.from_authorized_user_info(credentials_info)
    logger.debug(f"Credenciales cargadas. Expiradas: {creds.expired}, Tiene refresh_token: {bool(creds.refresh_token)}")

    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            with open(TOKEN_PATH, "w") as token_file:
                token_file.write(creds.to_json())
            logger.info("Token de Gmail refrescado y guardado con éxito.")
        except Exception as e:
            tb = traceback.format_exc()
            logger.error(f"No se pudo refrescar el token de Gmail: {e}\n{tb}")
            raise GmailTokenExpiredError(f"No se pudo refrescar el token: {e}")

    return creds


def send_gmail_api_email(to_email, subject, message_text):
    """
    Envía un correo usando Gmail API. Refresca el token automáticamente si es necesario.
    """
    try:
        creds = get_gmail_credentials()
        service = build("gmail", "v1", credentials=creds)

        message = MIMEText(message_text)
        message["to"] = to_email
        message["from"] = GMAIL_SENDER
        message["subject"] = subject

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        logger.debug(f"Enviando mensaje a {to_email} con asunto '{subject}'")
        send_message = service.users().messages().send(userId="me", body={"raw": raw}).execute()
        logger.info(f"Correo enviado correctamente, ID del mensaje: {send_message.get('id')}")
        return send_message

    except HttpError as error:
        status = getattr(error.resp, "status", "desconocido")
        try:
            # Extrae detalles del error si los hay
            error_details = error.error_details or error.content.decode("utf-8")
        except Exception:
            error_details = str(error)
        tb = traceback.format_exc()
        logger.error(f"HttpError al enviar correo (status {status}): {error_details}\n{tb}")
        if status in [401, 403]:
            raise GmailTokenExpiredError("El token de Gmail ha expirado o es inválido. Reautoriza la app en Google.")
        raise

    except Exception as e:
        # Cualquier otro error inesperado
        tb = traceback.format_exc()
        logger.error(f"Error inesperado al enviar correo: {e}\n{tb}")
        raise
