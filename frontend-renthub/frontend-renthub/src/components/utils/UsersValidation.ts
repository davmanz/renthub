// components/utils/UserValidation.ts
import {UserInterface} from "../../types/types";

export const validateUserForm = (
  formData: UserInterface,
  isEditMode: boolean
): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  if (!formData.first_name) newErrors.first_name = "Nombre requerido";
  if (!formData.last_name) newErrors.last_name = "Apellido requerido";
  if (!formData.email || !formData.email.includes("@")) newErrors.email = "Correo inválido";
  if (!isEditMode && !formData.password) newErrors.password = "Contraseña requerida";
  if (!formData.document_type_id) newErrors.document_type_id = "Tipo de documento requerido";
  if (!formData.document_number) newErrors.document_number = "Número de documento requerido";

  if (formData.references_count > 0 && !formData.reference_1) {
    newErrors.reference_1 = "Referencia 1 requerida";
  }
  if (formData.references_count > 1 && !formData.reference_2) {
    newErrors.reference_2 = "Referencia 2 requerida";
  }

  return newErrors;
};
