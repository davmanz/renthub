//Creacion de Usuarios
export interface UserFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  document_type_id: string;
  document_number: string;
  role: string;
  reference_1: string;
  reference_2: string;
  references_count: number;
}

export interface Reference {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Props {
  open: boolean;
  onClose: () => void;
  onUserSaved: () => void;
  userToEdit?: UserFormData | null;
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
}

///////////////////////////////////////////

export interface User {
  id: number;
  name: string;
}

export interface Contract {
  building: string;
  room_number: string;
}

export interface Payment {
  id: string;
  user: User;
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