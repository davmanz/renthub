from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsSuperAdmin, IsAdmin, IsTenant
from core.models import (CustomUser, 
                         Contract, 
                         PaymentHistory, 
                         Room, Building,
                         ReferencePerson,
                         DocumentType,
                         LaundryBooking,
                         ReferencePerson
                         )
from core.serializers import (CustomUserSerializer, 
                              ContractSerializer, 
                              PaymentHistorySerializer, 
                              RoomSerializer, 
                              BuildingSerializer,
                              ReferencePersonSerializer,
                              LaundryBookingSerializer,
                              DocumentTypeSerializer
                              )

from datetime import date, timedelta, datetime

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=True))
    def create(self, request, *args, **kwargs):
        """ Restringe la creación de usuarios y maneja la contraseña """
        user = request.user

        # Solo los administradores pueden crear usuarios
        if not user.is_admin() and not user.is_superadmin():
            return Response({"detail": "No tienes permisos para crear usuarios."}, status=status.HTTP_403_FORBIDDEN)

        # Verifica que si un admin crea un usuario, solo puede ser un 'tenant'
        if user.is_admin() and request.data.get("role") in ["admin", "superadmin"]:
            return Response({"detail": "No puedes crear este tipo de usuario."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()  # 🔹 Aquí ya se maneja la contraseña correctamente en el serializer

        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
    permission_classes = [IsAdmin]

    def get_queryset(self):
        """Filtra habitaciones por `building_id` si está presente en la petición."""
        queryset = super().get_queryset()
        building_id = self.request.query_params.get("building_id")

        if building_id:
            queryset = queryset.filter(building__id=building_id)
        
        return queryset

    @action(detail=False, methods=["get"], permission_classes=[IsAdmin])
    def available(self, request):
        """Devuelve solo las habitaciones disponibles en un `building_id` dado."""
        building_id = self.request.query_params.get("building_id")

        # Filtramos solo si `building_id` está presente
        if building_id:
            available_rooms = Room.objects.filter(is_occupied=False, building__id=building_id)
        else:
            available_rooms = Room.objects.filter(is_occupied=False)

        serializer = self.get_serializer(available_rooms, many=True)
        return Response(serializer.data)


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [IsSuperAdmin]  # Solo Superadmins pueden gestionar edificios

class ReferencePersonViewSet(viewsets.ModelViewSet):
    queryset = ReferencePerson.objects.all()
    serializer_class = ReferencePersonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReferencePerson.objects.all()

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=True))
    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_superadmin() and not user.is_admin():
            return Response(
                {"detail": "No tienes permisos para crear personas de referencia."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().create(request, *args, **kwargs)

class DocumentTypesViewSet(ReadOnlyModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAdmin]

class LaundryBookingViewSet(viewsets.ModelViewSet):
    queryset = LaundryBooking.objects.all()
    serializer_class = LaundryBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtra las reservas según el rol del usuario"""
        user = self.request.user

        if user.is_admin():
            return LaundryBooking.objects.filter(status="pending")
        return LaundryBooking.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        """Crear una nueva reserva con comprobante de pago (usuario)"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, status="pending")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """Aprueba una reserva de lavandería"""
        booking = self.get_object()
        booking.status = "approved"
        booking.save()
        return Response({"message": "Reserva aprobada"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        """Rechaza una reserva con un comentario"""
        booking = self.get_object()
        comment = request.data.get("admin_comment", "")
        if not comment:
            return Response({"error": "Se requiere un motivo de rechazo"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "rejected"
        booking.admin_comment = comment
        booking.save()
        return Response({"message": "Reserva rechazada"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def propose(self, request, pk=None):
        """El admin propone una nueva fecha/hora"""
        booking = self.get_object()
        proposed_date = request.data.get("proposed_date")
        proposed_time_slot = request.data.get("proposed_time_slot")

        if not proposed_date or not proposed_time_slot:
            return Response({"error": "Debes proporcionar fecha y horario"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "proposed"
        booking.proposed_date = proposed_date
        booking.proposed_time_slot = proposed_time_slot
        booking.save()
        return Response({"message": "Propuesta enviada"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsTenant])
    def accept_proposal(self, request, pk=None):
        """El usuario acepta la propuesta del admin"""
        booking = self.get_object()
        if booking.status != "proposed":
            return Response({"error": "No hay propuesta pendiente para aceptar"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "approved"
        booking.save()
        return Response({"message": "Propuesta aceptada y reserva aprobada"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsTenant])
    def counter_proposal(self, request, pk=None):
        """El usuario envía una contrapropuesta"""
        booking = self.get_object()
        counter_date = request.data.get("counter_proposal_date")
        counter_time_slot = request.data.get("counter_proposal_time_slot")

        if not counter_date or not counter_time_slot:
            return Response({"error": "Debes proporcionar fecha y horario"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "counter_proposal"
        booking.counter_proposal_date = counter_date
        booking.counter_proposal_time_slot = counter_time_slot
        booking.save()
        return Response({"message": "Contrapropuesta enviada"}, status=status.HTTP_200_OK)

# Respuesta asi los dashboardfrom rest_framework.views import APIView

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Información del usuario
        user_data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "profile_photo": request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None,
        }

        # Datos de pagos
        payments = {
            "pending": list(PaymentHistory.objects.filter(
                contract__user=user, status="pending"
            ).values("id", "month_paid", "payment_date")),
            "next_due": PaymentHistory.objects.filter(
                contract__user=user
            ).order_by("payment_date").values("month_paid").first(),
            "history": list(PaymentHistory.objects.filter(
                contract__user=user
            ).values_list("month_paid", flat=True))
        }

        # Datos de lavandería
        laundry = {
            "bookings": list(LaundryBooking.objects.filter(user=user).values(
                "id", "date", "time_slot", "status",
                "proposed_date", "proposed_time_slot",
                "counter_proposal_date", "counter_proposal_time_slot",
                "admin_comment"
            ))
        }

        return Response(
            {
                "user": user_data, 
                "payments": payments,
                "laundry": laundry
            },
            status=status.HTTP_200_OK,
        )

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