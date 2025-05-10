export interface ContractFormData {
    user: string;
    room: string;
    start_date: string;
    end_date: string;
    rent_amount: string;
    deposit_amount: string;
    includes_wifi: string;
    wifi_cost: string;
  }
  
  export const validateDates = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (end <= start) return "La fecha de fin debe ser posterior a la fecha de inicio";
    return "";
  };
  
  export const validateNumericField = (value: string, fieldName: string): string => {
    const number = Number(value);
    if (isNaN(number) || number <= 0) return `${fieldName} debe ser un número positivo`;
    return "";
  };
  
  export const validateContractForm = (formData: ContractFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
  
    if (!formData.user) errors.user = "Usuario requerido";
    if (!formData.room) errors.room = "Habitación requerida";
    if (!formData.start_date) errors.start_date = "Fecha de inicio requerida";
    if (!formData.end_date) errors.end_date = "Fecha de fin requerida";
  
    if (formData.start_date && formData.end_date) {
      const dateError = validateDates(formData.start_date, formData.end_date);
      if (dateError) errors.end_date = dateError;
    }
  
    const rentErr = validateNumericField(formData.rent_amount, "Monto de renta");
    if (rentErr) errors.rent_amount = rentErr;
  
    const depositErr = validateNumericField(formData.deposit_amount, "Depósito");
    if (depositErr) errors.deposit_amount = depositErr;
  
    if (formData.includes_wifi === "true") {
      const wifiErr = validateNumericField(formData.wifi_cost, "Costo de WiFi");
      if (wifiErr) errors.wifi_cost = wifiErr;
    }
  
    return errors;
  };
  