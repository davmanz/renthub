from rest_framework import serializers
from core.models import (CustomUser, 
                         Contract, 
                         PaymentHistory, 
                         Room, Building,
                         ReferencePerson,
                         LaundryBooking, DocumentType
                         )
from datetime import datetime
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
    class Meta:
        model = Contract
        fields = "__all__"

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