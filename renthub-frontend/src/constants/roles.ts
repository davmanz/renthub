export type RoleKey = "tenant" | "admin" | "superadmin";

export const ROLES: Record<RoleKey, string> = {
  tenant: "Usuario",
  admin: "Administrador",
  superadmin: "Gerente"
};
