import os
import uuid

from PIL import Image

from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer

from classifier.forms.image_upload import ImageUploadForm
from classifier.helpers.importers.gamera_xml_importer import GameraXMLImporter
from classifier.helpers.importers.image_importer import ImageImporter
from classifier.helpers.importers.mei_importer import MeiImporter
from settings import MEDIA_ROOT


class GameraXMLUploadView(APIView):
    parser_classes = (FileUploadParser,)
    renderer_classes = (JSONRenderer,)

    def post(self, request, format=None):
        # Get a string of the file
        file_string = request.FILES['file'].read()
        print file_string
        file_name = request.FILES['file'].name
        # Extract the data
        importer = GameraXMLImporter(file_string, file_name)
        try:
            # Get the page
            page = importer.import_data()
        except Exception:
            return Response(data={"error": "Error parsing GameraXML."},
                            status=500)
        # Save the user as the owner
        page.owner = self.request.user
        page.save()
        # Did it work?
        return Response(data={"success": "GameraXML file parsed successfully."},
                        status=201)


class MEIUploadView(APIView):
    parser_classes = (FileUploadParser,)
    renderer_classes = (JSONRenderer,)

    def post(self, request, format=None):
        # Get a string of the file
        file_string = request.FILES['file'].read()
        file_name = request.FILES['file'].name.split(".mei")[0]
        # Extract the data
        importer = MeiImporter(file_string, file_name)
        try:
            importer.import_data()
        except Exception:
            return Response(data={"error": "Error parsing MEI."},
                            status=500)
        # Did it work?
        return Response(data={"success": "MEI file parsed successfully."},
                        status=201)


class ImageUploadView(APIView):
    parser_classes = (FileUploadParser,)
    renderer_classes = (JSONRenderer,)

    def post(self, request, format=None):
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            print "form valid!"

        # Save the image file to disk
        saved_file_name = "uploads/{0}".format(uuid.uuid4())
        with open(os.path.join(MEDIA_ROOT, saved_file_name), 'wb+') as destination_file:
            for chunk in request.FILES['file'].chunks():
                destination_file.write(chunk)

        # Save a png copy
        png_file_name = "{0}.{1}".format(saved_file_name, "png")
        im = Image.open(os.path.join(MEDIA_ROOT, saved_file_name))
        im.save(os.path.join(MEDIA_ROOT, png_file_name), "PNG")

        # Extract the data
        importer = ImageImporter(None, png_file_name)
        # try:
            # Get the page
        page = importer.import_data()
        # except Exception:
        #     return Response(data={"error": "Error processing image."},
        #                     status=500)
        # Save the user as the owner
        page.owner = self.request.user
        page.save()
        # Did it work?
        return Response(data={"success": "Image imported successfully."},
                        status=201)
