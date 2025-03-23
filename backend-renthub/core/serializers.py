from rest_framework import serializers
from django.db import transaction
from datetime import datetime
from django.core.exceptions import ValidationError
from core.models import (CustomUser, 
                         Contract, 
                         LaundryPaymentHistory, RentPaymentHistory,
                         Room, Building,
                         ReferencePerson,
                         LaundryBooking, DocumentType
                         )
from dateutil.relativedelta import relativedelta
from core.models import Contract, RentPaymentHistory, Room, Building, ReferencePerson, DocumentType

class ReferencePersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferencePerson
        fields = "__all__"

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    # GET: Devolverá objetos completos
    document_type = serializers.SerializerMethodField()
    reference_1 = serializers.SerializerMethodField()
    reference_2 = serializers.SerializerMethodField()

    # POST/PUT: Solo aceptará IDs
    document_type_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentType.objects.all(), source="document_type", write_only=True
    )
    reference_1_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), source="reference_1", write_only=True, required=False, allow_null=True
    )
    reference_2_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), source="reference_2", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "first_name", "last_name", "phone_number",
            "password","role",
            "document_type", "document_type_id",  # GET: Objeto | POST/PUT: ID
            "document_number",
            "profile_photo", "id_photo", "contract_photo",
            "is_active", "date_joined",
            "reference_1", "reference_1_id",  # GET: Objeto | POST/PUT: ID
            "reference_2", "reference_2_id",  # GET: Objeto | POST/PUT: ID
        ]

    def create(self, validated_data):
        """Asegura que la contraseña se almacene hasheada"""
        password = validated_data.pop("password", None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)  # 🔹 Aquí se hashea la contraseña correctamente
        user.save()
        return user

    def get_document_type(self, obj):
        """ Devuelve el tipo de documento como un objeto con id y nombre """
        if obj.document_type:
            return {
                "id": str(obj.document_type.id),
                "name": obj.document_type.name
            }
        return None

    def get_reference_1(self, obj):
        """ Devuelve los datos completos de la primera referencia """
        if obj.reference_1:
            return {
                "id": str(obj.reference_1.id),
                "first_name": obj.reference_1.first_name,
                "last_name": obj.reference_1.last_name,
                "document_type": {
                    "id": str(obj.reference_1.document_type.id) if obj.reference_1.document_type else None,
                    "name": obj.reference_1.document_type.name if obj.reference_1.document_type else None
                },
                "document_number": obj.reference_1.document_number,
                "phone_number": obj.reference_1.phone_number
            }
        return None

    def get_reference_2(self, obj):
        """ Devuelve los datos completos de la segunda referencia """
        if obj.reference_2:
            return {
                "id": str(obj.reference_2.id),
                "first_name": obj.reference_2.first_name,
                "last_name": obj.reference_2.last_name,
                "document_type": {
                    "id": str(obj.reference_2.document_type.id) if obj.reference_2.document_type else None,
                    "name": obj.reference_2.document_type.name if obj.reference_2.document_type else None
                },
                "document_number": obj.reference_2.document_number,
                "phone_number": obj.reference_2.phone_number
            }
        return None

class ContractSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    building_name = serializers.CharField(source="room.building.name", read_only=True)
    is_overdue = serializers.SerializerMethodField()
    next_month = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = [
            "id", "user", "user_full_name", "room", "room_number", "building_name",
            "start_date", "end_date", "rent_amount", "deposit_amount", 
            "includes_wifi", "wifi_cost", "is_overdue", "next_month"
        ]

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_is_overdue(self, obj):
        """Determina si el contrato tiene pagos vencidos sin modificar la BD."""
        today = datetime.today()
        current_year_month = f"{today.year}-{today.month:02d}"

        return obj.rent_payments.filter(
            status__in=["overdue", "pending_review", "rejected"], month_paid__lte=current_year_month
        ).exists()
    
    def get_next_month(self, obj):
        """Devuelve el próximo mes a pagar y, si tiene voucher, el nombre del archivo"""
        payments = obj.rent_payments.filter(
            status__in=["overdue", "pending_review", "rejected"]
        ).order_by("month_paid")

        if not payments.exists():
            return None

        next_payment = payments.first()
        return {
            "id": next_payment.id,
            "payment": next_payment.month_paid,
            "voucher": next_payment.receipt_image.name if next_payment.receipt_image else None,
            "status": next_payment.status,
            "admin_comment": next_payment.admin_comment
        }


    def create(self, validated_data):
        """Crea un contrato asegurando que la habitación solo se asigne si está realmente libre."""
        with transaction.atomic():  # 🔹 Bloquea la consulta para evitar condiciones de carrera
            room = validated_data["room"]

            # Bloquea la habitación durante la transacción
            room = Room.objects.select_for_update().get(id=room.id)

            if Contract.objects.filter(room=room, end_date__gte=validated_data["start_date"]).exists():
                raise ValidationError(f"La habitación {room.room_number} ya tiene un contrato activo.")

            contract = Contract.objects.create(**validated_data)

            start_date = contract.start_date
            end_date = contract.end_date
            current_date = start_date

            while current_date <= end_date:
                # Convertir la fecha actual a formato YYYY-MM para compararla con el mes actual
                current_month = datetime.today().strftime("%Y-%m")
                month_payment = current_date.strftime("%Y-%m")

                # Si el mes de pago ya pasó, el estado debe ser "overdue", de lo contrario "pending"
                payment_state = "overdue" if month_payment < current_month else "pending_review"

                # Crear el registro en PaymentHistory con el estado correcto
                RentPaymentHistory.objects.create(
                    contract=contract,
                    month_paid=month_payment,
                    payment_date=current_date,
                    status=payment_state
                )

                current_date += relativedelta(months=1)

        return contract

##############################################################################

'''
class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = ["id", "contract", "month_paid", 
                  "receipt_image", "status", "payment_type", 
                  "payment_date", "admin_comment"]
        extra_kwargs = {
            "payment_date": {"read_only": True}  # 🔹 Evita que el usuario envíe la fecha manualmente
        }

    def create(self, validated_data):
        """Asigna la fecha actual al registrar un pago"""
        validated_data["payment_date"] = datetime.today().date()  # 🔹 Fecha actual asignada automáticamente
        return super().create(validated_data)

'''

class RentPaymentSerializer(serializers.ModelSerializer):
    contract = serializers.SerializerMethodField()

    class Meta:
        model = RentPaymentHistory
        fields = [
            "id", "contract", "month_paid", "receipt_image",
            "payment_date", "status", "admin_comment"
        ]
        extra_kwargs = {
            "payment_date": {"read_only": True},
            "status": {"read_only": True},
            "admin_comment": {"read_only": True}
        }

    def create(self, validated_data):
        validated_data["payment_date"] = datetime.today().date()
        validated_data["status"] = "pending_review"
        return super().create(validated_data)
    
    def get_contract(self, obj):
        return {
            "id": str(obj.contract.id),
            "building": obj.contract.room.building.name,
            "room": obj.contract.room.room_number
        }

class LaundryPaymentSerializer(serializers.ModelSerializer):
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = LaundryPaymentHistory
        fields = [
            "id", "user", "laundry_booking", "receipt_image",
            "payment_date", "status", "admin_comment"
        ]
        extra_kwargs = {
            "user": {"read_only": True},
            "payment_date": {"read_only": True},
            "status": {"read_only": True},
            "admin_comment": {"read_only": True}
        }

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["payment_date"] = datetime.today().date()
        validated_data["status"] = "pending_review"
        return super().create(validated_data)

    def get_payment_status(self, obj):
        return obj.payment.status if hasattr(obj, "payment") else None


##############################################################################

class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name", read_only=True)

    class Meta:
        model = Room
        fields = ["id", "room_number", "is_occupied", "building", "building_name"]


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = "__all__"


##############################################################################
class LaundryBookingSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    pending_action = serializers.SerializerMethodField()

    class Meta:
        model = LaundryBooking
        fields = [
            "id", "user", "user_full_name", "date", "time_slot", 
            "voucher_image", "status", "admin_comment",
            "proposed_date", "proposed_time_slot",
            "counter_proposal_date", "counter_proposal_time_slot",
            "last_action_by", "pending_action","payment_status"
        ]
        extra_kwargs = {"user": {"required": False}}

    payment_status = serializers.SerializerMethodField()

    def get_payment_status(self, obj):
        if hasattr(obj, "payment"):
            return obj.payment.status
        return None

    def create(self, validated_data):
        """Si el usuario autenticado es un Tenant, se asigna automáticamente"""
        request = self.context.get("request")  # Obtiene el request de la vista

        if request and request.user.is_authenticated and request.user.is_tenant():
            validated_data["user"] = request.user  # Asigna el usuario autenticado
        
        return super().create(validated_data)

    def get_user_full_name(self, obj):
        """Devuelve el nombre completo del usuario"""
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_pending_action(self, obj):
        """Determina quién debe responder según `last_action_by`"""
        if obj.status in ["pending", "counter_proposal", "proposed"]:
            return "user" if obj.last_action_by == "admin" else "admin"
        return None  # No hay acción pendiente (ya está aprobada o rechazada)

##############################################################################
class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


    class Meta:
        model = DocumentType
        fields = "__all__"