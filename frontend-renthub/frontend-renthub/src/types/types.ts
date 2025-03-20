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

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  document_type: string | DocumentType;
  document_number: string;
  profile_photo?: string;
  id_photo?: string;
  contract_photo?: string;
  role: "superadmin" | "admin" | "tenant";
  is_active: boolean;
  is_staff: boolean;
  date_joined: string; // ISO Date
  has_pending_payments?: boolean;
}

export interface Room {
  id: string;
  room_number: string;
  is_occupied: boolean;
  building: string | Building;
}

export interface Building {
  id: string;
  name: string;
  address: string;
}

export interface Contract {
  id: string;
  user: string | User;
  user_full_name?: string;
  room: string | Room;
  room_number?: string;
  building_name?: string;
  start_date: string; // ISO Date
  end_date: string; // ISO Date
  rent_amount: number;
  deposit_amount: number;
  includes_wifi: boolean;
  wifi_cost?: number;
  is_overdue?: boolean;
}

export interface PaymentHistory {
  id: string;
  contract: string | Contract;
  payment_date: string; // ISO Date
  month_paid: string; // YYYY-MM
  receipt_image?: string;
  status: "valid" | "rejected" | "pending";
  payment_type: "rent" | "washing";
}

export type LaundryBookingResponse = {
  id: string;
  user: string;
  userFullName: string;
  date: string;  // Formato "YYYY-MM-DD"
  timeSlot: string;  // Formato "HH:MM - HH:MM"
  voucherImage: string;
  status: "pending" | "approved" | "rejected" | "proposed" | "counter_proposal";
  adminComment?: string;
  proposedDate?: string;
  proposedTimeSlot?: string;
  counterProposalDate?: string;
  counterProposalTimeSlot?: string;
  lastActionBy: "user" | "admin";
  pendingAction?: "user" | "admin";
};


export interface UserDashboardResponse {
  user: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      profile_photo?: string;
  };
  payments: {
      pending: { id: string; month_paid: string; payment_date: string }[];
      next_due?: { month_paid: string };
      history: string[];
  };
  laundry: {
      bookings: {
          id: string;
          date: string;
          time_slot: string;
          status: string;
          proposed_date?: string;
          proposed_time_slot?: string;
          counter_proposal_date?: string;
          counter_proposal_time_slot?: string;
          admin_comment?: string;
      }[];
  };
}

export interface AdminDashboardResponse {
  unpaid_users: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
  }[];
  unverified_payments: {
      id: string;
      contract_user_first_name: string;
      contract_user_last_name: string;
      month_paid: string;
      payment_date: string;
      status: string;
  }[];
  washing_payments: {
      id: string;
      contract_user_first_name: string;
      contract_user_last_name: string;
      month_paid: string;
      payment_date: string;
      status: string;
  }[];
}

export interface LaundryDashboardResponse {
  available_days: { date: string }[];
  bookings: {
      id: string;
      date: string;
      time_slot: string;
      is_confirmed: boolean;
  }[];
}
