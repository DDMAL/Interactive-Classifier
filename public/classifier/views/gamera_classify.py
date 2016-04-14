import os
import random

from rest_framework import generics
from rest_framework.response import Response

from classifier.models.glyph import Glyph
from classifier.models.page import Page

# Gamera requirements
from gamera.core import *
from gamera import knn

from classifier.queries.queries import reset_glyph_classifications
from settings import MEDIA_ROOT


class GameraClassifyAllView(generics.GenericAPIView):

    def get(self, request, *args, **kwargs):
        # Start up Gamera
        init_gamera()
        classifier = knn.kNNInteractive()

        all_glyphs = Glyph.objects.only("id_state_manual", "image_file", "short_code", "confidence")

        django_classifier = Page.objects.get(id=kwargs['pk']).classifier
        # If the page is attached to a classifier, use it
        if django_classifier is not None:
            print "Using classifier!"
            training_glyphs = all_glyphs.filter(page__classifier=django_classifier, id_state_manual=True)
        else:
            print "Using only page!"
            training_glyphs = all_glyphs.filter(page_id=kwargs['pk'], id_state_manual=True)

        # Train the classifier
        for glyph in training_glyphs:
            # Load a gamera image
            image_url = os.path.join(MEDIA_ROOT, glyph.image_file.path)
            gamera_image = load_image(image_url).to_onebit()
            # print gamera_image
            classifier.classify_glyph_manual(gamera_image, glyph.short_code)

        # Classify the mystery glyphs
        for glyph in all_glyphs.filter(page_id=kwargs['pk'], id_state_manual=False):
            image_url = os.path.join(MEDIA_ROOT, glyph.image_file.path)
            gamera_image = load_image(image_url).to_onebit()
            # Try to automatically classify
            result, confidence = classifier.guess_glyph_automatic(gamera_image)
            glyph.short_code = result[0][1]
            glyph.confidence = result[0][0]
            glyph.save()

        # Did it work?
        return Response(data={"success": "Glyphs classified."},
                        status=200)


class GameraKNNSegmentationView(generics.GenericAPIView):

    def get(self, request, *args, **kwargs):
        # Get the page
        page = Page.objects.get(id=kwargs['pk'])
        number_of_iterations = int(kwargs['iter'])
        glyph_set = Glyph.objects.filter(page=page)
        last = glyph_set.count() - 1

        for i in range(number_of_iterations):
            index = random.randint(0, last)
            glyph = glyph_set[index]
            glyph.short_code = i
            glyph.id_state_manual = True
            glyph.confidence = 0
            glyph.save()

        # Did it work?
        return Response(data={"success": "{0} glyphs randomly classified.".format(number_of_iterations)},
                        status=200)


class GameraResetAllView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        reset_glyph_classifications(kwargs['pk'])
        # Did it work?
        return Response(data={"success": "Glyphs reset."},
                        status=200)
