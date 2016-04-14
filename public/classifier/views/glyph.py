from rest_framework.response import Response
from classifier.helpers.authentication import ExpiringTokenAuthentication
from classifier.models.glyph_class import GlyphClass
from classifier.models.page import Page
from classifier.serializers.glyph import GlyphSerializer
from classifier.models.glyph import Glyph
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.permissions import IsAuthenticated


class GlyphList(generics.ListCreateAPIView):
    model = Glyph
    queryset = Glyph.objects.all()
    serializer_class = GlyphSerializer
    template_name = 'classifier/index.html'
    renderer_classes = (JSONRenderer,
                        TemplateHTMLRenderer)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)


class GlyphsByPageAndShortcode(generics.ListAPIView):
    serializer_class = GlyphSerializer
    # renderer_classes = (JSONRenderer,)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if "short_code" in self.request.GET:
            return Glyph.objects.filter(page_id=self.kwargs['pk'],
                                        short_code=self.request.GET["short_code"])
        else:
            return Glyph.objects.filter(page_id=self.kwargs['pk'])


class GlyphDetail(generics.RetrieveUpdateDestroyAPIView):
    model = Glyph
    queryset = Glyph.objects.all()
    serializer_class = GlyphSerializer
    template_name = 'classifier/index.html'
    renderer_classes = (JSONRenderer,
                        TemplateHTMLRenderer)
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)
