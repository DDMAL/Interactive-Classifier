from classifier.models.glyph_class import GlyphClass
from rest_framework import serializers


class GlyphClassSerializer(serializers.HyperlinkedModelSerializer):
    name = serializers.ReadOnlyField()
    class Meta:
        model = GlyphClass
        fields = ("name",)
