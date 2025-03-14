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

    reference_1 = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), required=False, allow_null=True)
      
    reference_2 = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "password", "first_name", "last_name", "phone_number",
            "document_type", "document_number",
            "profile_photo", "id_photo", "contract_photo",
            "role", "is_active", "is_staff", "date_joined",
            "reference_1", "reference_2"
        ]

    def create(self, validated_data):
        password = validated_data.pop("password") 
        user = CustomUser.objects.create(**validated_data)  
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """Evita que los Tenants cambien su propio rol"""
        user = self.context["request"].user

        if user.is_tenant() and "role" in validated_data:
            validated_data.pop("role")  # Elimina el cambio de rol

        return super().update(instance, validated_data)

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
    class Meta:
        model = LaundryBooking
        exclude = ["user"]

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


    class Meta:
        model = DocumentType
        fields = "__all__"