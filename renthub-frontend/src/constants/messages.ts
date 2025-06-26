export const MESSAGES = {
  SUCCESS: "✅ Tu cuenta ha sido verificada correctamente.",
  REDIRECT: "Serás redirigido al inicio de sesión...",
  ERROR: "❌ Hubo un problema al verificar tu cuenta. Es posible que el token ya haya sido usado.",
  INVALID: "🚫 El enlace de verificación es inválido. Verifica que la URL esté completa."
} as const;

export const TIMING = {
  FADE_DELAY: 200,
  REDIRECT_DELAY: 4000
} as const;
