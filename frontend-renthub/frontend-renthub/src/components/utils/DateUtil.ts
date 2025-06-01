export class DateUtil {
    private static months: string[] = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
  
    /**
     * Convierte una fecha en formato "YYYY-MM" al nombre del mes en español.
     * 
     * @param date - Fecha en formato "YYYY-MM"
     * @returns Nombre del mes en español, o cadena vacía si el formato no es válido.
     */
    public static getMonthName(date: string): string {
      const parts = date.split("-");
      if (parts.length !== 2) return "";
  
      const month = parseInt(parts[1], 10);
      if (month >= 1 && month <= 12) {
        return this.months[month - 1];
      }
  
      return "";
    }
  
    /**
     * Convierte una fecha en formato "YYYY-MM" a "Mes Año", por ejemplo: "Enero 2025".
     * 
     * @param date - Fecha en formato "YYYY-MM"
     * @returns Nombre del mes y año en español, o cadena vacía si el formato no es válido.
     */
    public static getMonthAndYear(date: string): string {
      const parts = date.split("-");
      if (parts.length !== 2) return "";
  
      const year = parts[0];
      const month = parseInt(parts[1], 10);
  
      if (month >= 1 && month <= 12) {
        return `${this.months[month - 1]} ${year}`;
      }
  
      return "";
    }
  }
  