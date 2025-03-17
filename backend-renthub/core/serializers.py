from rest_framework import serializers
from datetime import datetime
from core.models import (CustomUser, 
                         Contract, 
                         PaymentHistory, 
                         Room, Building,
                         ReferencePerson,
                         LaundryBooking, DocumentType
                         )
from dateutil.relativedelta import relativedelta
from core.models import Contract, PaymentHistory

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

    class Meta:
        model = Contract
        fields = [
            "id", "user", "user_full_name", "room", "room_number", "building_name",
            "start_date", "end_date", "rent_amount", "deposit_amount", 
            "includes_wifi", "wifi_cost", "is_overdue"
        ]

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_is_overdue(self, obj):
        """Determina si el contrato tiene pagos vencidos"""
        today = datetime.today()
        current_year_month = f"{today.year}-{today.month:02d}"  # Formato 'YYYY-MM'

        return obj.payments.filter(
            status="pending",
            month_paid__lte=current_year_month
        ).exists()

    def create(self, validated_data):
        """ Crea un contrato y genera automáticamente los pagos en PaymentHistory """
        contract = Contract.objects.create(**validated_data)

        start_date = contract.start_date
        end_date = contract.end_date
        current_date = start_date

        # Generar un registro de pago para cada mes dentro del periodo del contrato
        while current_date <= end_date:
            PaymentHistory.objects.create(
                contract=contract,
                month_paid=current_date.strftime("%Y-%m"),
                payment_date=current_date,
                status="pending"  # Todos los pagos inician como pendientes
            )
            current_date += relativedelta(months=1)  # Avanza un mes

        return contract

class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = "__all__"

class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name", read_only=True)

    class Meta:
        model = Room
        fields = ["id", "room_number", "is_occupied", "building", "building_name"]


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = "__all__"

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
            "last_action_by", "pending_action"
        ]
        extra_kwargs = {"user": {"required": False}}

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

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


    class Meta:
        model = DocumentType
        fields = "__all__"