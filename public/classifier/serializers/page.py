from rest_framework import serializers
from classifier.models.page import Page
from classifier.serializers.glyph import GlyphSerializer
from classifier.serializers.user import UserSerializer


class PageFullSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    glyph_set = GlyphSerializer(many=True, read_only=True)
    glyph_classes = serializers.ReadOnlyField()
    owner = UserSerializer(read_only=True)
    # classifier = GameraClassifierMinimalSerializer()

    class Meta:
        model = Page


class PageMinimalSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    owner = UserSerializer(read_only=True)
    glyph_classes = serializers.ReadOnlyField()
    # classifier = GameraClassifierMinimalSerializer()

    class Meta:
        model = Page
        fields = ("id", "classifier", "owner", "uuid", "name", "glyph_classes", "width", "height", "image", "binary_image")


class PageTeaserSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Page
