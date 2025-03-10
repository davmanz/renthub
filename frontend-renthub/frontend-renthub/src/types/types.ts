// src/types/types.ts

export interface Reference {
    id: string; // UUID
    first_name: string;
    last_name: string;
    document_number: string;
    phone_number?: string; // Puede ser null, por eso se marca como opcional
    document_type: string | { id: string; name: string }; // Puede ser un UUID o un objeto con más detalles
  }
  

  export interface DocumentType {
    id: string; // UUID
    name: string;
  }
  