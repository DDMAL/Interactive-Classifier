import uuid
from lxml import etree
# from classifier.helpers.run_length_image import RunLengthImage


class GameraXML:
    root = None
    symbols = None
    glyphs = None

    def __init__(self, gamera_file_path):
        # Open the file as an etree
        self.root = etree.parse(open(gamera_file_path, 'r')).getroot()
        # self.symbols = self.root[0]
        self.glyphs = self.root[0]
    #
    # def get_class_names(self):
    #     output = []
    #     for symbol in self.symbols:
    #         output.append(symbol.get("name"))
    #     return output

    def get_glyphs(self):
        """
        Get the run_length images and their names.

        :return: List of {name:name, image:image} dicts.
        """
        output = []
        for glyph in self.glyphs:
            width = int(glyph.get("ncols"))
            height = int(glyph.get("nrows"))
            ulx = int(glyph.get("ulx"))
            uly = int(glyph.get("uly"))
            print(ulx, uly)
            name = glyph.find("ids").find("id").get("name")
            run_length_data = glyph.find("data").text.replace('\n', '')
            id_state = glyph.find("ids").get("state")
            confidence = float(glyph.find("ids").find("id").get("confidence"))
            output.append(
                {
                    "id": uuid.uuid4().hex,
                    "short_code": name,
                    # "image": RunLengthImage(ulx, uly, width, height,
                    #                         run_length_data),
                    "image": run_length_data,
                    "ncols": width,
                    "nrows": height,
                    "ulx": ulx,
                    "uly": uly,
                    "id_state_manual": (id_state == "MANUAL"),
                    "confidence": confidence
                }
            )
        return output
