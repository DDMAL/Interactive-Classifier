import os

from rest_framework import generics
from rest_framework.response import Response
from classifier.models.page import Page
from classifier.models.glyph import Glyph

# Gamera requirements
from gamera.core import *
from gamera import knn

from settings import MEDIA_ROOT


class GameraClassifyAllView(generics.GenericAPIView):

    def get(self, request, *args, **kwargs):
        # Get the page
        page = Page.objects.get(id=kwargs['pk'])
        # Start up Gamera
        init_gamera()

        classifier = knn.kNNInteractive()

        # Train the classifier
        for glyph in Glyph.objects.filter(page=page, id_state_manual=True):
            # Load a gamera image
            image_url = os.path.join(MEDIA_ROOT, glyph.image_file.path)
            gamera_image = load_image(image_url).to_onebit()
            # print gamera_image
            classifier.classify_glyph_manual(gamera_image, glyph.short_code)

        # Classify the mystery glyphs
        for glyph in Glyph.objects.filter(page=page, id_state_manual=False):
            image_url = os.path.join(MEDIA_ROOT, glyph.image_file.path)
            gamera_image = load_image(image_url).to_onebit()
            # Try to automatically classify
            result, confidence = classifier.guess_glyph_automatic(gamera_image)
            glyph.short_code = result[0][1]
            glyph.confidence = result[0][0]
            glyph.save()

        # Did it work?
        return Response(data={"success": "GameraXML file parsed successfully."},
                        status=201)
