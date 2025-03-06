# Generated by Django 5.1.6 on 2025-03-06 03:54

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='reference_name_1',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='reference_name_2',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='reference_phone_1',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='reference_phone_2',
        ),
        migrations.CreateModel(
            name='ReferencePerson',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('document_number', models.CharField(max_length=50, unique=True)),
                ('phone_number', models.CharField(blank=True, max_length=20, null=True)),
                ('document_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.documenttype')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='references', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='customuser',
            name='reference_1',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='first_reference', to='core.referenceperson'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='reference_2',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='second_reference', to='core.referenceperson'),
        ),
    ]
