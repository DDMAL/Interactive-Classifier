from django.core.management.base import BaseCommand

from classifier.models.glyph import Glyph


class Command(BaseCommand):
    args = ""

    def handle(self, *args, **kwargs):
        for glyph in Glyph.objects.filter(id_state_manual=False):
            glyph.short_code = "UNCLASSIFIED"
            glyph.save()
