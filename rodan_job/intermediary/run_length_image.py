import base64
from aetypes import Enum

import cStringIO
from PIL import ImageDraw
from PIL import Image as PILImage
from gamera.core import Image as GameraImage
from gamera.enums import ONEBIT
from gamera.enums import RLE


class BinaryPixelEnum(Enum):
    WHITE = 0
    BLACK = 1


class RunLengthImage():
    ulx = None
    uly = None
    width = None
    height = None
    run_length_data = None
    pixel_matrix = None

    def __init__(self, ulx, uly, width, height, run_length_data):
        self.ulx = ulx
        self.uly = uly
        self.width = width
        self.height = height
        # Turn run-length data into list of ints
        self.run_length_data = map(lambda x: int(x), run_length_data.split())
        # Build an empty pixel matrix
        self.pixel_matrix = [[BinaryPixelEnum.WHITE for x in range(self.height)]
                             for y in range(self.width)]
        # Construct the pixel matrix
        self.build_pixel_matrix()

    def build_pixel_matrix(self):
        """
        Turn the run-length data into a pixel matrix
        """
        current_pixel = 0
        is_black = False
        # Iterate through the run length data
        for length in self.run_length_data:
            for n in range(length):
                # 0 = white, 1 = black
                # colour = 'white'
                # if is_black:
                #     colour = 'black'
                # Paint the pixel to the image
                if is_black:
                    x, y = self.get_location_of_runlength(current_pixel)
                    self.pixel_matrix[x][y] = BinaryPixelEnum.BLACK
                # Increase the current pixel
                current_pixel += 1
            # Switch from black to white or white to black
            is_black = not is_black

    def get_location_of_runlength(self, pixel_number):
        """
        Find the x,y location of the nth pixel of a run-length encoding.

        :param pixel_number: nth pixel, starting at 0 and ending at
         width * height - 1
        :return: (x,y) tuple
        """
        y = pixel_number / self.width
        x = pixel_number % self.width
        return x, y

    def get_pil_image(self):
        """
        Create a PIL image using the cached pixel matrix.
        """
        image = PILImage.new("RGBA", (self.width, self.height), (255,255,255,0))
        draw = ImageDraw.Draw(image)
        for x in range(self.width):
            for y in range(self.height):
                if self.pixel_matrix[x][y] == BinaryPixelEnum.BLACK:
                    draw.point((x,y), fill="black")
        del draw
        return image

    def get_base64_image(self):
        pil_image = self.get_pil_image()
        buffer = cStringIO.StringIO()
        pil_image.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue())

    def get_gamera_image(self):
        image = GameraImage((self.ulx, self.uly), (self.ulx + self.width, self.uly + self.height),
                            ONEBIT,
                            RLE)
        # TODO: everything
        return image

    def __unicode__(self):
        return u"run_length_image[{0}, {1}, {2}, {3}]".format(self.ulx,
                                                              self.uly,
                                                              self.width,
                                                              self.height)
