from django.core.validators import RegexValidator
from django.db import models

from classifier.helpers.storage.media_file_system import media_file_name, \
    MediaFileSystemStorage
from classifier.models.page import Page
from django.db.models.signals import pre_delete
from django.dispatch import receiver


SHORT_CODE_REGEX = r"/[a-z0-9]*([a-z0-9]+\.)*[a-z0-9]+/"


class Glyph(models.Model):
    class Meta:
        app_label = "classifier"
        # ordering = ['name']

    short_code = models.CharField(
        max_length=128
        # validators=[
        #     RegexValidator(
        #         regex=SHORT_CODE_REGEX,
        #         message="Glyph shortcode must be lowercase alphanumeric (with optional periods)",
        #         code="invalid_shortcode"
        #     )
        # ]
    )
    id_state_manual = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    page = models.ForeignKey(Page, blank=True, null=True)
    # Positional fields
    ulx = models.PositiveIntegerField(null=True, blank=True)
    uly = models.PositiveIntegerField(null=True, blank=True)
    nrows = models.PositiveIntegerField(null=True, blank=True)
    ncols = models.PositiveIntegerField(null=True, blank=True)
    #Image
    image_file = models.ImageField(null=True, blank=True,
                                   upload_to=media_file_name,
                                   storage=MediaFileSystemStorage())

    def __unicode__(self):
        return u"{0}".format(self.short_code)


@receiver(pre_delete, sender=Glyph)
def pre_glyph_delete(sender, instance, **kwargs):
    """
    When a glyph is deleted, we delete its names, too!

    :param sender:Glyph
    :param instance:
    :param kwargs:
    :return:
    """
    Image.objects.filter(glyph=sender).delete()
