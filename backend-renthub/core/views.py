from rest_framework import viewsets, status
from rest_framework.decorators import action
from core.models import (CustomUser, 
                         Contract, 
                         PaymentHistory, 
                         Room, Building,
                         ReferencePerson
                         )
from core.serializers import (CustomUserSerializer, 
                              ContractSerializer, 
                              PaymentHistorySerializer, 
                              RoomSerializer, 
                              BuildingSerializer,
                              ReferencePersonSerializer,
                              LaundryBookingSerializer
                              )
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSuperAdmin, IsAdmin, IsTenant
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from core.models import PaymentHistory, Contract, LaundryBooking
from datetime import date, timedelta, datetime


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Restringe la visibilidad según el rol y permite filtrar por ?role=tenant o ?role=admin"""
        user = self.request.user
        queryset = CustomUser.objects.all()

        # Aplicar restricciones según el rol del usuario
        if user.is_admin():
            queryset = queryset.filter(role="tenant")  # Solo ve Tenants
        elif user.is_tenant():
            queryset = queryset.filter(id=user.id)  # Solo ve su propio perfil

        # Permitir filtrar por rol usando ?role=tenant o ?role=admin
        role = self.request.query_params.get("role", None)
        if role:
            queryset = queryset.filter(role=role)

        return queryset

    def update(self, request, *args, **kwargs):
        """Restringe la edición según el rol"""
        user = self.request.user
        instance = self.get_object()

        # Un Tenant solo puede editar su propio perfil, sin cambiar su rol
        if user.is_tenant() and instance != user:
            return Response({"detail": "No tienes permisos para editar este usuario."}, status=status.HTTP_403_FORBIDDEN)

        # Un Admin solo puede modificar Tenants, no Admins ni Superadmins
        if user.is_admin() and instance.role in ["admin", "superadmin"]:
            return Response({"detail": "No puedes modificar este usuario."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Solo Superadmins pueden eliminar usuarios"""
        user = self.request.user
        instance = self.get_object()

        if not user.is_superadmin():
            return Response({"detail": "Solo los superadmins pueden eliminar usuarios."}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """ Devuelve la información del usuario autenticado """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer

    def get_permissions(self):
        """Permite a Admins gestionar contratos, pero los Tenants solo pueden ver los suyos"""
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Restringe la visibilidad de contratos según el rol"""
        user = self.request.user

        if user.is_superadmin():
            return Contract.objects.all()  # Ve todos los contratos
        elif user.is_admin():
            return Contract.objects.filter(user__role="tenant")  # Solo ve contratos de Tenants
        else:
            return Contract.objects.filter(user=user)  # Solo ve su propio contrato

class PaymentHistoryViewSet(viewsets.ModelViewSet):
    queryset = PaymentHistory.objects.all()
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsTenant]  

    def get_queryset(self):
        """Restringe la visibilidad del historial de pagos"""
        user = self.request.user

        if user.is_superadmin():
            return PaymentHistory.objects.all()
        elif user.is_admin():
            return PaymentHistory.objects.filter(contract__user__role="tenant")
        else:
            return PaymentHistory.objects.filter(contract__user=user)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdmin]  # Solo Admins pueden gestionar habitaciones

class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [IsSuperAdmin]  # Solo Superadmins pueden gestionar edificios

class ReferencePersonViewSet(viewsets.ModelViewSet):
    queryset = ReferencePerson.objects.all()
    serializer_class = ReferencePersonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Cada usuario solo puede ver sus propias referencias"""
        user = self.request.user
        return ReferencePerson.objects.filter(user=user)


# Respuesta asi los dashboardfrom rest_framework.views import APIView

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get_payments_pending(self, user):
        """Obtiene los pagos vencidos del usuario y los ordena por fecha descendente"""
        return PaymentHistory.objects.filter(contract__user=user, status="pending").order_by("-payment_date").values(
            "id", "month_paid", "payment_date", "status"
        )

    def get_next_payment(self, user):
        """Obtiene el próximo mes que debe pagar"""
        last_payment = PaymentHistory.objects.filter(contract__user=user).order_by("-month_paid").first()
        if last_payment:
            return {"next_month": last_payment.month_paid + 1}
        return {"next_month": date.today().month}  # Si no tiene pagos previos, asume el mes actual

    def get_payment_periods(self, user):
        """Lista todos los periodos que debe pagar el usuario"""
        contract = Contract.objects.filter(user=user).first()
        if contract:
            return {
                "start_date": contract.start_date,
                "end_date": contract.end_date
            }
        return {}

    def get(self, request):
        """Retorna la información del dashboard del usuario"""
        user = request.user
        return Response({
            "payments_pending": self.get_payments_pending(user),
            "next_payment": self.get_next_payment(user),
            "payment_periods": self.get_payment_periods(user)
        })

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]  # Solo Admins y Superadmins pueden acceder

    def get_unpaid_users(self):
        """Obtiene la lista de usuarios con pagos vencidos"""
        unpaid_users = CustomUser.objects.filter(
            contracts__payments__status="pending"
        ).distinct().values("id", "first_name", "last_name", "email")
        return unpaid_users

    def get_unverified_payments(self):
        """Lista los pagos que aún no han sido verificados"""
        return PaymentHistory.objects.filter(status="pending").values(
            "id", "contract__user__first_name", "contract__user__last_name",
            "month_paid", "payment_date", "status"
        )

    def get_washing_payments(self):
        """Lista los pagos por uso de lavadora"""
        return PaymentHistory.objects.filter(payment_type="washing").values(
            "id", "contract__user__first_name", "contract__user__last_name",
            "month_paid", "payment_date", "status"
        )

    def get(self, request):
        """Retorna la información del dashboard de administrador"""
        return Response({
            "unpaid_users": self.get_unpaid_users(),
            "unverified_payments": self.get_unverified_payments(),
            "washing_payments": self.get_washing_payments()
        })
    
class LaundryDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get_available_days(self):
        """Lista los días disponibles para reservas"""
        today = date.today()
        return [
            {"date": str(today + timedelta(days=i))}
            for i in range(7)  # Disponibilidad de los próximos 7 días
        ]

    def get_bookings(self, user):
        """Lista las reservas de lavadora del usuario"""
        return LaundryBooking.objects.filter(user=user).values(
            "id", "date", "time_slot", "is_confirmed"
        )

    def post(self, request):
        """Permite reservar una lavadora con validación de fecha"""
        user = request.user
        date_str = request.data.get("date")
        time_slot = request.data.get("time_slot")

        # Convertir la fecha en un objeto datetime
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # No permitir reservas en fechas pasadas
        if date_obj < date.today():
            return Response({"error": "No puedes reservar en una fecha pasada."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = LaundryBookingSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Retorna la información del dashboard de lavadoras"""
        return Response({
            "available_days": self.get_available_days(),
            "bookings": self.get_bookings(request.user)
        })


class PaymentDetailView(RetrieveAPIView):
    """Devuelve el detalle de un pago específico"""
    queryset = PaymentHistory.objects.all()
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsAuthenticated]