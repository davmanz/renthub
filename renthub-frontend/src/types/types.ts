// =====================
// Documentos y Referencias
// =====================

export interface DocumentType {
  id: string;
  name: string;
}

export interface ReferencePerson {
  id: string;
  first_name: string;
  last_name: string;
  document_type: DocumentType;
  document: {
    name: string; // ID del tipo de documento
    number: string; // Número del documento
  };
  document_number: string;
  phone_number?: string | null;
}

// =====================
// Usuario y Formularios
// =====================

export type UserRole = "superadmin" | "admin" | "tenant";

export interface UserInterface {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
  document_type: DocumentType
  document_number: string;
  profile_photo: string | null;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  reference_1: ReferencePerson | null;
  reference_2: ReferencePerson | null;
  payments?: Payment[]; // solo si es necesario
}

// Formulario de creación/edición de usuario
export interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  document_type_id: string;   // UUID del tipo de documento
  document_number: string;
  reference_1_id?: string | null; // Opcional, puede ser null
  reference_2_id?: string | null; // Opcional, puede ser null
  role?: UserRole;
  profile_photo?: File | null;
  password?: string; // solo si se va a crear un nuevo usuario
  references_count?: number; // Indica cuántas referencias se han proporcionado
}


export interface UserEditFormData
  extends Omit<UserFormData, "password"> {
  password?: string; // solo si se va a cambiar
}

// =====================
// Solicitud de Cambios (ChangeRequest)
// =====================

export interface Changes {
  first_name?: string;
  last_name?: string;
  email?: string;
  document_number?: string;
  phone_number?: string;
  document_type?: DocumentType;
  profile_photo?: string | null;
}

export interface ChangeRequest {
  id: string;
  user: { id: string; name: string };
  changes: Changes;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_by: string | null;
  review_comment: string | null;
}

// =====================
// Habitaciones y Edificios
// =====================

export interface Room {
  id: string;
  room_number: number;
  is_occupied: boolean;
  building: string;
  building_name?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  created_at: string;
}

// =====================
// Contratos
// =====================

export interface Contract {
  id: string;
  user: string | UserInterface;
  user_full_name?: string;
  room: string | Room;
  room_number?: number;
  building_name?: string;
  start_date: string;
  end_date: string;
  rent_amount: string | number;
  deposit_amount: string | number;
  includes_wifi: boolean;
  wifi_cost?: string | number;
  is_overdue?: boolean;
  next_month?: {
    id: string;
    payment: string;
    voucher: string | null;
    status: string;
    admin_comment: string | null;
  };
  contract_photo?: string | null;
}

export interface ContractFormData {
  user: string;
  room: string;
  start_date: string;
  end_date: string;
  rent_amount: string;
  deposit_amount: string;
  includes_wifi: boolean;
  wifi_cost?: string;
}

// =====================
// Pagos de Arriendo
// =====================

export interface RentPayment {
  id: string;
  contract: {
    id: string;
    building: string;
    room: number | string;
  };
  month_paid: string;
  receipt_image?: File; // solo para subir desde el frontend
  receipt_image_url?: string | null; // GET
  payment_date?: string | null;
  status: "overdue" | "pending_review" | "upcoming" | "approved" | "rejected";
  admin_comment?: string | null;
  user_comment?: string | null;
}

// =====================
// Lavandería
// =====================

export interface LaundryBooking {
  id: string;
  user: string | UserInterface;
  user_full_name?: string;
  date: string;
  time_slot: string;
  status: "pending" | "approved" | "rejected" | "proposed" | "counter_proposal";
  admin_comment?: string | null;
  user_comment?: string | null;
  voucher_image?: File; // solo para subir
  voucher_image_url?: string | null; // GET
  voucher_path?: string | null; // así debe estar para coincidir con el backend
  proposed_date?: string | null;
  proposed_time_slot?: string | null;
  counter_proposal_date?: string | null;
  counter_proposal_time_slot?: string | null;
  last_action_by?: "user" | "admin";
  user_response?: "pending" | "accepted" | "rejected";
  created_at?: string;
  updated_at?: string;
  pending_action?: "user" | "admin" | null; 
}

// =====================
// Payments
// =====================
type PaymentStatus = "approved" | "pending_review" | "rejected" | "overdue" | "upcoming";
export interface Payment {
  id: string;
  user: { id: string; name: string };
  status: PaymentStatus;
  admin_comment?: string | null;
  user_comment?: string | null;
  voucher_path?: string | null;
  contract?: {
    id: string;
    building: string;
    room_number: string | number;
  };
  month_paid: string;
  payment_date?: string | null;
  date?: string;
  time_slot?: string;
  proposed_date?: string;
  proposed_time_slot?: string;
  counter_proposal_date?: string;
  counter_proposal_time_slot?: string;
  receipt_image_url?: string | null; // URL de la imagen del recibo
  // ...otros campos que tu dashboard consuma
}


// =====================
// Dashboards
// =====================

export interface DashboardRentPendings {
  pays_reject: Payment[];
  pays_overdue: Payment[];
  pays_pending_review: Payment[];
}
export interface DashboardWashingPendings {
  pending_user: Payment[];
  pending_admin: Payment[];
}

export interface DashboardData {
  rents_pendings: DashboardRentPendings;
  washing_pendings: DashboardWashingPendings;
}

// =====================
// Estados, Snackbar y utilidades
// =====================

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface FormErrors {
  [key: string]: string;
}
