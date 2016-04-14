from django.db import models
from classifier.models.glyph_class import GlyphClass, glyph_class_factory
from django.db.models.signals import pre_save
from django.dispatch import receiver


SHORT_CODE_REGEX = r"/[a-z0-9]*([a-z0-9]+\.)*[a-z0-9]+/"


class Glyph(models.Model):
    class Meta:
        app_label = "classifier"
        # ordering = ['name']

    short_code = models.CharField(max_length=128)
    glyph_class = models.ForeignKey(GlyphClass, blank=True, null=True)
    id_state_manual = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    page = models.ForeignKey("classifier.Page",
                             blank=True,
                             null=True,
                             on_delete=models.CASCADE)
    # Positional fields
    ulx = models.PositiveIntegerField(null=True, blank=True)
    uly = models.PositiveIntegerField(null=True, blank=True)
    nrows = models.PositiveIntegerField(null=True, blank=True)
    ncols = models.PositiveIntegerField(null=True, blank=True)
    #Image
    image_file = models.ImageField(null=True, blank=True)
    context_thumbnail = models.ImageField(null=True, blank=True)

    def __unicode__(self):
        return u"{0}".format(self.short_code)


@receiver(pre_save, sender=Glyph)
def pre_glyph_save(sender, instance, **kwargs):
    instance.glyph_class = glyph_class_factory(instance.short_code)
