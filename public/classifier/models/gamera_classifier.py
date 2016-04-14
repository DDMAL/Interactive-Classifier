from django.contrib.auth.models import User
from django.db import models


class GameraClassifier(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    owner = models.ForeignKey(User, blank=True, null=True)

    def __unicode__(self):
        return u"{0}".format(self.name)
