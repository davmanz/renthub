from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from core.models import (CustomUser, UserChangeRequest,
                         Contract, RentPaymentHistory,
                         Room, Building, ReferencePerson,
                         LaundryBooking, DocumentType)

########################################################################################################
####               Serializador para la persona de referencia (ReferencePerson)                     ####
########################################################################################################
class ReferencePersonSerializer(serializers.ModelSerializer):
    document = serializers.SerializerMethodField()

    # Entrada en POST/PUT como UUID
    document_type_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentType.objects.all(),
        source="document_type",
        write_only=True
    )

    class Meta:
        model = ReferencePerson
        fields = [
            "id",
            "first_name",
            "last_name",
            "document_type_id",  # Entrada
            "document",          # Salida
            "document_number",
            "phone_number"
        ]

    def get_document(self, obj):
        """Devuelve un objeto con tipo y número de documento (GET)"""
        if obj.document_type:
            return {
                "id": str(obj.document_type.id),
                "name": obj.document_type.name,
                "number": obj.document_number
            }
        return None

    def validate(self, data):
        """Valida que no exista ya una referencia con mismo tipo y número"""
        document_type = data.get("document_type")
        document_number = data.get("document_number")

        if self.instance:
            # En PUT/PATCH: evitar conflicto consigo mismo
            exists = ReferencePerson.objects.filter(
                document_type=document_type,
                document_number=document_number
            ).exclude(id=self.instance.id)
        else:
            # En POST
            exists = ReferencePerson.objects.filter(
                document_type=document_type,
                document_number=document_number
            )

        if exists.exists():
            raise serializers.ValidationError({
                "detail": "Ya existe una persona con este número y tipo de documento.",
                "code": 110
            })

        return data

########################################################################################################
####                    Serializador para el usuario (CustomUser)                                   ####
########################################################################################################
class CustomUserSerializer(serializers.ModelSerializer):

    # Campos de solo lectura
    password = serializers.CharField(write_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    role = serializers.CharField(required=False)
    profile_photo = serializers.ImageField(required=False)
    document_type = serializers.SerializerMethodField()
    reference_1 = serializers.SerializerMethodField()
    reference_2 = serializers.SerializerMethodField()

    document_type_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentType.objects.all(), 
        source="document_type", 
        write_only=True
    )
    reference_1_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), 
        source="reference_1", 
        write_only=True, 
        required=False, 
        allow_null=True
    )
    reference_2_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), 
        source="reference_2", 
        write_only=True, 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "first_name", "last_name", "phone_number",
            "password","role",
            "document_type", "document_type_id",  # GET: Objeto | POST/PUT: ID
            "document_number",
            "profile_photo",
            "is_active", "date_joined",
            "reference_1", "reference_1_id",  # GET: Objeto | POST/PUT: ID
            "reference_2", "reference_2_id",  # GET: Objeto | POST/PUT: ID
            "is_verified"
        ]

    def get_profile_photo(self, obj):
        return obj.profile_photo.url if obj.profile_photo else None
    
    def create(self, validated_data):
        password = validated_data.pop("password", None)

        validated_data["role"] = "tenant"

        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)  
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
    
    def validate_role(self, value):
        if self.context['request'].user.is_superadmin():
            return value
        raise serializers.ValidationError("No tienes permiso para cambiar el rol.")

########################################################################################################
####                    Serializador para el contrato de alquiler (Contract)                        ####
########################################################################################################
class ContractSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    building_name = serializers.CharField(source="room.building.name", read_only=True)
    is_overdue = serializers.SerializerMethodField()
    next_month = serializers.SerializerMethodField()
    contract_photo = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = [
            "id", "user", "user_full_name", "room", "room_number", "building_name",
            "start_date", "end_date", "rent_amount", "deposit_amount", 
            "includes_wifi", "wifi_cost", "is_overdue", "next_month",
            "contract_photo"
        ]

    def get_contract_photo(self, obj):
        return obj.contract_photo.url if obj.contract_photo else None

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
            "voucher": next_payment.receipt_image.url if next_payment.receipt_image else None,
            "status": next_payment.status,
            "admin_comment": next_payment.admin_comment
        }

    def create(self, validated_data):
        with transaction.atomic():
            room = validated_data["room"]

            # Bloquea la habitación durante la transacción
            room = Room.objects.select_for_update().get(id=room.id)

            # Validación: solo crear contrato si no hay otro activo
            if Contract.objects.filter(room=room, end_date__gte=validated_data["start_date"]).exists():
                raise DjangoValidationError(f"La habitación {room.room_number} ya tiene un contrato activo.")

            # Crear el contrato
            contract = Contract.objects.create(**validated_data)

            # Marcar habitación como ocupada manualmente (create no ejecuta save personalizado)
            room.is_occupied = True
            room.save(update_fields=["is_occupied"])

            # Inicializar fechas
            current_date = contract.start_date
            end_date = contract.end_date
            today = datetime.today().date()

            while current_date <= end_date:
                month_payment = current_date.strftime("%Y-%m")

                # Comparar fechas correctamente
                payment_state = "overdue" if current_date < today else "upcoming"

                # Crear historial de pagos
                RentPaymentHistory.objects.create(
                    contract=contract,
                    month_paid=month_payment,
                    status=payment_state
                )

                # Avanzar al mes siguiente (manteniendo el día original)
                current_date += relativedelta(months=1)

        return contract

########################################################################################################
####        Serializador para la solicitud de cambio de datos del usuario (UserChangeRequest)       ####
########################################################################################################
class UserChangeRequestSerializer(serializers.ModelSerializer):
    ALLOWED_FIELDS = ["first_name", "last_name", "email", "document_number", "document_type", "phone_number", "profile_photo"]
    user = serializers.SerializerMethodField()

    class Meta:
        model = UserChangeRequest
        fields = [
            "id", "user", "changes",
            "status", "created_at", "reviewed_by", "review_comment"
        ]
        read_only_fields = ["user", "status", "created_at", "reviewed_by", "review_comment"]

    def validate_changes(self, value):
        user = self.context["request"].user

        if not isinstance(value, dict):
            raise serializers.ValidationError("El campo 'changes' debe ser un diccionario.")

        for field in value.keys():
            if field not in self.ALLOWED_FIELDS:
                raise serializers.ValidationError(f"No puedes solicitar cambio en el campo '{field}'.")

            if UserChangeRequest.objects.filter(
                user=user,
                changes__has_key=field,
                status="pending"
            ).exists():
                raise serializers.ValidationError(f"Ya tienes una solicitud pendiente para el campo '{field}'.")

        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def get_user(self, obj):
        return {
            "id": str(obj.user.id),
            "name": f"{obj.user.first_name} {obj.user.last_name}"
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        changes = rep.get("changes", {}).copy()

        if "document_type" in changes:
            # Si document_type es un diccionario, usar el id directamente
            if isinstance(changes["document_type"], dict):
                doc_id = changes["document_type"]["id"]
            else:
                doc_id = changes["document_type"]
                
            try:
                doc = DocumentType.objects.get(id=doc_id)
                changes["document_type"] = {
                    "id": str(doc.id),
                    "name": doc.name
                }
            except (DocumentType.DoesNotExist, ValueError):
                # Si el documento no existe o hay error al convertir el ID
                changes["document_type"] = {
                    "id": doc_id,
                    "name": "Tipo eliminado"
                }

        rep["changes"] = changes
        return rep


########################################################################################################
####           Serializador para el historial de pagos de alquiler (RentPaymentHistory)             ####
########################################################################################################
class RentPaymentSerializer(serializers.ModelSerializer):
    contract = serializers.SerializerMethodField()
    receipt_image = serializers.ImageField(required=True)
    receipt_image_url = serializers.SerializerMethodField()
    user_comment = serializers.CharField(allow_blank=True, required=False)

    
    class Meta:
        model = RentPaymentHistory
        fields = [
            "id", "contract", "month_paid", "receipt_image", "receipt_image_url",
            "payment_date", "status", "admin_comment", "user_comment"
        ]
        extra_kwargs = {
            "payment_date": {"read_only": True},
            "status": {"read_only": True},
            "admin_comment": {"read_only": True}
        }

    def get_receipt_image_url(self, obj):
        return obj.receipt_image.url if obj.receipt_image else None

    def create(self, validated_data):
        validated_data["status"] = "pending_review"
        return super().create(validated_data)
    
    def get_contract(self, obj):
        return {
            "id": str(obj.contract.id),
            "building": obj.contract.room.building.name,
            "room": obj.contract.room.room_number
        }

########################################################################################################
####                            Serializador para la habitación (Room)                              ####
########################################################################################################
class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name",read_only=True)

    class Meta:
        model = Room
        fields = ["id", "room_number", "is_occupied", "building", "building_name"]

    def validate(self, data):
        try:
            # Intentar validar con las reglas del modelo
            instance = Room(**data)
            instance.clean()
        except DjangoValidationError as e:
            raise DRFValidationError({"error": e.message})

        return data

########################################################################################################
####                          Serializador para el edificio (Building)                              ####
########################################################################################################
class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = "__all__"

########################################################################################################
####           Serializador para la reserva de lavandería (LaundryBooking)                          ####
########################################################################################################
class LaundryBookingSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    pending_action = serializers.SerializerMethodField()
    voucher_image = serializers.ImageField(required=True) 
    voucher_image_url = serializers.SerializerMethodField()  
    payment_status = serializers.SerializerMethodField()
    user_comment = serializers.CharField(allow_blank=True, required=False)
    admin_comment = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = LaundryBooking
        fields = [
            "id", "user", "user_full_name", "date", "time_slot",
            "voucher_image", "voucher_image_url",
            "status", "admin_comment", "user_comment",
            "proposed_date", "proposed_time_slot",
            "counter_proposal_date", "counter_proposal_time_slot",
            "last_action_by", "pending_action", "payment_status"
        ]
        extra_kwargs = {"user": {"required": False}}

    def get_voucher_image_url(self, obj):
        return obj.voucher_image.url if obj.voucher_image else None

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated and request.user.is_tenant():
            validated_data["user"] = request.user
        return super().create(validated_data)

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_pending_action(self, obj):
        if obj.status in ["pending", "counter_proposal", "proposed"]:
            return "user" if obj.last_action_by == "admin" else "admin"
        return None

    def get_payment_status(self, obj):
        if hasattr(obj, "payment"):
            return obj.payment.status
        return None

########################################################################################################
####                    Serializador para el tipo de documento (DocumentType)                       ####
########################################################################################################
class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"
