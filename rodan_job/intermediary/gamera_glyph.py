import uuid
import json

from rodan.jobs.interactive_classifier.intermediary.run_length_image import \
    RunLengthImage


class GameraGlyph(object):
    def __init__(self, short_code, rle_image, ncols, nrows, ulx, uly,
                 id_state_manual, confidence):
        self._id = uuid.uuid4().hex
        self._short_code = short_code
        self._image = rle_image
        self._ncols = ncols
        self._nrows = nrows
        self._ulx = ulx
        self._uly = uly
        self._id_state_manual = id_state_manual
        self._confidence = confidence
        # Generate multiple internal image representations
        self._run_length_image = RunLengthImage(ulx=self._ulx,
                                                uly=self._uly,
                                                width=self._ncols,
                                                height=self._nrows,
                                                run_length_data=self._image)
        self._image_b64 = self._run_length_image.get_base64_image()
        self._gamera_image = self._run_length_image.get_gamera_image()
        if self.is_manual_id():
            self._gamera_image.classify_manual(self._short_code)

    def is_manual_id(self):
        return self._id_state_manual is True

    def get_gamera_image(self):
        return self._gamera_image

    def classify_manual(self, short_code):
        self._short_code = str(short_code)
        self._confidence = 1.0
        self.get_gamera_image().classify_manual(self._short_code)
        self._id_state_manual = True

    def is_id(self, id):
        return self._id == id

    def classify_automatic(self, short_code, confidence):
        self._short_code = str(short_code)
        self._confidence = confidence
        self._id_state_manual = False

    def to_dict(self):
        return {
            "id": self._id,
            "short_code": self._short_code,
            "image": self._image,
            "image_b64": self._image_b64,
            "ncols": self._ncols,
            "nrows": self._nrows,
            "ulx": self._ulx,
            "uly": self._uly,
            "id_state_manual": self.is_manual_id(),
            "confidence": self._confidence
        }


def gamera_glyph_list_to_json(glyph_list):
    """
    Serialize a list of gamera glyphs to JSON.
    """
    print "SERIALIZING!"
    glyph_dicts = [g.to_dict() for g in glyph_list]
    output = json.dumps(glyph_dicts)
    print output
    return output
