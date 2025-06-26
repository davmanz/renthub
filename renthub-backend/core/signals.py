import os
from datetime import date
from django.db.models.signals import post_delete
from django.dispatch import receiver
from core.models import (Contract ,
                         CustomUser, 
                         RentPaymentHistory)

@receiver(post_delete, sender=Contract)
def release_room_if_empty(sender, instance, **kwargs):
    """
    Libera la habitación si ya no tiene contratos activos en el futuro.
    Esto se ejecuta automáticamente al eliminar un contrato.
    """
    room = instance.room

    # Verifica si no quedan contratos activos en esa habitación
    has_active_contracts = Contract.objects.filter(
        room=room,
        end_date__gte=date.today()
    ).exists()

    if not has_active_contracts:
        room.is_occupied = False
        room.save(update_fields=["is_occupied"])

def delete_file_if_exists(file_field):
    """Borra el archivo del sistema de archivos si existe"""
    if file_field and os.path.isfile(file_field.path):
        os.remove(file_field.path)

@receiver(post_delete, sender=CustomUser)
def delete_user_images(sender, instance, **kwargs):
    """
    Elimina la imagen de perfil del usuario cuando se elimina el usuario,
    excepto si es la imagen por defecto.
    """
    # Verificar si existe la imagen de perfil y no es la imagen por defecto
    if instance.profile_photo and not instance.profile_photo.name.endswith('adminDefault.jpg'):
        delete_file_if_exists(instance.profile_photo)

@receiver(post_delete, sender=RentPaymentHistory)
def delete_rent_receipt(sender, instance, **kwargs):
    delete_file_if_exists(instance.receipt_image)


