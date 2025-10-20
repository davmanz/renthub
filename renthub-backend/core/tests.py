from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import date, timedelta

from core.models import (
    DocumentType, CustomUser, Building, Room, Contract, 
    ReferencePerson, validate_image_file
)

User = get_user_model()


class DocumentTypeModelTest(TestCase):
    """Tests for DocumentType model"""
    
    def test_create_document_type(self):
        """Test creating a document type"""
        doc_type = DocumentType.objects.create(name="DNI")
        self.assertEqual(doc_type.name, "DNI")
        self.assertIsNotNone(doc_type.id)
    
    def test_document_type_unique(self):
        """Test that document type names are unique"""
        DocumentType.objects.create(name="DNI")
        with self.assertRaises(Exception):
            DocumentType.objects.create(name="DNI")
    
    def test_document_type_str(self):
        """Test string representation"""
        doc_type = DocumentType.objects.create(name="Passport")
        self.assertEqual(str(doc_type), "Passport")


class CustomUserModelTest(TestCase):
    """Tests for CustomUser model"""
    
    def setUp(self):
        """Set up test data"""
        self.doc_type = DocumentType.objects.create(name="DNI")
    
    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            phone_number="1234567890",
            document_type=self.doc_type,
            document_number="12345678"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))
        self.assertEqual(user.role, "tenant")
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)
        self.assertIsNotNone(user.id)
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
            first_name="Admin",
            last_name="User",
            phone_number="9876543210"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.role, "superadmin")
    
    def test_user_email_required(self):
        """Test that email is required"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email="",
                password="testpass123"
            )
    
    def test_user_roles(self):
        """Test user role methods"""
        user = User.objects.create_user(
            email="tenant@example.com",
            password="pass123",
            first_name="Tenant",
            last_name="User",
            phone_number="1111111111",
            role="tenant"
        )
        self.assertTrue(user.is_tenant())
        self.assertFalse(user.is_admin())
        self.assertFalse(user.is_superadmin())
    
    def test_unique_document_constraint(self):
        """Test unique document constraint"""
        User.objects.create_user(
            email="user1@example.com",
            password="pass123",
            first_name="User",
            last_name="One",
            phone_number="1111111111",
            document_type=self.doc_type,
            document_number="12345678"
        )
        
        with self.assertRaises(Exception):
            User.objects.create_user(
                email="user2@example.com",
                password="pass123",
                first_name="User",
                last_name="Two",
                phone_number="2222222222",
                document_type=self.doc_type,
                document_number="12345678"
            )


class BuildingAndRoomModelTest(TestCase):
    """Tests for Building and Room models"""
    
    def test_create_building(self):
        """Test creating a building"""
        building = Building.objects.create(
            name="Test Building",
            address="123 Test St"
        )
        self.assertEqual(building.name, "Test Building")
        self.assertEqual(building.address, "123 Test St")
        self.assertIsNotNone(building.id)
    
    def test_create_room(self):
        """Test creating a room"""
        building = Building.objects.create(
            name="Building A",
            address="456 Main St"
        )
        room = Room.objects.create(
            building=building,
            room_number="101",
            floor=1,
            room_type="single"
        )
        self.assertEqual(room.room_number, "101")
        self.assertEqual(room.building.name, "Building A")
        self.assertEqual(room.floor, 1)
    
    def test_room_str(self):
        """Test room string representation"""
        building = Building.objects.create(name="Test", address="Address")
        room = Room.objects.create(
            building=building,
            room_number="202",
            floor=2
        )
        expected = f"Habitación 202 - {building.name}"
        self.assertEqual(str(room), expected)


class ContractModelTest(TestCase):
    """Tests for Contract model"""
    
    def setUp(self):
        """Set up test data"""
        self.doc_type = DocumentType.objects.create(name="DNI")
        self.user = User.objects.create_user(
            email="tenant@example.com",
            password="pass123",
            first_name="Tenant",
            last_name="User",
            phone_number="1234567890",
            document_type=self.doc_type,
            document_number="12345678"
        )
        self.building = Building.objects.create(
            name="Building A",
            address="123 Street"
        )
        self.room = Room.objects.create(
            building=self.building,
            room_number="101",
            floor=1
        )
    
    def test_create_contract(self):
        """Test creating a contract"""
        contract = Contract.objects.create(
            user=self.user,
            room=self.room,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
            rent_amount=Decimal("500.00"),
            deposit_amount=Decimal("500.00"),
            includes_wifi=True,
            wifi_cost=Decimal("50.00")
        )
        self.assertEqual(contract.user, self.user)
        self.assertEqual(contract.room, self.room)
        self.assertEqual(contract.rent_amount, Decimal("500.00"))
        self.assertTrue(contract.includes_wifi)
    
    def test_contract_status(self):
        """Test contract status calculation"""
        active_contract = Contract.objects.create(
            user=self.user,
            room=self.room,
            start_date=date.today() - timedelta(days=30),
            end_date=date.today() + timedelta(days=30),
            rent_amount=Decimal("500.00"),
            deposit_amount=Decimal("500.00"),
            status="active"
        )
        self.assertEqual(active_contract.status, "active")


class ReferencePersonModelTest(TestCase):
    """Tests for ReferencePerson model"""
    
    def test_create_reference_person(self):
        """Test creating a reference person"""
        ref = ReferencePerson.objects.create(
            name="John Doe",
            phone_number="9876543210",
            relationship="Friend"
        )
        self.assertEqual(ref.name, "John Doe")
        self.assertEqual(ref.phone_number, "9876543210")
        self.assertIsNotNone(ref.id)
    
    def test_reference_str(self):
        """Test string representation"""
        ref = ReferencePerson.objects.create(
            name="Jane Smith",
            phone_number="5555555555",
            relationship="Family"
        )
        expected = "Jane Smith - 5555555555"
        self.assertEqual(str(ref), expected)


class FileValidationTest(TestCase):
    """Tests for file validation functions"""
    
    def test_validate_image_extension(self):
        """Test image extension validation"""
        self.assertTrue(callable(validate_image_file))
