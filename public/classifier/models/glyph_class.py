from django.db import models


class GlyphClass(models.Model):
    class Meta:
        app_label = "classifier"
        ordering = ['name']

    name = models.CharField(primary_key=True, max_length=128)

    def __unicode__(self):
        return u"{0}".format(self.name)


def glyph_class_factory(name):
    # TODO: Sanitize the glyph name
    # Check if the  glyph class exists
    glyph_class, created = GlyphClass.objects.get_or_create(name=name)
    return glyph_class
