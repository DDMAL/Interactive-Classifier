import uuid
from lxml import etree
from rodan.jobs.interactive_classifier.intermediary.run_length_image import \
    RunLengthImage


class GameraXML:
    root = None
    symbols = None
    glyphs = None

    def __init__(self, gamera_file_path):
        # Open the file as an etree
        self.root = etree.parse(open(gamera_file_path, 'r')).getroot()
        # self.symbols = self.root[0]
        self.glyphs = self.root[0]

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
            try:
                name = glyph.find("ids").find("id").get("name")
            except AttributeError:
                name = "UNCLASSIFIED"
            run_length_data = glyph.find("data").text.replace('\n', '')

            image = RunLengthImage(ulx, uly, width, height, run_length_data)
            image_b64 = image.get_base64_image()

            id_state = glyph.find("ids").get("state")
            try:
                confidence = float(glyph.find("ids").find("id").get("confidence"))
            except AttributeError:
                confidence = 0.0
            output.append(
                {
                    "id": uuid.uuid4().hex,
                    "short_code": name,
                    "image": run_length_data,
                    "image_b64": image_b64,
                    "ncols": width,
                    "nrows": height,
                    "ulx": ulx,
                    "uly": uly,
                    "id_state_manual": (id_state == "MANUAL"),
                    "confidence": confidence
                }
            )
        return output


def gamera_xml_to_gamera_image_list(gamera_file_path):
    """
    Given a path to a gamera XML file, create a Gamera ImageList.
    """
    glyphs = GameraXML(gamera_file_path).get_glyphs()
    output = []
    for glyph in glyphs:
        ulx = glyph["ulx"]
        uly = glyph["uly"]
        width = glyph["ncols"]
        height = glyph["nrows"]
        run_length_data = glyph["image"]
        gamera_image = RunLengthImage(width=width,
                                      height=height,
                                      ulx=ulx,
                                      uly=uly,
                                      run_length_data=run_length_data).get_gamera_image()
        if glyph["id_state_manual"]:
            gamera_image.classify_manual(glyph["short_code"])
        output.append(gamera_image)
    return output
