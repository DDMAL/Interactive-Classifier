from django.db import models


class Style(models.Model):
    class Meta:
        app_label = "classifier"
        ordering = ['name']

    name = models.CharField(max_length=128, blank=False, null=False)

    def __unicode__(self):
        return u"{0}".format(self.name)
