import os
from django.core.management.base import BaseCommand
from classifier.helpers.importers.image_importer import ImageImporter
from settings import MEDIA_ROOT


class Command(BaseCommand):
    args = ""

    def handle(self, *args, **kwargs):
        test_image_url = os.path.join(MEDIA_ROOT, "image_test.png")
        print test_image_url
        importer = ImageImporter(None, test_image_url)
        importer.import_data()
