from django.db import models
from django.dispatch import receiver
from django.db.models.signals import pre_save


class NameNomenclatureMembership(models.Model):
    """
    A relationship between a name and a nomenclature.
    """

    name = models.ForeignKey('classifier.Name')
    nomenclature = models.ForeignKey('classifier.Nomenclature')
    # Auto-set glyph
    glyph = models.ForeignKey('classifier.Glyph', null=True, blank=True)

    def __unicode__(self):
        return u"({0}, {1})".format(self.name, self.nomenclature)

    @property
    def name_string(self):
        return u"{0}".format(self.name.string)

    @property
    def nomenclature_string(self):
        return u"{0}".format(self.nomenclature.nomenclature_name)


    class Meta:
        app_label = "classifier"
        # Name & Nomenclature pair must be unique
        unique_together = ('name', 'nomenclature')


@receiver(pre_save, sender=NameNomenclatureMembership)
def set_glyph(sender, instance, **kwargs):
    # Automatically set the glyph
    instance.glyph = instance.name.glyph