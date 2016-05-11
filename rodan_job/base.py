import json
import os
from shutil import copyfile
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


class ClassifierStateEnum:
    IMPORT_XML = 0
    CORRECTION = 1
    EXPORT_XML = 2


def media_file_path_to_public_url(media_file_path):
    chars_to_remove = len(MEDIA_ROOT)
    return os.path.join(MEDIA_URL, media_file_path[chars_to_remove:])


def get_manual_glyphs(glyphs):
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


def output_training_data(cknn, output_path):
    """
    Save the training data to disk so that it can be used again in a future
    classification project.

    The output is a GameraXML file that contains only the manually
    classified glyphs which are used as training data.
    """
    # Save the training database
    cknn.to_xml_filename(output_path)


def output_corrected_data(cknn, glyphs, output_path):
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


def run_output_stage(cknn, glyphs, outputs):
    """
    The job is complete, so save the results to disk.
    """
    print("Running output stage!")
    output_training_classifier_path = outputs['Training Classifier'][0]['resource_path']
    output_classified_data_path = outputs['Classified Data'][0]['resource_path']
    # Save the outputs to disk
    output_training_data(cknn, output_training_classifier_path)
    output_corrected_data(cknn, glyphs, output_classified_data_path)
    print("Complete!")


def prepare_classifier(training_database, glyphs, features_file_path):
    """
    Given a training database and a list of glyph dicts, train the classifier
    """
    # Prepare the training glyphs
    training_glyphs = get_manual_glyphs(glyphs)
    # The database is a mixture of the original database plus all
    # our manual corrections that we've done in the GUI.
    database = training_database + training_glyphs
    # Train the classifier
    classifier = gamera.knn.kNNInteractive(database=database,
                                           perform_splits=True,
                                           num_k=1)
    # Load features document if applicable
    if features_file_path:
        classifier.load_settings(features_file_path)
    return classifier


def run_correction_stage(settings, training_database, features_file_path):
    """
    Run the automatic correction stage of the Rodan job.
    """
    # Train a classifier
    cknn = prepare_classifier(training_database,
                                   settings["glyphs"],
                                   features_file_path)
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


def run_import_stage(settings, classifier_path):
    """
    Extract glyphs from the GameraXML file at the classifier_path and save them
    to the settings dictionary.
    """
    # Extract the glyphs from the Gamera XML file
    settings["glyphs"] = GameraXML(classifier_path).get_glyphs()


def serialize_glyphs_to_json(settings):
    """
    Serialize the glyphs as JSON and save them in the settings.
    """
    settings["glyphs_json"] = json.dumps(settings["glyphs"])


def purge_serialized_json(settings):
    """
    Remove the cached JSON from the settings
    """
    settings["glyphs_json"] = None


def update_changed_glyphs(settings):
    """
    Update the glyph objects that have been changed since the last round of classification
    """
    # Build a hash of the changed glyphs by their id
    changed_glyph_hash = {g["id"]: g for g in settings["@changed_glyphs"]}
    # Loop through all glyphs.  Update if changed.
    for glyph in settings["glyphs"]:
        if not changed_glyph_hash:
            # No more changed glyphs, so break
            break
        else:
            # There are still glyphs to update
            key = glyph["id"]
            # Grab the changed glyph
            if key in changed_glyph_hash:
                changed_glyph = changed_glyph_hash[key]
                # Update the Glyph proper
                glyph["id_state_manual"] = changed_glyph["id_state_manual"]
                glyph["short_code"] = changed_glyph["short_code"]
                glyph["confidence"] = changed_glyph["confidence"]
                # Pop the changed glyph from the hash
                changed_glyph_hash.pop(key, None)
    # Clear out the @changed_glyphs from the settings...
    settings["@changed_glyphs"] = []


class GameraXMLDistributor(RodanTask):
    name = "GameraXML Distributor"
    author = "Andrew Fogarty"
    description = "Distribute a GameraXML file."
    settings = {}
    enabled = True
    category = "Resource Distributor"
    interactive = False
    input_port_types = [
        {
            "name": "GameraXML File",
            "resource_types": ["application/gamera+xml"],
            "minimum": 1,
            "maximum": 1,
            "is_list": False
        }
    ]
    output_port_types = [
        {
            "name": "GameraXML File",
            "resource_types": ["application/gamera+xml"],
            "minimum": 1,
            "maximum": 1,
            "is_list": False
        }
    ]

    def run_my_task(self, inputs, settings, outputs):
        copyfile(inputs['GameraXML File'][0]['resource_path'],
                 outputs['GameraXML File'][0]['resource_path'])
        return True


class InteractiveClassifier(RodanTask):
    #############
    # Description
    #############

    name = "Interactive Classifier"
    author = "Andrew Fogarty"
    description = "A GUI for Gamera interactive kNN classification."
    settings = {}
    enabled = True
    category = "Gamera - Classification"
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
            "glyphs": settings["glyphs_json"],
            "binary_image_path": media_file_path_to_public_url(
                staffless_image_path)
        }
        return "interfaces/interactive_classifier.html", data

    def run_my_task(self, inputs, settings, outputs):
        # Initialize a gamera classifier
        classifier_path = inputs['Classifier'][0]['resource_path']
        if "Feature Selection" in inputs:
            features = inputs['Feature Selection'][0]['resource_path']
        else:
            features = None
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
            run_import_stage(settings, classifier_path)
            settings["@state"] = ClassifierStateEnum.CORRECTION
            serialize_glyphs_to_json(settings)
            return self.WAITING_FOR_INPUT()
        elif settings["@state"] == ClassifierStateEnum.CORRECTION:
            # Update any changed glyphs
            update_changed_glyphs(settings)
            run_correction_stage(settings, training_database, features)
            serialize_glyphs_to_json(settings)
            return self.WAITING_FOR_INPUT()
        else:
            # Update changed glyphs
            update_changed_glyphs(settings)
            # Do one final classification before quitting
            cknn = run_correction_stage(settings, training_database, features)
            # No more corrections are required.  We can now output the data
            run_output_stage(cknn, settings["glyphs"], outputs)
            # Remove the JSON string from the database
            purge_serialized_json(settings)

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
