from classifier.models.page import Page
from rest_framework import serializers

from classifier.serializers.glyph import GlyphSerializer
from classifier.serializers.user import UserSerializer


class PageFullSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    glyph_set = GlyphSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Page


class PageTeaserSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    owner = UserSerializer(read_only=True)
    class Meta:
        model = Page

