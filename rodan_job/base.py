from aetypes import Enum
import gamera.core
import gamera.gamera_xml
import gamera.classify
import gamera.knn
from gamera.core import load_image
from rodan.jobs.base import RodanTask
from rodan.jobs.interactive_classifier.intermediary.gamera_xml import GameraXML


class ClassifierStateEnum(Enum):
    IMPORT_XML = 1
    CORRECTION = 2
    EXPORT_XML = 3


class InteractiveClassifier(RodanTask):
    #############
    # Description
    #############

    name = "gamera.custom.interactive_classification"
    author = "Andrew Fogarty"
    description = "A GUI for Gamera interactive kNN classification."
    settings = {
        "classifier_state": ClassifierStateEnum.IMPORT_XML,
        "glyphs": []
    }
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
        }
    ]

    ##################
    # Required Methods
    ##################

    def my_error_information(self, exc, traceback):
        pass

    def get_my_interface(self, inputs, settings):
        # We need to figure out the best way to include the data in the template
        data = {}
        return "interfaces/interactive_classifier.html", data

    def run_my_task(self, inputs, settings, outputs):
        # Initialize a gamera classifier

        if settings["classifier_state"] == ClassifierStateEnum.IMPORT_XML:
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




        else:
            # Encode a new GameraXML file and export it
            result_path = outputs['Corrected Classifier'][0]['resource_path']

    def validate_my_user_input(self, inputs, settings, user_input):
        pass
