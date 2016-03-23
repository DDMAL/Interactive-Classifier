from classifier.helpers.authentication import ExpiringTokenAuthentication
from classifier.serializers.page import PageFullSerializer, PageTeaserSerializer
from classifier.models.page import Page
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer


class PageList(generics.ListCreateAPIView):
    model = Page
    serializer_class = PageTeaserSerializer
    queryset = Page.objects.all()
    renderer_classes = (JSONRenderer,)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)


class PageDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Page
    serializer_class = PageFullSerializer
    queryset = Page.objects.all()
    renderer_classes = (JSONRenderer,)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)
