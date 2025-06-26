// utils/validateImageFile.ts

export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];
export const MAX_FILE_SIZE_MB = 5;

export function validateImageFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;

  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return `Formato no permitido: ${ext}. Solo se permiten ${ALLOWED_IMAGE_EXTENSIONS.join(", ").toUpperCase()}.`;
  }

  if (file.size > maxSize) {
    return `El archivo supera el tamaño máximo permitido de ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null; // ✅ válido
}
