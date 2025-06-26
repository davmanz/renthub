from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView, TokenObtainPairView
    )
from core.views import (CustomUserViewSet, ContractViewSet, 
                        RoomViewSet, BuildingViewSet, 
                        ReferencePersonViewSet,DocumentTypesViewSet,
                        UserDashboardView, AdminDashboardView,
                        LaundryDashboardView, RentPaymentViewSet,
                        LaundryBookingViewSet,
                        RentPaymentDetailView,
                        UserChangeRequestViewSet,
                        VerifyAccountView)

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'contracts', ContractViewSet)
router.register(r'payments/rent', RentPaymentViewSet, basename="rent-payments")
router.register(r'rooms', RoomViewSet)
router.register(r'buildings', BuildingViewSet)
router.register(r'references', ReferencePersonViewSet)
router.register(r'document-types', DocumentTypesViewSet)
router.register(r"laundry-bookings", LaundryBookingViewSet, basename="laundry-bookings")
router.register(r'change_requests', UserChangeRequestViewSet, basename='user-change-request')


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/user-dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
    path("api/admin-dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("api/laundry-dashboard/", LaundryDashboardView.as_view(), name="laundry-dashboard"),
    path("api/payments/rent/<uuid:pk>/", RentPaymentDetailView.as_view(), name="rent-payment-detail"),
    path("api/verify-account/<token>/", VerifyAccountView.as_view(), name="verify-account"),
]

# Esto sirve los archivos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)