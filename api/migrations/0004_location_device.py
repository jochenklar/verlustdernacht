# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-05-05 17:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_location_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='device',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
