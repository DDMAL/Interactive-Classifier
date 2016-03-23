import uuid
from django.db import models


class Page(models.Model):
    class Meta:
        app_label = "classifier"
        ordering = ['name']

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, blank=False, null=False)

    @property
    def classes(self):
        output = set()
        for glyph in self.glyphs.all():
            output.add(glyph.short_code)
        return output

    def __str__(self):
        return u"{0}".format(self.name)