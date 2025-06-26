import os
import json
import base64
from pathlib import Path
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request


CORREO = os.environ.get("CORREO_REMITENTE")

TOKEN_PATH = Path(__file__).parent / "crd/token.json"
GMAIL_SENDER = CORREO  

class GmailTokenExpiredError(Exception):
    """Se lanza cuando el token de Gmail ha expirado y no se puede usar."""
    pass

def get_gmail_credentials():
    """Carga y refresca credenciales desde token.json (manejo automático del refresh_token)."""
    if not TOKEN_PATH.exists():
        raise FileNotFoundError(f"No se encuentra el archivo de credenciales: {TOKEN_PATH}")
    with open(TOKEN_PATH, "r") as token_file:
        credentials_info = json.load(token_file)
    creds = Credentials.from_authorized_user_info(credentials_info)

    # Si el token está expirado, refresca automáticamente usando el refresh_token
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Guarda el nuevo token actualizado
            with open(TOKEN_PATH, "w") as token_file:
                token_file.write(creds.to_json())
        except Exception as e:
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
        send_message = service.users().messages().send(userId="me", body={"raw": raw}).execute()
        return send_message

    except HttpError as error:
        if error.resp.status in [401, 403]:
            raise GmailTokenExpiredError("El token de Gmail ha expirado o es inválido. Reautoriza la app en Google.")
        raise

