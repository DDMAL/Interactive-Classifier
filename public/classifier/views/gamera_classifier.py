from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer,\
    TemplateHTMLRenderer

from classifier.helpers.authentication import ExpiringTokenAuthentication
from classifier.serializers.gamera_classifier import \
    GameraClassifierFullSerializer, GameraClassifierMinimalSerializer
from classifier.models.gamera_classifier import GameraClassifier


class ClassifierList(generics.ListCreateAPIView):
    model = GameraClassifier
    serializer_class = GameraClassifierMinimalSerializer
    queryset = GameraClassifier.objects.all()
    renderer_classes = (TemplateHTMLRenderer,
                        JSONRenderer,
                        BrowsableAPIRenderer)
    template_name = "classifier/index.html"
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_serializer_context(self):
        return {'request': self.request}


class ClassifierDetail(generics.RetrieveUpdateDestroyAPIView):
    model = GameraClassifier
    serializer_class = GameraClassifierFullSerializer
    queryset = GameraClassifier.objects.all()
    renderer_classes = (TemplateHTMLRenderer,
                        JSONRenderer,
                        BrowsableAPIRenderer)
    template_name = "classifier/index.html"
    authentication_classes = (ExpiringTokenAuthentication,
                              SessionAuthentication)
    permission_classes = (IsAuthenticated,)
