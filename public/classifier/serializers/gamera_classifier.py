from rest_framework import serializers
from classifier.models.gamera_classifier import GameraClassifier
from classifier.serializers.page import PageTeaserSerializer
from classifier.serializers.user import UserSerializer


class GameraClassifierMinimalSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    owner = UserSerializer(read_only=True)

    class Meta:
        model = GameraClassifier

    def create(self, validated_data):
        """
        Automatically make the current user the owner.
        """
        return GameraClassifier.objects.create(owner=self.context["request"].user, **validated_data)


class GameraClassifierFullSerializer(GameraClassifierMinimalSerializer):
    page_set = PageTeaserSerializer(many=True)
