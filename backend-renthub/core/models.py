import uuid
import os
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import datetime


# Personalizacion de Creacion de SuperUsers
def create_superuser(self, email, password=None, **extra_fields):
    extra_fields.setdefault("is_staff", True)
    extra_fields.setdefault("is_superuser", True)
    extra_fields.setdefault("role", "superadmin") 
    return self.create_user(email, password, **extra_fields)

####################################################################
#Adecuacion de carga de imagenes
ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"]
MAX_FILE_SIZE_MB = 5  # Tamaño máximo permitido en MB

def validate_image_file(value):
    """Valida que el archivo sea una imagen permitida y no exceda el tamaño máximo"""
    ext = value.name.split(".")[-1].lower()  # Obtiene la extensión del archivo
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(f"Formato no permitido: {ext}. Solo se permiten {', '.join(ALLOWED_IMAGE_EXTENSIONS)}.")

    # Validar tamaño del archivo
    file_size = value.size
    max_size_bytes = MAX_FILE_SIZE_MB * 1024 * 1024  # Convertir MB a bytes
    if file_size > max_size_bytes:
        raise ValidationError(f"El archivo es demasiado grande. Máximo permitido: {MAX_FILE_SIZE_MB}MB.")

def laundry_voucher_upload_path(instance, filename):
    """Genera un nombre de archivo único basado en UUID"""
    ext = filename.split('.')[-1].lower()  # Obtiene la extensión del archivo y la convierte a minúsculas
    unique_filename = f"{uuid.uuid4().hex}.{ext}"  # Genera un UUID como nombre del archivo
    return os.path.join("laundry/vouchers/", unique_filename)

####################################################################

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

class DocumentType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=False, blank=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)

    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True)
    document_number = models.CharField(max_length=50, unique=True)

    profile_photo = models.ImageField(upload_to="users/photos/", blank=True, null=True)
    id_photo = models.ImageField(upload_to="users/ids/", blank=True, null=True)
    contract_photo = models.ImageField(upload_to="users/contracts/", blank=True, null=True)

    ROLE_CHOICES = [
        ("superadmin", "Superadmin"),
        ("admin", "Admin"),
        ("tenant", "Tenant"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="tenant")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

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
        return self.role in ["admin"]

    def is_tenant(self):
        return self.role == "tenant"

    def __str__(self):
        return self.email

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

class PaymentHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="payments")
    payment_date = models.DateField()
    month_paid = models.CharField(max_length=20)
    receipt_image = models.ImageField(upload_to="payments/receipts/", blank=True, null=True)

    STATUS_CHOICES = [
    ("overdue", "Vencido"),
    ("pending_review", "En análisis"),
    ("approved", "Aprobado"),
    ("rejected", "Rechazado"),
]
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="overdue")

    PAYMENT_TYPES = [
        ("rent", "Rent Payment"),
        ("washing", "Laundry Payment"),
    ]
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPES, default="rent")  # 👈 Nuevo campo

    def __str__(self):
        return f"Pago de {self.contract.user.email} - {self.month_paid}"

class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey("core.Building", on_delete=models.CASCADE, related_name="rooms")
    room_number = models.CharField(max_length=50)
    is_occupied = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.building.name} - {self.room_number}"

class Building(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ReferencePerson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True)
    document_number = models.CharField(max_length=50, unique=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.document_number})"

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
    voucher_image = models.ImageField(
        upload_to=laundry_voucher_upload_path,
        blank=False,
        null=False,
        validators=[validate_image_file]
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_laundry_bookings")
    admin_comment = models.TextField(blank=True, null=True)

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
