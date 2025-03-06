from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    """Permite acceso solo a Superadmin"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superadmin()

class IsAdmin(BasePermission):
    """Permite acceso a Admin y Superadmin"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_admin() or request.user.is_superadmin())

class IsTenant(BasePermission):
    """Permite acceso solo a Tenants"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_tenant()
