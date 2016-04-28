import json
import os
from aetypes import Enum
import gamera.core
import gamera.gamera_xml
import gamera.classify
import gamera.knn
from rodan.jobs.base import RodanTask
from rodan.jobs.interactive_classifier.intermediary.gamera_xml import GameraXML, \
    gamera_xml_to_gamera_image_list
from rodan.jobs.interactive_classifier.intermediary.run_length_image import \
    RunLengthImage
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
            "name": "Training Classifier",
            "resource_types": ["application/gamera+xml"],
            "minimum": 0,
            "maximum": 1,
            "is_list": False
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
            "name": "Training Classifier",
            "resource_types": ["application/gamera+xml"],
            "minimum": 1,
            "maximum": 1,
            "is_list": False
        },
        {
            "name": "Classified Data",
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
        staffless_image_path = inputs['Staffless Image'][0]['resource_path']
        # We need to figure out the best way to include the data in the template
        data = {
            "glyphs": json.dumps(settings["glyphs"]),
            "binary_image_path": media_file_path_to_public_url(
                staffless_image_path)
        }
        return "interfaces/interactive_classifier.html", data

    def run_my_task(self, inputs, settings, outputs):
        # Initialize a gamera classifier
        classifier_path = inputs['Classifier'][0]['resource_path']
        # Handle importing the optional training classifier
        if "Training Classifier" in inputs:
            training_database = gamera_xml_to_gamera_image_list(
                inputs['Training Classifier'][0]['resource_path'])
        else:
            training_database = []
        # Set the initial state
        if "@state" not in settings:
            settings["@state"] = ClassifierStateEnum.IMPORT_XML
            settings["glyphs"] = []
        if settings["@state"] == ClassifierStateEnum.IMPORT_XML:
            self.run_import_stage(settings,
                                  classifier_path)
            settings["@state"] = ClassifierStateEnum.CORRECTION
            return self.WAITING_FOR_INPUT()
        elif settings["@state"] == ClassifierStateEnum.CORRECTION:
            # Update any changed glyphs
            self.update_changed_glyphs(settings)
            self.run_correction_stage(settings, training_database)
            return self.WAITING_FOR_INPUT()
        else:
            # Update changed glyphs
            self.update_changed_glyphs(settings)
            # Do one final classification before quitting
            cknn = self.run_correction_stage(settings, training_database)
            # No more corrections are required.  We can now output the data
            self.run_output_stage(cknn, settings["glyphs"], outputs)

    def run_import_stage(self, settings, classifier_path):
        # Extract the glyphs from the Gamera XML file
        settings["glyphs"] = GameraXML(classifier_path).get_glyphs()

    def update_changed_glyphs(self, settings):
        """
        Update the glyph objects that have been changed since the last round of classification
        """
        # We will prepare for another round of classification
        # TODO: Do this in a more efficient way
        for changed_glyph in settings["@changed_glyphs"]:
            glyph = next(
                x for x in settings["glyphs"] if x["id"] == changed_glyph["id"])
            glyph["id_state_manual"] = changed_glyph["id_state_manual"]
            glyph["short_code"] = changed_glyph["short_code"]

    def run_correction_stage(self, settings, training_database):
        """
        Run the automatic correction stage of the Rodan job.
        """
        features = [
            "aspect_ratio",
            "diagonal_projection",
            "fourier_broken",
            "moments",
            "nholes",
            "nholes_extended",
            "skeleton_features",
            "top_bottom",
            "volume16regions",
            "volume64regions",
            "volume",
            "zernike_moments",
        ]
        # Train a classifier
        cknn = self.prepare_classifier(training_database,
                                       settings["glyphs"],
                                       features)
        # The automatic classifications
        for glyph in settings["glyphs"]:
            if not glyph["id_state_manual"]:
                # It's a glyph to be classified
                gamera_glyph = RunLengthImage(
                    glyph["ulx"],
                    glyph["uly"],
                    glyph["ncols"],
                    glyph["nrows"],
                    glyph["image"]
                ).get_gamera_image()
                # Classify it!
                cknn.classify_glyph_automatic(gamera_glyph)
                # Save the classification back into memory
                result, confidence = cknn.guess_glyph_automatic(gamera_glyph)
                glyph["short_code"] = result[0][1]
        return cknn

    def get_manual_glyphs(self, glyphs):
        """
        From the glyph list, extract the Gamera ImageList of manual glyphs.
        """
        # Prepare the training glyphs
        training_glyphs = []
        for glyph in glyphs:
            if glyph["id_state_manual"] == True:
                # Get the gamera image
                gamera_image = RunLengthImage(
                    glyph["ulx"],
                    glyph["uly"],
                    glyph["ncols"],
                    glyph["nrows"],
                    glyph["image"]
                ).get_gamera_image()
                # It's a training glyph!
                gamera_image.classify_manual(glyph["short_code"])
                training_glyphs.append(gamera_image)
        return training_glyphs

    def prepare_classifier(self, training_database, glyphs, features):
        """
        Given a training database and a list of glyph dicts, train the classifier
        """
        # Prepare the training glyphs
        training_glyphs = self.get_manual_glyphs(glyphs)
        # The database is a mixture of the original database plus all
        # our manual corrections that we've done in the GUI.
        database = training_database + training_glyphs
        # Train the classifier
        return gamera.knn.kNNInteractive(database=database,
                                         features=features,
                                         perform_splits=True,
                                         num_k=1)

    def run_output_stage(self, cknn, glyphs, outputs):
        """
        The job is complete, so save the results to disk.
        """
        print("Running output stage!")
        output_training_classifier_path = outputs['Training Classifier'][0]['resource_path']
        output_classified_data_path = outputs['Classified Data'][0]['resource_path']
        # Save the outputs to disk
        self.output_training_data(cknn, output_training_classifier_path)
        self.output_corrected_data(cknn, glyphs, output_classified_data_path)
        print("Complete!")

    def output_training_data(self, cknn, output_path):
        """
        Save the training data to disk so that it can be used again in a future
        classification project.

        The output is a GameraXML file that contains only the manually
        classified glyphs which are used as training data.
        """
        # Save the training database
        cknn.to_xml_filename(output_path)

    def output_corrected_data(self, cknn, glyphs, output_path):
        """
        Output the corrected data to disk.  This includes both the manually
        corrected and the automatically corrected glyphs.
        """
        output_images = []
        for glyph in glyphs:
            gamera_image = RunLengthImage(
                glyph["ulx"],
                glyph["uly"],
                glyph["ncols"],
                glyph["nrows"],
                glyph["image"]
            ).get_gamera_image()
            if glyph["id_state_manual"]:
                gamera_image.classify_manual(glyph["short_code"])
            else:
                cknn.classify_glyph_automatic(gamera_image)
            output_images.append(gamera_image)
            # Dump all the glyphs to disk
        cknn.generate_features_on_glyphs(output_images)
        output_xml = gamera.gamera_xml.WriteXMLFile(glyphs=output_images,
                                                    with_features=True)
        output_xml.write_filename(output_path)

    def validate_my_user_input(self, inputs, settings, user_input):
        if 'complete' in user_input:
            # We are complete.  Advance to the final stage
            return {
                "@state": ClassifierStateEnum.EXPORT_XML,
                "@changed_glyphs": user_input["glyphs"]
            }
        else:
            # We are not complete.  Run another correction stage
            return {
                "@changed_glyphs": user_input["glyphs"]
            }