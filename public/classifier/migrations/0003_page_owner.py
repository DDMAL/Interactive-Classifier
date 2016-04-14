# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-05 20:06
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('classifier', '0002_page_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='page',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]