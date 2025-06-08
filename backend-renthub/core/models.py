import os
import uuid
from django.db import models
from datetime import datetime
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


########################################################################################################
####                                                                                                ####
####                 Validaciones para la carga de imagenes y archivos                              ####
####                                                                                                ####
########################################################################################################
ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"]
MAX_FILE_SIZE_MB = 5

def validate_image_file(file):
    ext = file.name.split('.')[-1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(f"Formato no permitido: {ext}. Solo se permiten {', '.join(ALLOWED_IMAGE_EXTENSIONS)}.")
    
    max_size = MAX_FILE_SIZE_MB * 1024 * 1024
    if file.size > max_size:
        raise ValidationError(f"El archivo es demasiado grande. Máximo permitido: {MAX_FILE_SIZE_MB}MB.")

########################################################################################################
####                                                                                                ####
####                      Clase para gestionar carag de imagenes                                    ####
####                                                                                                ####
########################################################################################################
class UploadPaths:
    @staticmethod
    def build_path(folder, filename):
        ext = filename.split('.')[-1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        return os.path.join(folder, unique_filename)

    @staticmethod
    def user_photo(instance, filename):
        return UploadPaths.build_path("users/photos/", filename)

    @staticmethod
    def contract_photo(instance, filename):
        return UploadPaths.build_path("contracts/photos/", filename)

    @staticmethod
    def rent_receipt(instance, filename):
        return UploadPaths.build_path("payments/rent/", filename)

    @staticmethod
    def laundry_voucher(instance, filename):
        return UploadPaths.build_path("laundry/vouchers/", filename)

def user_photo_upload_path(instance, filename):
    return UploadPaths.user_photo(instance, filename)

def contract_photo_upload_path(instance, filename):
    return UploadPaths.contract_photo(instance, filename)

def rent_receipt_upload_path(instance, filename):
    return UploadPaths.rent_receipt(instance, filename)

def laundry_voucher_upload_path(instance, filename):
    return UploadPaths.laundry_voucher(instance, filename)

########################################################################################################
####                                                                                                ####
####                 Gestor de usuarios personalizados para la autenticación                        ####
####                                                                                                ####
########################################################################################################
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault('role', 'superadmin')
        return self.create_user(email, password, **extra_fields)

########################################################################################################
####                                                                                                ####
####            Modelo para gestionar los tipos de documentos de los usuarios                       ####
####                                                                                                ####
########################################################################################################
class DocumentType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

########################################################################################################
####                                                                                                ####
####                     Modelo para gestionar los usuarios del sistema                             ####
####                                                                                                ####
########################################################################################################
class CustomUser(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = [
        ("superadmin", "Superadmin"),
        ("admin", "Admin"),
        ("tenant", "Tenant"),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=False, blank=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, unique=True, null=False, blank=False)
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True)
    document_number = models.CharField(max_length=50, null=False, blank=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, editable=False, null=True, blank=True)
    profile_photo = models.ImageField(
        upload_to=user_photo_upload_path,
        validators=[validate_image_file],
        default='users/photos/adminDefault.jpg',
        blank=True,
        null=True
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="tenant")

    # Referencias opcionales para todos los usuarios
    reference_1 = models.ForeignKey(
        "core.ReferencePerson",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="first_reference"
    )
    reference_2 = models.ForeignKey(
        "core.ReferencePerson",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="second_reference"
    )

    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "phone_number"]

    def is_superadmin(self):
        return self.role == "superadmin"

    def is_admin(self):
        return self.role in "admin"

    def is_tenant(self):
        return self.role == "tenant"

    def __str__(self):
        return self.email
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['document_type', 'document_number'],
                name='unique_document',
                violation_error_message='custom user with this document already exists.'
            )
        ]

########################################################################################################
####                                                                                                ####
####            Modelo para gestionar los contratos de alquiler de los inquilinos                   ####
####                                                                                                ####
########################################################################################################
class Contract(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="contracts")
    room = models.ForeignKey("core.Room", on_delete=models.CASCADE, related_name="contracts")  
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    includes_wifi = models.BooleanField(default=False)
    wifi_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    contract_photo = models.ImageField(
        upload_to=contract_photo_upload_path,
        validators=[validate_image_file],
        blank=True,
        null=True
    )


    def save(self, *args, **kwargs):
        """Verifica si la habitación está ocupada antes de crear el contrato"""
        if self._state.adding:  # Solo validar en creación, no en actualización
            if Contract.objects.filter(room=self.room, end_date__gte=self.start_date).exists():
                raise ValidationError(f"La habitación {self.room.room_number} ya tiene un contrato activo.")

        super().save(*args, **kwargs)  # Guarda primero el contrato

        # Ahora que el contrato está guardado, marcar la habitación como ocupada
        self.room.is_occupied = True
        self.room.save(update_fields=["is_occupied"])


    def delete(self, *args, **kwargs):
        """Libera la habitación solo si no hay otros contratos activos EN EL FUTURO."""
        super().delete(*args, **kwargs)  # Primero elimina el contrato

        # Si después de eliminar no quedan contratos activos en la habitación, se libera
        if not Contract.objects.filter(room=self.room, end_date__gte=datetime.today().date()).exists():
            self.room.is_occupied = False
            self.room.save(update_fields=["is_occupied"])

########################################################################################################
####                                                                                                ####
####            Modelo para gestionar las solicitudes de cambio de datos de los usuarios            ####
####                                                                                                ####
########################################################################################################
class UserChangeRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pendiente"),
        ("approved", "Aprobado"),
        ("rejected", "Rechazado"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("core.CustomUser", on_delete=models.CASCADE, related_name="change_requests")
    changes = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey("core.CustomUser", null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_requests")
    review_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Solicitud de {self.user.email} - {self.changes} ({self.status})"

########################################################################################################
####                                                                                                ####
####            Modelo para gestionar el historial de pagos de alquileres                           ####
####                                                                                                ####
########################################################################################################
class RentPaymentHistory(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract = models.ForeignKey("core.Contract", on_delete=models.CASCADE, related_name="rent_payments")
    month_paid = models.CharField(max_length=20)
    payment_date = models.DateField(blank=True, null=True)
    admin_comment = models.TextField(blank=True, null=True)
    user_comment = models.TextField(blank=True, null=True)
    receipt_image = models.ImageField(
        upload_to=rent_receipt_upload_path,
        validators=[validate_image_file],
        blank=True,
        null=True
    )
    STATUS_CHOICES = [
        ("overdue", "Vencido"),
        ("pending_review", "En análisis"),
        ("upcoming", "Pendiente"),
        ("approved", "Aprobado"),
        ("rejected", "Rechazado"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="overdue")

    def __str__(self):
        return f"Rent {self.contract.user.email} - {self.month_paid}"

########################################################################################################
####                                                                                                ####
####                   Modelo para gestionar las habitaciones de los edificios                      ####
####                                                                                                ####
########################################################################################################
class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey("core.Building", on_delete=models.CASCADE, related_name="rooms")
    room_number = models.IntegerField()
    is_occupied = models.BooleanField(default=False)

    def clean(self):
        """Valida las restricciones del modelo Room."""
        # Verificar que sea mayor a 0
        if self.room_number <= 0:
            raise ValidationError("El número de habitación debe ser mayor a 0")

    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.building.name} - {self.room_number}"
    
    class Meta:
        ordering = ['building', 'room_number']
        constraints = [
            models.UniqueConstraint(
                fields=['building', 'room_number'],
                name='unique_room_building',
                violation_error_message='Ya existe una habitación con el número {room_number} en el edificio {building}'
            )]

    
########################################################################################################
####                                                                                                ####
####                            Modelo para gestionar los edificios                                 ####
####                                                                                                ####
########################################################################################################
class Building(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

########################################################################################################
####                                                                                                ####
####            Modelo para gestionar a los usuarios de referencia de los inquilinos                ####
####                                                                                                ####
########################################################################################################
class ReferencePerson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True)
    document_number = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.document_number})"


########################################################################################################
####                                                                                                ####
####                   Modelo para gestionar las reservas de lavandería                             ####
####                                                                                                ####
########################################################################################################
class LaundryBooking(models.Model):
    
    STATUS_CHOICES = [
        ("pending", "Pendiente"),
        ("approved", "Aprobado"),
        ("rejected", "Rechazado"),
        ("proposed", "Propuesta"),
        ("counter_proposal", "Contrapropuesta"),
    ]

    USER_RESPONSE_CHOICES = [
        ("pending", "Pendiente"),
        ("accepted", "Aceptada"),
        ("rejected", "Rechazada"),
    ]

    LAST_ACTION_CHOICES = [
        ("user", "Usuario"),
        ("admin", "Administrador"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="laundry_bookings")
    date = models.DateField()
    time_slot = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_laundry_bookings")
    admin_comment = models.TextField(blank=True, null=True)
    user_comment = models.TextField(blank=True, null=True)

    voucher_image = models.ImageField(
        upload_to=laundry_voucher_upload_path,
        validators=[validate_image_file],
        blank=False,
        null=False
    )

    # Propuesta del administrador
    proposed_date = models.DateField(blank=True, null=True)
    proposed_time_slot = models.CharField(max_length=20, blank=True, null=True)

    # Respuesta del usuario a la propuesta del admin
    user_response = models.CharField(max_length=10, choices=USER_RESPONSE_CHOICES, default="pending")

    # Contrapropuesta del usuario
    counter_proposal_date = models.DateField(blank=True, null=True)
    counter_proposal_time_slot = models.CharField(max_length=20, blank=True, null=True)

    # 🚀 Nuevo campo para identificar quién hizo la última acción
    last_action_by = models.CharField(max_length=10, choices=LAST_ACTION_CHOICES, default="user")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} - {self.date} {self.time_slot} ({self.status})"
