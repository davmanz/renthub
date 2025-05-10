// Interfaces
export interface User {
  id: number;
  name: string;
}

export interface Contract {
  building: string;
  room_number: string;
}

export interface Payment {
  id: number;
  user: User;
  contract?: Contract;
  month_paid?: string;
  status: string;
  receipt_path?: string;
  voucher_path?: string;
  date?: string;
  time_slot?: string;
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