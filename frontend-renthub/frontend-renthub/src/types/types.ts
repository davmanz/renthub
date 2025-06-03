//Creacion de Usuarios
export interface UserInterface {
  id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  document_type: {
    id: string;
    name: string;
  };
  document_number: string;
  document_type_id?: string; // puedes mantenerlo si es usado como auxiliar en formularios
  profile_photo: string | null;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  reference_1: {
    id: string;
    first_name: string;
    last_name: string;
    document_type: {
      id: string;
      name: string;
    };
    document_number: string;
    phone_number: string;
  };
  reference_2: {
    id: string;
    first_name: string;
    last_name: string;
    document_type: {
      id: string;
      name: string;
    };
    document_number: string;
    phone_number: string;
  } | null;
}

export interface UserFormDataInterface {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  document_type_id: string;
  document_number: string;
  reference_1_id: string;
  reference_2_id: string;
  references_count: number;
}


// Definir interfaz para el formulario
export interface FormDataUserInterface {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  document_type: number | string; // Permitir ambos tipos
  document_number: string;
  role: string;
}



interface DocumentType {
  id: string | number;
  name: string;
}

export interface UserInfo {
  id: string;
  name: string;
}

export interface Changes {
  document_type?: DocumentType;
  [key: string]: any;
  first_name?: string;
  last_name?: string;
  email?: string;
  document_number?: string;
  phone_number?: string;
}

export interface ChangeRequest {
  id: string;
  user: UserInfo;
  changes: Changes;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by: string | null;
  review_comment: string | null;
}

export interface Reference {
  id: string;
  first_name: string;
  last_name: string;
  document: {
    id: string;
    name: string;
    number: string;
}}

export interface Props {
  open: boolean;
  onClose: () => void;
  onUserSaved: () => void;
  userToEdit?: UserInterface | null;
}


//Laundry User
export interface LaundryBooking {
  id: string;
  date: string;
  user_full_name: string;
  time_slot: string;
  status: 'approved' | 'rejected' | 'counter_proposal' | 'proposed';
  pending_action: 'user' | 'admin';
  counter_proposal_date?: string;
  counter_proposal_time_slot?: string;
  proposed_date?: string;
  proposed_time_slot?: string;
  admin_comment?: string;
  voucher_image_url?: string;
  user_comment?: string;
}

///////////////////////////////////////////

// Interface para el formulario de usuario


export interface Contract {
  building: string;
  room_number: string;
  building_name: string;
  is_overdue: boolean;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  includes_wifi: boolean;
  wifi_cost: number;
  user: UserInterface;
  id: string;
  status: string;
  next_month?: {
    status: string;
    id: string;
    payment: string;
    voucher: string;
    admin_comment: string;
  };
  contract_photo_url: string;
}

export interface Payment {
  id: string;
  user: UserInterface;
  contract?: Contract;
  month_paid?: string;
  status: string;
  receipt_path?: string;
  voucher_path?: string;
  date?: string;
  time_slot?: string;
  counter_proposal_date?: string;
  counter_proposal_time_slot?: string;
  proposed_date?: string;
  proposed_time_slot?: string;
  user_comment?: string;
}


export interface DashboardData {
  rents_pendings: {
    pays_reject: Payment[];
    pays_overdue: Payment[];
    pays_pending_review: Payment[];
  };
  washing_pendings: {
    pending_user: Payment[];
    pending_admin: Payment[];
  };
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface ContractFormData {
  user: string;
  userName: string;
  room: string;
  roomNumber: string;
  start_date: string;
  end_date: string;
  rent_amount: string;
  deposit_amount: string;
  includes_wifi: string;
  wifi_cost: string;
}

export interface CreateContractProps {
  open: boolean;
  onClose: () => void;
  onContractSaved: () => void;
  contractToEdit?: ContractFormData;
}

export interface FormErrors {
  [key: string]: string;
}
