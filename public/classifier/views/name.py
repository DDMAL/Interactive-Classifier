from classifier.helpers.authentication import ExpiringTokenAuthentication
from classifier.serializers.name import NameSerializer
from classifier.models.name import Name
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer


class NameList(generics.ListCreateAPIView):
    model = Name
    serializer_class = NameSerializer
    renderer_classes = (JSONRenderer,)
    queryset = Name.objects.all()
    # authentication_classes = (ExpiringTokenAuthentication,
    #                           SessionAuthentication)
    # permission_classes = (IsAuthenticated,)


class NameDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Name
    serializer_class = NameSerializer
    renderer_classes = (JSONRenderer,)
    queryset = Name.objects.all()
    # authentication_classes = (SessionAuthentication,)
    # permission_classes = (IsAuthenticated,)
