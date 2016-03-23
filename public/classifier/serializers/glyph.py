from classifier.models.glyph import Glyph
from rest_framework import serializers


class GlyphSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Glyph
