from classifier.models.glyph import Glyph
from classifier.models.name import Name
from rest_framework import serializers


class NameSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    glyph = serializers.HyperlinkedRelatedField(view_name='glyph-detail',
                                                queryset=Glyph.objects.all())

    class Meta:
        model = Name
