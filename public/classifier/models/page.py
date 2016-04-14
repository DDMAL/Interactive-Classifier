import os
import uuid

from PIL import Image
from django.contrib.auth.models import User
from django.db import models

from classifier.models.gamera_classifier import GameraClassifier
from classifier.models.glyph import Glyph
from classifier.queries.queries import get_glyph_classes
from settings import MEDIA_ROOT


class Page(models.Model):
    class Meta:
        app_label = "classifier"
        ordering = ['name']

    classifier = models.ForeignKey(GameraClassifier, null=True)

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)

    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)

    image = models.ImageField(blank=True, null=True)
    binary_image = models.ImageField(blank=True, null=True)
    owner = models.ForeignKey(User, blank=True, null=True)

    @property
    def glyph_classes(self):
        return get_glyph_classes(self.id)

    @property
    def classes(self):
        output = set()
        for glyph in self.glyphs.all():
            output.add(glyph.short_code)
        return output

    def __str__(self):
        return u"{0}".format(self.name)


def paint_thumbnails(page):
    page_image = Image.open(page.image)

    for glyph in Glyph.objects.filter(page=page):
        binarized_glyph_image = Image.open(glyph.image_file)

        # Make a copy
        temp_full_image = page_image.copy()

        # Copy the red pixels
        for x in range(glyph.ncols):
            for y in range(glyph.nrows):
                # Image is binary, so pixel value will either be 0 or 255
                pixel = binarized_glyph_image.getpixel((x,y))
                if pixel == 0:
                    temp_full_image.putpixel((x + glyph.ulx, y + glyph.uly), (255,0,0))

        # Upper left cannot be less than (0,0)
        thumbnail_ulx = max(glyph.ulx - 64, 0)
        thumbnail_uly = max(glyph.uly - 64, 0)

        # Bottom right cannot be greater than image (width, height)
        thumbnail_brx = min(thumbnail_ulx + glyph.ncols + 64, page_image.width)
        thumbnail_bry = min(thumbnail_uly + glyph.nrows + 64, page_image.height)

        new_image_name = "{0}.{1}".format(uuid.uuid4().hex, "png")

        print new_image_name

        new_image = temp_full_image.crop((thumbnail_ulx,
                                     thumbnail_uly,
                                     thumbnail_brx,
                                     thumbnail_bry))

        directory = os.path.join(MEDIA_ROOT, glyph.page.uuid.hex)

        # Create the directory if it doesn't exist
        if not os.path.exists(directory):
            os.makedirs(directory)

        new_image.save(os.path.join(directory, new_image_name))

        # Close the open images
        binarized_glyph_image.close()
        temp_full_image.close()
        new_image.close()

        glyph.context_thumbnail = "{0}/{1}".format(glyph.page.uuid.hex, new_image_name)
        glyph.save()
