import json
import os
from aetypes import Enum
import gamera.core
import gamera.gamera_xml
import gamera.classify
import gamera.knn
from gamera.core import load_image
from rodan.jobs.base import RodanTask
from rodan.jobs.interactive_classifier.intermediary.gamera_xml import GameraXML
from rodan.settings import MEDIA_URL, MEDIA_ROOT


class ClassifierStateEnum(Enum):
    IMPORT_XML = 0
    CORRECTION = 1
    EXPORT_XML = 2


def media_file_path_to_public_url(media_file_path):
    chars_to_remove = len(MEDIA_ROOT)
    return os.path.join(MEDIA_URL, media_file_path[chars_to_remove:])


class InteractiveClassifier(RodanTask):
    #############
    # Description
    #############

    name = "gamera.custom.interactive_classification"
    author = "Andrew Fogarty"
    description = "A GUI for Gamera interactive kNN classification."
    settings = {}
    enabled = True
    category = "Classifier"
    interactive = True
    input_port_types = [
        {
            'name': 'Staffless Image',
            'resource_types': ['image/onebit+png'],
            'minimum': 1,
            'maximum': 1,
            'is_list': False
        },
        {
            "name": "Classifier",
            "resource_types": ["application/gamera+xml"],
            "minimum": 1,
            "maximum": 1,
            "is_list": False
        },
        {
            'name': 'Feature Selection',
            'resource_types': ['application/gamera+xml'],
            'minimum': 0,
            'maximum': 1,
            "is_list": False
        }
    ]
    output_port_types = [
        {
            "name": "Corrected Classifier",
            "resource_types": ["application/gamera+xml"],
            "minimum": 1,
            "maximum": 1,
            "is_list": False
        },
        {
            "name": "Glyph JSON",
            "resource_types": ["application/json"],
            "minimum": 1,
            "maximum": 1,
            "is_list": False
        }
    ]

    ##################
    # Required Methods
    ##################

    def my_error_information(self, exc, traceback):
        pass

    def get_my_interface(self, inputs, settings):
        staffless_image_path = inputs['Staffless Image'][0]['resource_path']
        classifier_path = inputs['Classifier'][0]['resource_path']
        # We need to figure out the best way to include the data in the template
        data = {}
        data["glyphs"] = json.dumps(GameraXML(classifier_path).get_glyphs())
        data["binary_image_path"] = media_file_path_to_public_url(staffless_image_path)
        return "interfaces/interactive_classifier.html", data

    def run_my_task(self, inputs, settings, outputs):
        # Initialize a gamera classifier
        staffless_image_path = inputs['Staffless Image'][0]['resource_path']
        classifier_path = inputs['Classifier'][0]['resource_path']
        result_path = outputs['Corrected Classifier'][0]['resource_path']
        # glyph_json_path = outputs['Glyph JSON'][0]['resource_path']

        # Set the initial state
        if "state" not in self.settings:
            self.settings["state"] = ClassifierStateEnum.IMPORT_XML

        if self.settings["state"] == ClassifierStateEnum.IMPORT_XML:
            print(settings)
            self.settings["state"] = ClassifierStateEnum.CORRECTION
            return self.WAITING_FOR_INPUT()
        if settings["state"] == ClassifierStateEnum.IMPORT_XML:
            # Convert the GameraXML to an intermediary format
            classifier_path = inputs['Classifier'][0]['resource_path']

            # Extract the glyphs from the Gamera XML file
            self.settings.glyphs = GameraXML(classifier_path).get_glyphs()

            # Switch to "Correction mode" and do a round of manual correction
            settings["classifier_state"] = ClassifierStateEnum.CORRECTION
        elif settings["classifier_state"] == ClassifierStateEnum.CORRECTION:
            # Re-run gamera to re-classify the glyphs taking into account the
            # manual corrections

            cknn = gamera.knn.kNNInteractive(database=[],
                                             features='all',
                                             perform_splits=True,
                                             num_k=1)

            training_glyphs = []
            glyphs_to_classify = []
            # Divide the glyphs into training data and data to classify
            for glyph in self.settings["glyphs"]:
                if glyph["id_state_manual"]:
                    # Manually identified, so we will use it as training data
                    training_glyphs.append(glyph)
                else:
                    # Not manually identified, so we will classify it
                    glyphs_to_classify.append(glyph)

            return self.WAITING_FOR_INPUT()

        #
        #
        #
        else:
            # No more corrections are required.  We can now exit!
            pass


    def validate_my_user_input(self, inputs, settings, user_input):
        if 'complete' in user_input:
            # We are complete.  Advance to the final stage
            self.settings["state"] = ClassifierStateEnum.EXPORT_XML
        else:
            # We will prepare for another round of classification
            pass

