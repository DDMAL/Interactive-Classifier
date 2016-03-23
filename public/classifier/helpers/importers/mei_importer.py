from classifier.helpers.importers.abstract_importer import AbstractImporter
from classifier.helpers.mei import MEI, get_st_gallen_390_image_url
from classifier.models.glyph import Glyph


class MeiImporter(AbstractImporter):
    def import_data(self):
        # Build the file
        mei = MEI(self.file_string)
        mei.build_neumes()
        neumes = mei.get_neumes()
        # Create the glyphs
        for neume in neumes:
            if neume.name is None:
                print("NONE ERROR")
                continue
            # Check if the name already exists
            glyph = Glyph(neume.name)
            # Assign the new glyph to the name and save the name
            # name.glyph = glyph
            # name.save()
            # Create the image
    #         self.create_image(glyph, neume)
    #
    # def create_image(self, glyph, neume):
    #     """
    #     Create an image for the particular neume.
    #
    #     :param glyph:
    #     :param neume:
    #     :return:
    #     """
    #     #pil_image = get_image(
    #     #    get_st_gallen_390_image_url(self.file_name, neume.ulx, neume.uly,
    #     #                                neume.get_width(), neume.get_height()))
    #     external_image = get_st_gallen_390_image_url(self.file_name, neume.ulx, neume.uly, neume.get_width(), neume.get_height())
    #     # print external_image
    #     # Create Image model
    #     image = Image()
    #     image.glyph = glyph
    #     #image.set_PIL_image(pil_image)
    #     image.external_image = external_image
    #
    #     image.set_md5()
    #     image.ulx = neume.ulx
    #     image.uly = neume.uly
    #     image.folio_name = self.file_name
    #     image.nrows = neume.get_width()
    #     image.ncols = neume.get_height()
    #     # Make sure not duplicate
    #     if not Image.objects.filter(glyph=glyph, md5sum=image.md5sum):
    #         image.save()


def import_mei_file(file_path):
    file = open(file_path)
    data_string = open(file_path).read()
    importer = MeiImporter(data_string, file.name)
    importer.import_data()
