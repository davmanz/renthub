import os
import json
import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


TOKEN_PATH = os.path.join(os.path.dirname(__file__), "token.json")

def get_gmail_credentials():
    """Carga las credenciales desde un archivo token.json local"""
    with open(TOKEN_PATH, "r") as token_file:
        credentials_info = json.load(token_file)
    return Credentials.from_authorized_user_info(credentials_info)


def send_gmail_api_email(to_email, subject, message_text):
    """
    Envía un correo utilizando la API de Gmail desde token.json.
    
    Parámetros:
    - to_email: dirección del destinatario
    - subject: asunto del mensaje
    - message_text: cuerpo del correo
    """
    try:
        creds = get_gmail_credentials()
        service = build("gmail", "v1", credentials=creds)

        message = MIMEText(message_text)
        message["to"] = to_email
        message["from"] = "davidmanzanocolombia@gmail.com"  # Reemplaza por tu correo autorizado
        message["subject"] = subject

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        send_message = service.users().messages().send(userId="me", body={"raw": raw}).execute()
        return send_message

    except HttpError as error:
        print(f"Error al enviar el correo: {error}")
        return None
