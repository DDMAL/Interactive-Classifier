from django.core.management.base import BaseCommand
from classifier.models.image import Image


class Command(BaseCommand):
    args = ""

    def handle(self, *args, **kwargs):
        # Destroy images
        Image.objects.all().delete()
        print("Images destroyed.")
