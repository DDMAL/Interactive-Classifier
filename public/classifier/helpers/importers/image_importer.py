import uuid
import os
from classifier.helpers.importers.abstract_importer import AbstractImporter
from classifier.models.glyph import Glyph
from classifier.models.page import Page, paint_thumbnails
from gamera.core import *

from settings import MEDIA_ROOT


class ImageImporter(AbstractImporter):


    def import_data(self):
        # Save a new page
        page = Page()
        page.image = self.file_name
        page.save()

        # Use Gamera to extract connected components from the page
        init_gamera()

        # Binarize the image
        gamera_image = load_image(os.path.join(MEDIA_ROOT, self.file_name))
        page.width = gamera_image.width
        page.height = gamera_image.height
        binarized = gamera_image.to_onebit()

        # Save the binarized page
        file_name, ext = os.path.splitext(self.file_name)
        binarized_image_path = "{0}_bin{1}".format(file_name, ext)
        save_image(binarized, os.path.join(MEDIA_ROOT, binarized_image_path))
        page.binary_image = binarized_image_path

        # Do connected component analysis
        ccs = binarized.cc_analysis()

        # Save the CCs as glyphs
        dir = os.path.join(MEDIA_ROOT, page.uuid.hex)
        os.makedirs(dir)
        for cc in ccs:
            # Save the image
            new_image_path = "{0}/{1}.{2}".format(page.uuid.hex, uuid.uuid4(), "png")
            save_image(cc, os.path.join(MEDIA_ROOT, new_image_path))

            glyph = Glyph()
            glyph.page = page
            glyph.image_file = new_image_path
            glyph.ulx = cc.offset_x
            glyph.uly = cc.offset_y
            glyph.ncols = cc.ncols
            glyph.nrows = cc.nrows
            glyph.short_code = "UNCLASSIFIED"
            glyph.id_state_manual = False
            glyph.save()

        # Generate the page thumbnails
        # paint_thumbnails(page)

        return page
