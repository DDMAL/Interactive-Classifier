from classifier.models.glyph import Glyph
from rest_framework import serializers


class GlyphSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    # glyph_class = serializers.ReadOnlyField()


    class Meta:
        model = Glyph
        fields = ["url", "id", "short_code", "id_state_manual", "confidence", "ulx", "uly", "nrows", "ncols", 'image_file']


class GlyphImagelessSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Glyph
        fields = ["url", "id", "short_code", "id_state_manual", "confidence", "ulx", "uly", "nrows", "ncols"]
