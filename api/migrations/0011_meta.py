# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-08-20 14:10
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_index'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='location',
            options={'ordering': ('slug',)},
        ),
    ]
