from django.test import TestCase
from core.models import (
    CustomUser, Contract, RentPaymentHistory, LaundryBooking, LaundryPaymentHistory
)
from core.models import Room, Building

from datetime import date


class PaymentTests(TestCase):

    
    @classmethod
    def setUpTestData(cls):
        """ Configuración inicial: Crear usuario, edificio, habitación, contrato y reservas """
        cls.user = CustomUser.objects.create(
            email="testuser@example.com",
            first_name="Test",
            last_name="User",
            phone_number="123456789"
        )

        cls.building = Building.objects.create(
            name="Edificio Prueba",
            address="Calle Falsa 123"
        )

        cls.room = Room.objects.create(
            building=cls.building,
            room_number="101"
        )

        cls.contract = Contract.objects.create(
            user=cls.user,
            room=cls.room,  # ✅ Ahora asignamos una habitación
            start_date="2024-01-01",
            end_date="2025-01-01",
            rent_amount=500.00,
            deposit_amount=100.00
        )

        cls.laundry_booking = LaundryBooking.objects.create(
            user=cls.user,
            date="2024-03-21",
            time_slot="10:00-11:00",
            voucher_image="laundry/vouchers/sample.jpg"
        )

    def test_create_rent_payment(self):
        """ Prueba crear un pago de arriendo """
        payment = RentPaymentHistory.objects.create(
            contract=self.contract,
            month_paid="2024-03",
            receipt_image="payments/rent/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )
        self.assertEqual(payment.status, "pending_review")

    def test_approve_rent_payment(self):
        """ Prueba aprobar un pago de arriendo """
        payment = RentPaymentHistory.objects.create(
            contract=self.contract,
            month_paid="2024-03",
            receipt_image="payments/rent/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )
        payment.status = "approved"
        payment.save()
        self.assertEqual(payment.status, "approved")

    def test_reject_rent_payment(self):
        """ Prueba rechazar un pago de arriendo con comentario """
        payment = RentPaymentHistory.objects.create(
            contract=self.contract,
            month_paid="2024-03",
            receipt_image="payments/rent/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )
        payment.status = "rejected"
        payment.admin_comment = "El comprobante es inválido."
        payment.save()
        self.assertEqual(payment.status, "rejected")
        self.assertEqual(payment.admin_comment, "El comprobante es inválido.")

    def test_create_laundry_payment(self):
        """ Prueba crear un pago de lavandería """
        payment = LaundryPaymentHistory.objects.create(
            user=self.user,
            laundry_booking=self.laundry_booking,
            receipt_image="payments/laundry/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )
        self.assertEqual(payment.status, "pending_review")

    def test_approve_laundry_payment(self):
        """ Prueba aprobar un pago de lavandería """
        payment = LaundryPaymentHistory.objects.create(
            user=self.user,
            laundry_booking=self.laundry_booking,
            receipt_image="payments/laundry/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )
        payment.status = "approved"
        payment.save()
        self.assertEqual(payment.status, "approved")

    def test_reject_laundry_payment(self):
        """ Prueba rechazar un pago de lavandería con comentario """
        payment = LaundryPaymentHistory.objects.create(
            user=self.user,
            laundry_booking=self.laundry_booking,
            receipt_image="payments/laundry/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )
        payment.status = "rejected"
        payment.admin_comment = "El voucher está borroso."
        payment.save()
        self.assertEqual(payment.status, "rejected")
        self.assertEqual(payment.admin_comment, "El voucher está borroso.")

    def test_user_dashboard(self):
        """ Prueba datos en el dashboard del usuario """
        RentPaymentHistory.objects.create(
            contract=self.contract,
            month_paid="2024-03",
            receipt_image="payments/rent/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )

        user_dashboard_data = {
            "pending": list(self.contract.rent_payments.filter(status="pending_review").values()),
            "next_due": self.contract.rent_payments.order_by("payment_date").values("month_paid").first(),
            "history": list(self.contract.rent_payments.values_list("month_paid", flat=True))
        }
        self.assertTrue(len(user_dashboard_data["pending"]) > 0)

    def test_admin_dashboard(self):
        """ Prueba datos en el dashboard del admin """
        RentPaymentHistory.objects.create(
            contract=self.contract,
            month_paid="2024-03",
            receipt_image="payments/rent/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )

        LaundryPaymentHistory.objects.create(
            user=self.user,
            laundry_booking=self.laundry_booking,
            receipt_image="payments/laundry/comprobante.jpg",
            payment_date=date.today(),
            status="pending_review"
        )

        admin_dashboard_data = {
            "unverified_rent_payments": list(RentPaymentHistory.objects.filter(status="pending_review").values()),
            "unverified_laundry_payments": list(LaundryPaymentHistory.objects.filter(status="pending_review").values()),
            "overdue_rent_payments": list(RentPaymentHistory.objects.filter(status="overdue").values())
        }
        self.assertTrue(len(admin_dashboard_data["unverified_rent_payments"]) > 0)
        self.assertTrue(len(admin_dashboard_data["unverified_laundry_payments"]) > 0)
