import os
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

# Archivos
BASE_DIR = Path(__file__).parent
CREDENTIALS_PATH = BASE_DIR / "crd/credential.json"  # Descarga este desde Google Cloud Console
TOKEN_PATH = BASE_DIR / "crd/token.json"

# Scopes necesarios para enviar emails
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

def main():
    if not CREDENTIALS_PATH.exists():
        print(f"❌ No se encuentra el archivo de credenciales: {CREDENTIALS_PATH}")
        print("Descárgalo desde Google Cloud Console > OAuth 2.0 Client IDs")
        return

    flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
    creds = flow.run_local_server(port=50301, access_type="offline", prompt="consent")

    with open(TOKEN_PATH, "w") as token_file:
        token_file.write(creds.to_json())
    print(f"✅ token.json generado correctamente en {TOKEN_PATH}")
    print("¡Listo! Ahora puedes usar tu backend sin preocuparte por el refresh token.")

if __name__ == "__main__":
    main()
