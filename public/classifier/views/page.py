from classifier.helpers.authentication import ExpiringTokenAuthentication
from classifier.serializers.page import PageFullSerializer, PageTeaserSerializer
from classifier.models.page import Page
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer


class PageList(generics.ListCreateAPIView):
    model = Page
    serializer_class = PageTeaserSerializer
    queryset = Page.objects.all()
    renderer_classes = (JSONRenderer,)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)


class MyPageList(generics.ListAPIView):
    model = Page
    serializer_class = PageTeaserSerializer
    renderer_classes = (JSONRenderer,)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        This view should return a list of all pages I own.
        """
        user = self.request.user
        return Page.objects.filter(owner=user)


class PageDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Page
    serializer_class = PageFullSerializer
    queryset = Page.objects.all()
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer)
    template_name = "classifier/index.html"
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)
