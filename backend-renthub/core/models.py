import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

def create_superuser(self, email, password=None, **extra_fields):
    extra_fields.setdefault("is_staff", True)
    extra_fields.setdefault("is_superuser", True)
    extra_fields.setdefault("role", "superadmin") 
    return self.create_user(email, password, **extra_fields)

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
        return self.role == "admin"

    def is_tenant(self):
        return self.role == "tenant"

    def __str__(self):
        return self.email

class Contract(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="contracts")
    room = models.ForeignKey("core.Room", on_delete=models.CASCADE, related_name="contracts")  # 👈 SOLUCIÓN

    start_date = models.DateField()
    end_date = models.DateField()

    # Datos financieros
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    includes_wifi = models.BooleanField(default=False)
    wifi_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contrato {self.id} - {self.user.email} ({self.room.room_number})"

class PaymentHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="payments")
    payment_date = models.DateField()
    month_paid = models.CharField(max_length=20)
    receipt_image = models.ImageField(upload_to="payments/receipts/", blank=True, null=True)

    status_choices = [
        ("valid", "Valid"),
        ("rejected", "Rejected"),
        ("pending", "Pending"),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default="pending")

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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="laundry_bookings")
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    date = models.DateField()
    time_slot = models.CharField(max_length=20)  # Ejemplo: "08:00-10:00"
    voucher_image = models.ImageField(upload_to="laundry/vouchers/", blank=False, null=False)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_laundry_bookings")
    admin_comment = models.TextField(blank=True, null=True)  # Motivo de rechazo o propuesta

    # Propuesta del administrador
    proposed_date = models.DateField(blank=True, null=True)
    proposed_time_slot = models.CharField(max_length=20, blank=True, null=True)

    # Respuesta del usuario a la propuesta del admin
    user_response = models.CharField(max_length=10, choices=USER_RESPONSE_CHOICES, default="pending")  

    # Contrapropuesta del usuario
    counter_proposal_date = models.DateField(blank=True, null=True)
    counter_proposal_time_slot = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} - {self.date} {self.time_slot} ({self.status})"
