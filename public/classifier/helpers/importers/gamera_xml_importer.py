import os
import uuid

from classifier.helpers.gamera_xml import GameraXML
from classifier.helpers.importers.abstract_importer import AbstractImporter
from classifier.models.glyph import Glyph
from classifier.models.page import Page
from settings import MEDIA_ROOT, MEDIA_URL


class GameraXMLImporter(AbstractImporter):

    def import_data(self):
        # Build the file
        page = Page()
        page.name = self.file_name
        page.save()

        # Make the dir for the images
        dir = os.path.join(MEDIA_ROOT, page.uuid.hex)
        os.makedirs(dir)

        for xml_glyph in GameraXML(self.file_string).get_glyphs():
            new_glyph = Glyph()
            new_glyph.short_code = xml_glyph["short_code"]
            new_glyph.page = page
            new_glyph.save()
            # Handle image
            image = xml_glyph["image"].get_image()
            image_name = "{0}.{1}".format(uuid.uuid4().hex, "png")
            # Save the image
            image_path = os.path.join(dir, image_name)
            image_file = open(image_path, 'w')
            image.save(image_file, "PNG")
            # Assign the image to the glyph
            new_glyph.image_file = "{1}/{2}".format(MEDIA_URL, page.uuid.hex, image_name)
            # Assign the image properties
            new_glyph.ulx = xml_glyph["ulx"]
            new_glyph.uly = xml_glyph["uly"]
            new_glyph.ncols = xml_glyph["width"]
            new_glyph.nrows = xml_glyph["height"]
            new_glyph.confidence = xml_glyph["confidence"]
            if xml_glyph["id_state"] == "MANUAL":
                new_glyph.id_state_manual = True
            # Save the final glyph
            new_glyph.save()

def import_gamera_file(file_path):
    """
    Given a path, import the GameraXML file at that location.

    :param file_path:
    :return:
    """
    gamera_file = open(file_path)
    data_string = gamera_file.read()
    file_name = gamera_file.name
    importer = GameraXMLImporter(data_string, file_name)
    importer.import_data()
