// src/constants/laundryStatus.ts

export const LAUNDRY_STATUS = {
    approved: {
      label: 'Aprobado',
      color: 'success',
    },
    rejected: {
      label: 'Rechazado',
      color: 'error',
    },
    pending_admin: {
      label: 'Pendiente Adm',
      color: 'warning',
    },
    pending_user: {
      label: 'Pendiente Usr',
      color: 'info',
    },
  } as const;
  