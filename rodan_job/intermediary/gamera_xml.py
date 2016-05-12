import uuid

from gamera.gameracore import MANUAL
from gamera.gamera_xml import glyphs_from_xml
from rodan.jobs.interactive_classifier.intermediary.run_length_image import \
    RunLengthImage


def construct_glyph_dict(name, image_run_length, image_b64, width,
                         height, ulx, uly, id_state_manual, confidence):
    """
    Construct a dictionary representing an in-memory Gamera glyph.
    """
    return {
        "id": uuid.uuid4().hex,
        "short_code": name,
        "image": image_run_length,
        "image_b64": image_b64,
        "ncols": width,
        "nrows": height,
        "ulx": ulx,
        "uly": uly,
        "id_state_manual": id_state_manual,
        "confidence": confidence
    }


def gamera_image_to_glyph(image):
    """
    Given a Gamera Image object, construct our internal glyph
    representation.
    """
    name = image.get_main_id()
    confidence = image.get_confidence()
    # Get top left
    ulx = image.ul.x
    uly = image.ul.y
    # Dimensions
    width = image.ncols
    height = image.nrows
    image_rle = image.to_rle()
    image_b64 = RunLengthImage(ulx, uly, width, height,
                               image_rle).get_base64_image()
    id_state_manual = image.classification_state == MANUAL
    return construct_glyph_dict(
        name,
        image_rle,
        image_b64,
        width,
        height,
        ulx,
        uly,
        id_state_manual,
        confidence
    )


class GameraXML:
    gamera_images = None
    symbols = None
    glyphs = None

    def __init__(self, gamera_file_path):
        self.gamera_images = glyphs_from_xml(gamera_file_path)
        # Construct the glyph objects
        self.glyphs = [gamera_image_to_glyph(image) for image in
                       self.gamera_images]

    def get_glyphs(self):
        return self.glyphs
