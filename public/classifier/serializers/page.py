from classifier.models.page import Page
from rest_framework import serializers

from classifier.serializers.glyph import GlyphSerializer


class PageFullSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    glyph_set = GlyphSerializer(many=True, read_only=True)

    class Meta:
        model = Page


class PageTeaserSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    class Meta:
        model = Page
