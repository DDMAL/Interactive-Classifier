from django.db.models import Count

from rest_framework.response import Response
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer, TemplateHTMLRenderer

from classifier.helpers.authentication import ExpiringTokenAuthentication
from classifier.models.glyph import Glyph
from classifier.models.glyph_class import GlyphClass
from classifier.serializers.page import PageTeaserSerializer,\
    PageMinimalSerializer
from classifier.models.page import Page
from classifier.queries.queries import get_glyph_classes



class PageList(generics.ListCreateAPIView):
    model = Page
    serializer_class = PageTeaserSerializer
    queryset = Page.objects.all()
    renderer_classes = (JSONRenderer,
                        BrowsableAPIRenderer)
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
    serializer_class = PageMinimalSerializer
    queryset = Page.objects.all()
    renderer_classes = (TemplateHTMLRenderer,
                        JSONRenderer,
                        BrowsableAPIRenderer)
    template_name = "classifier/index.html"
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)


class PageClasses(generics.ListAPIView):
    model = GlyphClass
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        return Response(status=200, data={
            "short_codes": get_glyph_classes(kwargs['pk'])
        })


class PageStats(generics.GenericAPIView):

    def get(self, request, *args, **kwargs):
        return Response(status=200, data={
            "id_states": Glyph.objects.filter(page_id=kwargs['pk']).values("id_state_manual").annotate(Count("id")).order_by()
        })