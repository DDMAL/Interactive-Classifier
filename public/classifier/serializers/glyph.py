from classifier.models.glyph import Glyph
from rest_framework import serializers
from classifier.serializers.image import ImageSerializer


class GlyphSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    image_set = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Glyph
