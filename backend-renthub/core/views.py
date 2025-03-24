from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from datetime import date


from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsSuperAdmin, IsAdmin, IsTenant
from core.models import (CustomUser, 
                         Contract, 
                         RentPaymentHistory,                         
                         Room, 
                         Building,
                         ReferencePerson,
                         DocumentType,
                         LaundryBooking,
                         UserChangeRequest
                         )
from core.serializers import (CustomUserSerializer, 
                              ContractSerializer, 
                              RentPaymentSerializer, 
                              RoomSerializer, 
                              BuildingSerializer,
                              ReferencePersonSerializer,
                              DocumentTypeSerializer,
                              LaundryBookingSerializer,
                              UserChangeRequestSerializer
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
    
    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """GET: Devuelve la información del usuario autenticado y su estado de pagos.
        PATCH: Permite actualizar solo la foto de perfil del usuario autenticado.
        """
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)

            # Solo los tenants reciben el campo `status_user`
            status_user = None
            if user.is_tenant():
                today = datetime.today()
                current_year_month = f"{today.year}-{today.month:02d}"

                # Obtener todos los contratos del usuario
                contracts = user.contracts.all()
                payments = RentPaymentHistory.objects.filter(
                    contract__in=contracts,
                    month_paid__lte=current_year_month
                )

                if payments.filter(status="overdue").exists():
                    status_user = "overdue"
                elif payments.filter(status="rejected").exists():
                    status_user = "rejected"
                elif payments.filter(status="pending_review").exists():
                    status_user = "pending_review"
                else:
                    status_user = "ok"

            response_data = serializer.data
            if user.is_tenant():
                response_data["status_user"] = status_user

            return Response(response_data)

        elif request.method == "PATCH":
            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)

            # Asegurarse de que solo se actualice profile_photo
            allowed_fields = {"profile_photo"}
            incoming_fields = set(serializer.validated_data.keys())

            if not incoming_fields.issubset(allowed_fields):
                return Response(
                    {"detail": "Solo se permite actualizar la foto de perfil."},
                    status=400
                )

            serializer.save()
            return Response(serializer.data)
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated], url_path="change_password")
    def change_password(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        new_password_repeat = request.data.get("new_password_repeat")

        # Validaciones básicas
        if not all([old_password, new_password, new_password_repeat]):
            return Response({"detail": "Todos los campos son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({"detail": "La contraseña actual es incorrecta."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password_repeat:
            return Response({"detail": "Las nuevas contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

        if old_password == new_password:
            return Response({"detail": "La nueva contraseña no puede ser igual a la anterior."}, status=status.HTTP_400_BAD_REQUEST)

        # Si todo está OK, cambiamos la contraseña
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)

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
        """Restringe la visibilidad de contratos sin modificar la BD."""
        user = self.request.user
        contracts = Contract.objects.all()

        if not user.is_superadmin():
            contracts = contracts.filter(user=user) if user.is_tenant() else contracts.filter(user__role="tenant")

        # 🔹 No se modifica el estado de los contratos en la base de datos
        today = datetime.today()
        current_year_month = f"{today.year}-{today.month:02d}"

        # Filtra los contratos que tienen pagos vencidos sin modificar `status`
        for contract in contracts:
            contract.has_overdue = contract.rent_payments.filter(
                status__in=["overdue", "pending_review", "rejected"],
                month_paid__lte=current_year_month
            ).exists()

        return contracts

##############################################################################

class RentPaymentViewSet(viewsets.ModelViewSet):
    queryset = RentPaymentHistory.objects.all()
    serializer_class = RentPaymentSerializer
    permission_classes = [IsTenant]

    def get_queryset(self):
        user = self.request.user
        if user.is_superadmin() or user.is_admin():
            return RentPaymentHistory.objects.all()
        return RentPaymentHistory.objects.filter(contract__user=user)

    def create(self, request, *args, **kwargs):
        """Valida que no se salte meses impagos"""
        user = request.user
        contract_id = request.data.get("contract")
        month_paid = request.data.get("month_paid")

        try:
            contract = Contract.objects.get(id=contract_id, user=user)
        except Contract.DoesNotExist:
            return Response({"error": "Contrato no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        unpaid_exists = contract.rent_payments.filter(
            month_paid__lt=month_paid,
            status__in=["overdue", "pending_review"]
        ).exists()

        if unpaid_exists:
            return Response({"error": "No puedes saltarte meses sin pagar."}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        receipt = request.data.get("receipt_image", None)

        # Si el pago estaba vencido y ahora se sube un comprobante, cambia a 'pending_review'
        if instance.status == "overdue" and receipt:
            instance.status = "pending_review"
            instance.admin_comment = ""
            instance.save(update_fields=["status", "admin_comment"])

        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        payment = self.get_object()
        payment.status = "approved"
        payment.save()
        return Response({"message": "Pago aprobado"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        payment = self.get_object()
        comment = request.data.get("admin_comment", "").strip()
        if not comment:
            return Response({"error": "Se requiere un motivo de rechazo"}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = "overdue"
        payment.admin_comment = comment
        payment.save(update_fields=["admin_comment", "status"])
        return Response({"message": "Pago rechazado y marcado como vencido"}, status=status.HTTP_200_OK)

class UserChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = UserChangeRequest.objects.all()
    serializer_class = UserChangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin() or user.is_superadmin():
            return UserChangeRequest.objects.all()
        return UserChangeRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        user = request.user
        if not user.is_admin() and not user.is_superadmin():
            return Response({"detail": "No tienes permiso para aprobar."}, status=status.HTTP_403_FORBIDDEN)

        change_request = self.get_object()
        if change_request.status != "pending":
            return Response({"detail": "Esta solicitud ya fue procesada."}, status=status.HTTP_400_BAD_REQUEST)

        # Aplicar el cambio al usuario
        setattr(change_request.user, change_request.field, change_request.new_value)
        change_request.user.save()

        change_request.status = "approved"
        change_request.reviewed_by = user
        change_request.save()

        return Response({"detail": "Solicitud aprobada y cambio aplicado."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        user = request.user
        if not user.is_admin() and not user.is_superadmin():
            return Response({"detail": "No tienes permiso para rechazar."}, status=status.HTTP_403_FORBIDDEN)

        comment = request.data.get("review_comment", "").strip()
        if not comment:
            return Response({"detail": "Debes proporcionar un motivo de rechazo."}, status=status.HTTP_400_BAD_REQUEST)

        change_request = self.get_object()
        if change_request.status != "pending":
            return Response({"detail": "Esta solicitud ya fue procesada."}, status=status.HTTP_400_BAD_REQUEST)

        change_request.status = "rejected"
        change_request.review_comment = comment
        change_request.reviewed_by = user
        change_request.save()

        return Response({"detail": "Solicitud rechazada."}, status=status.HTTP_200_OK)

##############################################################################

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
    permission_classes = [IsSuperAdmin]

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="rooms")
    def get_rooms(self, request, pk=None):
        """Devuelve todas las habitaciones de un edificio"""
        building = self.get_object()
        rooms = Room.objects.filter(building=building)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="rooms/occupied")
    def get_occupied_rooms(self, request, pk=None):
        """Devuelve solo las habitaciones ocupadas de un edificio"""
        building = self.get_object()
        occupied_rooms = Room.objects.filter(building=building, is_occupied=True)
        serializer = RoomSerializer(occupied_rooms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="rooms/available")
    def get_available_rooms(self, request, pk=None):
        """Devuelve solo las habitaciones desocupadas de un edificio"""
        building = self.get_object()
        unoccupied_rooms = Room.objects.filter(building=building, is_occupied=False)
        serializer = RoomSerializer(unoccupied_rooms, many=True)
        return Response(serializer.data)


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

        if user.is_admin() or user.is_superadmin():
            return LaundryBooking.objects.all()
        return LaundryBooking.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        """Crear una nueva reserva con comprobante de pago (usuario)"""
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user, status="pending")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """Aprueba una reserva de lavandería"""
        booking = self.get_object()

        # Si hay una contrapropuesta del usuario, usarla como fecha/hora final
        if booking.status == "counter_proposal":
            booking.date = booking.counter_proposal_date
            booking.time_slot = booking.counter_proposal_time_slot

        # Limpiar campos de propuesta y contrapropuesta
        booking.proposed_date = None
        booking.proposed_time_slot = None
        booking.counter_proposal_date = None
        booking.counter_proposal_time_slot = None

        # Actualizar estado
        booking.status = "approved"
        booking.last_action_by = "admin"
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
        booking.user_response = "rejected"
        booking.admin_comment = comment
        booking.save()

        return Response({"message": "Reserva rechazada"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def propose(self, request, pk=None):

        user = self.request.user
        action_user = "user" if user.role == "tenant" else "admin"

        """El admin propone una nueva fecha/hora"""
        booking = self.get_object()
        proposed_date = request.data.get("proposed_date")
        proposed_time_slot = request.data.get("proposed_time_slot")

        if not proposed_date or not proposed_time_slot:
            return Response({"error": "Debes proporcionar fecha y horario"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "proposed"
        booking.proposed_date = proposed_date
        booking.proposed_time_slot = proposed_time_slot
        booking.last_action_by = action_user
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

        user = self.request.user
        action_user = "user" if user.role == "tenant" else "admin"

        """El usuario envía una contrapropuesta"""
        booking = self.get_object()
        counter_date = request.data.get("counter_proposal_date")
        counter_time_slot = request.data.get("counter_proposal_time_slot")

        if not counter_date or not counter_time_slot:
            return Response({"error": "Debes proporcionar fecha y horario"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "counter_proposal"
        booking.counter_proposal_date = counter_date
        booking.counter_proposal_time_slot = counter_time_slot
        booking.last_action_by = action_user
        booking.save()
        return Response({"message": "Contrapropuesta enviada"}, status=status.HTTP_200_OK)


#DASHBOARD

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
            "pending": list(RentPaymentHistory.objects.filter(
                contract__user=user, status="pending_review"
            ).values("id", "month_paid", "payment_date")),
            "next_due": RentPaymentHistory.objects.filter(
                contract__user=user
            ).order_by("payment_date").values("month_paid").first(),
            "history": list(RentPaymentHistory.objects.filter(
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
        """Obtiene la lista de usuarios con pagos vencidos, en revisión o rechazados hasta el mes actual"""
        current_month = datetime.today().strftime("%Y-%m")

        unpaid_users = CustomUser.objects.filter(
            contracts__rent_payments__status__in=["overdue", "pending_review", "rejected"],
            contracts__rent_payments__month_paid__lte=current_month
        ).distinct().values("id", "first_name", "last_name", "email")

        return [
            {
                "id": user["id"],
                "name": f"{user['first_name']} {user['last_name']}",
                "email": user["email"]
            }
            for user in unpaid_users
        ]

    def get_unverified_payments(self):
        """Lista los pagos que tienen comprobante y están pendientes de aprobación"""
        current_month = datetime.today().strftime("%Y-%m")

        return [
            {
                "id": payment.id,
                "user": {
                    "id": payment.contract.user.id,
                    "name": f"{payment.contract.user.first_name} {payment.contract.user.last_name}"
                },
                "contract": {
                    "id": payment.contract.id,
                    "room_number": payment.contract.room.room_number,
                    "building": payment.contract.room.building.name
                },
                "month_paid": payment.month_paid,
                "payment_date": payment.payment_date.strftime("%Y-%m-%d"),
                "status": payment.status,
                "receipt_path": payment.receipt_image.url if payment.receipt_image else None
                
            }
            for payment in RentPaymentHistory.objects.filter(
                status="pending_review",
                receipt_image__isnull=False,
                month_paid__lte=current_month
            ).select_related("contract__user", "contract__room__building")
        ]

    def get_washing_payments(self):
        """Lista las reservas de lavadora que contienen comprobante de pago (voucher)"""
        bookings = LaundryBooking.objects.filter(voucher_image__isnull=False)

        return [
            {
                "user": {
                    "id": booking.user.id,
                    "name": f"{booking.user.first_name} {booking.user.last_name}"
                },
                "booking": {
                    "id": booking.id,
                    "date": booking.date,
                    "time_slot": booking.time_slot
                },
                "payment_date": booking.created_at.strftime("%Y-%m-%d"),
                "status": booking.status,
                "voucher": booking.voucher_image.url if booking.voucher_image else None
            }
            for booking in bookings
        ]

    def get(self, request):
        """Retorna la información del dashboard de administrador con la estructura corregida"""
        unpaid_users = self.get_unpaid_users()
        unverified_payments = self.get_unverified_payments()
        washing_payments = self.get_washing_payments()

        return Response({
            "summary": {
                "unpaid_users_count": len(unpaid_users),
                "unverified_payments_count": len(unverified_payments),
                "washing_payments_count": len(washing_payments)
            },
            "unpaid_users": unpaid_users,
            "unverified_payments": unverified_payments,
            "washing_payments": washing_payments
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

#####################################################################################
# CAMBIOS DE  PaymentDetailView

class RentPaymentDetailView(RetrieveUpdateAPIView):
    queryset = RentPaymentHistory.objects.all()
    serializer_class = RentPaymentSerializer
    permission_classes = [IsAuthenticated]

