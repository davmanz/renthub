from django.core.management.base import BaseCommand
from core.models import CustomUser, DocumentType


class Command(BaseCommand):
    help = "Carga datos iniciales por defecto en la base de datos"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🔄 Cargando datos iniciales...'))
        
        ##########################
        ####                  ####
        ####  Super Usuario   ####
        ####                  ####
        ##########################
        if not CustomUser.objects.filter(email='admin@email.com').exists():
            CustomUser.objects.create_superuser(
                email='admin@email.com',
                password='admin',
                first_name='FAdmin',
                last_name='LUser',
                phone_number='012345678',
                is_verified=True,
                is_active=True,
                is_staff=True,
            )
            self.stdout.write(self.style.SUCCESS('✅ Superusuario admin creado'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  Superusuario admin ya existe'))

        ##########################
        ####                  ####
        #### Tipos Documentos ####
        ####                  ####
        ##########################
        document_types = [
            "Cédula de Ciudadanía",
            "Pasaporte",
            "Cédula Extranjería",
        ]

        for doc_type in document_types:
            _, created = DocumentType.objects.get_or_create(name=doc_type)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Tipo de documento "{doc_type}" creado'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️  Tipo de documento "{doc_type}" ya existe'))

        self.stdout.write(self.style.SUCCESS('🎉 Datos iniciales cargados correctamente'))