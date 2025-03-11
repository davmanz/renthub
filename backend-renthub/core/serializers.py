from rest_framework import serializers
from core.models import (CustomUser, 
                         Contract, 
                         PaymentHistory, 
                         Room, Building,
                         ReferencePerson,
                         LaundryBooking, DocumentType
                         )

class ReferencePersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferencePerson
        fields = "__all__"

class CustomUserSerializer(serializers.ModelSerializer):
    reference_1 = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), required=False, allow_null=True)
      
    reference_2 = serializers.PrimaryKeyRelatedField(
        queryset=ReferencePerson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "first_name", "last_name", "phone_number",
            "document_type", "document_number",
            "profile_photo", "id_photo", "contract_photo",
            "role", "is_active", "is_staff", "date_joined",
            "reference_1", "reference_2"
        ]
    
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
        fields = "__all__"

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


    class Meta:
        model = DocumentType
        fields = "__all__"