import os
import copy
import json
import gamera.classify
import gamera.core
import gamera.gamera_xml
import gamera.knn
import image_utilities
from celery import uuid
from gamera.plugins.image_utilities import union_images
import gamera.plugins.segmentation
from gamera.gamera_xml import glyphs_from_xml
from gamera.gamera_xml import LoadXML
from rodan.jobs.base import RodanTask
from rodan.jobs.interactive_classifier.intermediary.gamera_glyph import GameraGlyph
from rodan.jobs.interactive_classifier.intermediary.gamera_xml import GameraXML
from rodan.jobs.interactive_classifier.intermediary.run_length_image import \
    RunLengthImage
from rodan.settings import MEDIA_URL, MEDIA_ROOT
from django.http import HttpResponse

class ClassifierStateEnum:
    IMPORT_XML = 0
    CLASSIFYING = 1
    EXPORT_XML = 2
    GROUP_AND_CLASSIFY = 3
    GROUP = 4


def media_file_path_to_public_url(media_file_path):
    chars_to_remove = len(MEDIA_ROOT)
    return os.path.join(MEDIA_URL, media_file_path[chars_to_remove:])

def convert_to_gamera_image(glyph):
    return RunLengthImage(
        glyph['ulx'],
        glyph['uly'],
        glyph['ncols'],
        glyph['nrows'],
        glyph['image']
    ).get_gamera_image()


def get_manual_glyphs(glyphs):
    """
    From the glyph list, extract the Gamera ImageList of manual glyphs.
    """
    # Prepare the training glyphs
    training_glyphs = []
    for glyph in glyphs:
        if glyph['id_state_manual']:
            # Get the gamera image
            gamera_image = convert_to_gamera_image(glyph)
            # It's a training glyph!
            gamera_image.classify_manual(glyph['class_name'])
            training_glyphs.append(gamera_image)
    return training_glyphs


def output_corrected_glyphs(cknn, glyphs, output_path):
    """
    Output the corrected data to disk.  This includes both the manually
    corrected and the automatically corrected glyphs.
    """
    output_images = []
    for glyph in glyphs:
        gamera_image = RunLengthImage(
            glyph['ulx'],
            glyph['uly'],
            glyph['ncols'],
            glyph['nrows'],
            glyph['image']
        ).get_gamera_image()
        if glyph['id_state_manual']:
            gamera_image.classify_manual(glyph['class_name'])
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
    if 'GameraXML - Training Data' in outputs:
        output_training_classifier_path = outputs['GameraXML - Training Data'][0][
            'resource_path']
        # Save the training data to disk
        cknn.to_xml_filename(output_training_classifier_path)
    output_classified_data_path = outputs['GameraXML - Classified Glyphs'][0][
        'resource_path']
    # Save the rest of the glyphs
    output_corrected_glyphs(cknn, glyphs, output_classified_data_path)


def prepare_classifier(training_database, glyphs, features_file_path):
    """
    Given a training database and a list of glyph dicts, train the classifier
    """
    # Prepare the training glyphs
    database = get_manual_glyphs(glyphs)

    # The database is a mixture of the original database plus all
    # our manual corrections that we've done in the GUI.
    for g in training_database:
        glyph = convert_to_gamera_image(g)

        if g['id_state_manual']:
            glyph.classify_manual(g['class_name'])
        else:
            glyph.classify_automatic(g['class_name'])
        database.append(glyph)

    # Train the classifier
    classifier = gamera.knn.kNNInteractive(database=database,
                                           perform_splits=True,
                                           num_k=1)
    # Load features document if applicable
    if features_file_path:
        classifier.load_settings(features_file_path)
    return classifier

def group_and_correct(glyphs, user_options, training_database, features_file_path):
    """
    Run the automatic correction stage of the Rodan job.
    """
    # Train a classifier
    cknn = prepare_classifier(training_database,
                              glyphs,
                              features_file_path)
    # The automatic classifications
    manual =[]
    gamera_glyphs = []

    for glyph in glyphs:
        if not glyph['id_state_manual']:
            # It's a glyph to be classified
            gamera_glyph = RunLengthImage(
                glyph['ulx'],
                glyph['uly'],
                glyph['ncols'],
                glyph['nrows'],
                glyph['image']
            ).get_gamera_image()
            
            gamera_glyphs.append(gamera_glyph)            
        else:
            manual.append(glyph)

    distance = int(user_options['distance'])
    parts = int(user_options['parts'])
    graph = int(user_options['graph'])
    criterion = user_options['criterion']    
    if(user_options['func'] == "Shaped"):
        func = gamera.classify.ShapedGroupingFunction(distance)
    else:
        func = gamera.classify.BoundingBoxGroupingFunction(distance)


    # Group and reclassify
    add, remove = cknn.group_list_automatic(gamera_glyphs, grouping_function=func,
                                                        max_parts_per_group=parts,
                                                        max_graph_size=graph,
                                                        criterion = criterion)

    # Taking out the manual glyphs so that the indices of the two lists will match
    for g in manual:
        glyphs.remove(g)

    # Removing
    for elem in remove:
        index = gamera_glyphs.index(elem)
        gamera_glyphs.remove(elem)
        glyphs.remove(glyphs[index])

    # Reassigning values after classification
    for i in range(len(gamera_glyphs)):
        glyphs[i]['class_name'] = gamera_glyphs[i].get_main_id()
        glyphs[i]['confidence'] = gamera_glyphs[i].get_confidence()

    # Adding new glyphs
    for elem in add:
        new_glyph = GameraGlyph(
            class_name = elem.get_main_id(),
            rle_image = elem.to_rle(),
            ncols = elem.ncols,
            nrows = elem.nrows,
            ulx = elem.ul.x,
            uly = elem.ul.y,
            id_state_manual = False,
            confidence = elem.get_confidence()).to_dict()

        glyphs.append(new_glyph)
    
    # Put the manual glyphs back
    for g in manual:
        glyphs.append(g)

    return cknn

def run_correction_stage(glyphs, training_database, features_file_path):
    """
    Run the automatic correction stage of the Rodan job.
    """
    # Train a classifier
    cknn = prepare_classifier(training_database,
                              glyphs,
                              features_file_path)
    # The automatic classifications
    for glyph in glyphs:
        if not glyph['id_state_manual']:
            # It's a glyph to be classified
            gamera_glyph = RunLengthImage(
                glyph['ulx'],
                glyph['uly'],
                glyph['ncols'],
                glyph['nrows'],
                glyph['image']
            ).get_gamera_image()
            # Classify it!

            cknn.classify_glyph_automatic(gamera_glyph)
            # Save the classification back into memory
            result, confidence = cknn.guess_glyph_automatic(gamera_glyph)
            glyph['class_name'] = result[0][1]
            if confidence:
                glyph['confidence'] = confidence[0]
            else:
                glyph['confidence'] = 0
    return cknn



def serialize_glyphs_to_json(glyphs):
    """
    Serialize the glyphs as a JSON dict grouped by short code
    """
    output = {}
    for glyph in glyphs:
        class_name = glyph['class_name']
        if class_name not in output:
            output[class_name] = []
        output[class_name].append(glyph)
    # Sort the glyphs by confidence
    for class_name in output.keys():
        output[class_name] = sorted(output[class_name],
                                    key=lambda g: g["confidence"])
    return json.dumps(output)


def serialize_class_names_to_json(glyphs, training_database):
    """
    Get JSON representing the list of all class names in the classifier.
    """
    name_set = set()
    database = glyphs + training_database
    # Add the glyph short codes
    for image in database:
        name_set.add(image['class_name'])
    return json.dumps(sorted(list(name_set)))


def serialize_data(settings):
    """
    Serialize the short codes and glyphs to JSON and store them in settings.
    """

    # Make sure the manual glyphs get put in the same view as training glyphs
    manual = []
    for glyph in settings['glyphs']:
        if glyph['id_state_manual']:
            manual.append(glyph)

    settings['class_names_json'] = serialize_class_names_to_json(
        settings['glyphs'], settings['training_glyphs'])
    settings['glyphs_json'] = serialize_glyphs_to_json(settings['glyphs'])
    settings['training_json'] = serialize_glyphs_to_json(settings['training_glyphs'] + manual)


# We don't want to reclassify glyphs that are a part of a group or split
def filter_parts(settings):
    parts = []
    temp = copy.copy(settings['glyphs'])
    for glyph in settings['glyphs']:
        name = glyph['class_name']
        if name.startswith("_split") or name.startswith("_group"):
            parts.append(glyph)
            temp.remove(glyph)
    settings['glyphs'] = temp
    # Remove from the training glyphs as well
    temp2 = copy.copy(settings['training_glyphs'])
    for glyph in settings['training_glyphs']:
        name = glyph['class_name']
        if name.startswith("_split") or name.startswith("_group"):
            temp2.remove(glyph)
    settings['training_glyphs'] = temp2
    return parts


def add_grouped_glyphs(settings):

    grouped_glyphs = settings['@grouped_glyphs']

    for glyph in grouped_glyphs:
        new_glyph = GameraGlyph(
        gid = glyph["id"],
        class_name = glyph['class_name'],
        rle_image = glyph['rle_image'],
        ncols = glyph['ncols'],
        nrows = glyph['nrows'],
        ulx = glyph['ulx'],
        uly = glyph['uly'],
        id_state_manual = glyph['id_state_manual'],
        confidence = glyph['confidence']
        ).to_dict()

        settings['glyphs'].append(new_glyph)

    settings['@grouped_glyphs'] = []

def update_changed_glyphs(settings):
    """
    Update the glyph objects that have been changed since the last round of classification
    """
    # Build a hash of the changed glyphs by their id
    changed_glyph_hash = {g['id']: g for g in settings['@changed_glyphs']}
    changed_training_hash = {g['id']: g for g in settings['@changed_training_glyphs']}
    # Loop through all glyphs.  Update if changed.
    for glyph in settings['glyphs']:
        if not changed_glyph_hash:
            # No more changed glyphs, so break
            break
        else:
            # There are still glyphs to update
            key = glyph['id']
            # Grab the changed glyph
            if key in changed_glyph_hash:
                changed_glyph = changed_glyph_hash[key]
                # Update the Glyph proper
                glyph['class_name'] = changed_glyph['class_name']
                glyph['id_state_manual'] = changed_glyph['id_state_manual']
                glyph['confidence'] = changed_glyph['confidence']
                # Pop the changed glyph from the hash
                changed_glyph_hash.pop(key, None)

    # We do the same for the changed training glyphs
    for glyph in settings['training_glyphs']:
        
        if not changed_training_hash:
            # No more changed glyphs, so break
            break
        else:
            # There are still glyphs to update
            key = glyph['id']
            # Grab the changed glyph
            if key in changed_training_hash:
                changed_glyph = changed_training_hash[key]
                # Update the Glyph proper
                glyph['class_name'] = changed_glyph['class_name']
                glyph['id_state_manual'] = changed_glyph['id_state_manual']
                glyph['confidence'] = changed_glyph['confidence']
                # Pop the changed glyph from the hash
                changed_training_hash.pop(key, None)

    # Clear out the @changed_glyphs from the settings...
    settings['@changed_glyphs'] = []
    settings['@changed_training_glyphs'] = []


class InteractiveClassifier(RodanTask):
    #############
    # Description
    #############

    name = 'Interactive Classifier'
    author = 'Andrew Fogarty'
    description = 'A GUI for Gamera interactive kNN classification.'
    settings = {}
    enabled = True
    category = 'Gamera - Classification'
    interactive = True
    input_port_types = [
        {
            'name': '1-Bit PNG - Preview Image',
            'resource_types': ['image/onebit+png'],
            'minimum': 1,
            'maximum': 1,
            'is_list': False
        },
        {
            'name': 'GameraXML - Training Data',
            'resource_types': ['application/gamera+xml'],
            'minimum': 0,
            'maximum': 1,
            'is_list': False
        },
        {
            'name': 'GameraXML - Connected Components',
            'resource_types': ['application/gamera+xml'],
            'minimum': 1,
            'maximum': 1,
            'is_list': False
        },
        {
            'name': 'GameraXML - Feature Selection',
            'resource_types': ['application/gamera+xml'],
            'minimum': 0,
            'maximum': 1,
            'is_list': False
        }
    ]
    output_port_types = [
        {
            'name': 'GameraXML - Training Data',
            'resource_types': ['application/gamera+xml'],
            'minimum': 0,
            'maximum': 1,
            'is_list': False
        },
        {
            'name': 'GameraXML - Classified Glyphs',
            'resource_types': ['application/gamera+xml'],
            'minimum': 1,
            'maximum': 1,
            'is_list': False
        }
    ]


    ##################
    # Required Methods
    ##################

    def my_error_information(self, exc, traceback):
        pass

    def get_my_interface(self, inputs, settings):
        staffless_image_path = inputs['1-Bit PNG - Preview Image'][0][
            'resource_path']
        # We need to figure out the best way to include the data in the template

        data = {
            'glyphs': settings['glyphs_json'],
            'binary_image_path': media_file_path_to_public_url(
                staffless_image_path),
            'class_names': settings['class_names_json'],
            'training_glyphs': settings['training_json']
        }

        return 'interfaces/interactive_classifier.html', data

    def run_my_task(self, inputs, settings, outputs):
        # Initialize a gamera classifier
        classifier_path = inputs['GameraXML - Connected Components'][0][
            'resource_path']
        if 'GameraXML - Feature Selection' in inputs:
            features = inputs['GameraXML - Feature Selection'][0][
                'resource_path']
        else:
            features = None

        # Set the initial state
        if '@state' not in settings:
            settings['@state'] = ClassifierStateEnum.IMPORT_XML
            settings['glyphs'] = []

        # Execute import state, classifying state, or output state
        if settings['@state'] == ClassifierStateEnum.IMPORT_XML:
            # IMPORT_XML Stage

            # Handle importing the optional training classifier
            if 'GameraXML - Training Data' in inputs:
                classifier_glyphs = GameraXML(inputs['GameraXML - Training Data'][0]['resource_path']).get_glyphs()
                # Discard glyphs that were not classified manually
                classifier_glyphs = [c for c in classifier_glyphs if c['id_state_manual'] == True]
                
                for c in classifier_glyphs:
                    c['is_training'] = True
            else:
                classifier_glyphs = []
            
            settings['training_glyphs'] = classifier_glyphs
            settings['glyphs'] = GameraXML(classifier_path).get_glyphs()
            settings['@state'] = ClassifierStateEnum.CLASSIFYING
            serialize_data(settings)
            return self.WAITING_FOR_INPUT()

        if settings['@state'] == ClassifierStateEnum.CLASSIFYING:
            # CLASSIFYING STAGE

            # If training data is imported in the workflow, run the correction
            # on the data.
            if 'GameraXML - Training Data' in inputs:
                run_correction_stage(settings['glyphs'], settings['training_glyphs'], features)

            # Update any changed glyphs
            add_grouped_glyphs(settings)
            update_changed_glyphs(settings)

            # Takes out _group._parts glyphs and split glyphs TODO: save split glyphs for automatic splitting
            filter_parts(settings)
            
            # Automatically classify the glyphs
            run_correction_stage(settings['glyphs'],
                                 settings['training_glyphs'],
                                 features)
            
            # Filter any remaining parts
            filter_parts(settings)

            serialize_data(settings)
            return self.WAITING_FOR_INPUT()

        # Automatic grouping and reclassifying
        elif settings['@state'] == ClassifierStateEnum.GROUP_AND_CLASSIFY:
            # CLASSIFYING STAGE

            # Update any changed glyphs
            add_grouped_glyphs(settings)
            update_changed_glyphs(settings)

            # Takes out _group._parts glyphs
            filter_parts(settings)
            # grouping and reclassifying
            group_and_correct(settings['glyphs'],
                              settings['@user_options'],
                              settings['training_glyphs'],
                              features)
            filter_parts(settings)
            serialize_data(settings)
            return self.WAITING_FOR_INPUT()

        else:
            # EXPORT_XML STAGE

            # Takes out _group._parts glyphs
            filter_parts(settings)

            # Update changed glyphs
            add_grouped_glyphs(settings)
            update_changed_glyphs(settings)
            # Do one final classification before quitting
            cknn = run_correction_stage(settings['glyphs'],
                                        settings['training_glyphs'],
                                        features)

            filter_parts(settings)

            # No more corrections are required.  We can now output the data
            run_output_stage(cknn, settings['glyphs'], outputs)
            # Remove the cached JSON from the settings
            settings['glyphs_json'] = None
            settings['class_names_json'] = None

    # Grouping the glyphs manually
    def manual_group(self, glyphs, settings, class_name):
        gamera_glyphs=[]

        # Finding the glyphs that match the incoming ids
        # TODO: this should be more efficient
        for glyph_c in glyphs:
            glyph={}
            for g in settings['glyphs']:
                if glyph_c['id']==g['id']:
                    glyph = g
            
            # No glyph with this id exists
            # This means its a split glyph
            # A new glyph needs to be created temporarily
            if glyph == {} :
                glyph = GameraGlyph(
                        gid = glyph_c["id"],
                        class_name = glyph_c['class_name'],
                        rle_image = glyph_c['rle_image'],
                        ncols = glyph_c['ncols'],
                        nrows = glyph_c['nrows'],
                        ulx = glyph_c['ulx'],
                        uly = glyph_c['uly'],
                        id_state_manual = glyph_c['id_state_manual'],
                        confidence = glyph_c['confidence']
                        ).to_dict()

            gamera_glyph = RunLengthImage(
            glyph['ulx'],
            glyph['uly'],
            glyph['ncols'],
            glyph['nrows'],
            glyph['image']
            ).get_gamera_image()

            gamera_glyphs.append(gamera_glyph)
        
        # creating the new grouped glyph image
        grouped = image_utilities.union_images(gamera_glyphs)                
        
        # turning the grouped image into a new glyph
        new_glyph = GameraGlyph(
            class_name = class_name,
            rle_image = grouped.to_rle(),
            ncols = grouped.ncols,
            nrows = grouped.nrows,
            ulx = grouped.ul.x,
            uly = grouped.ul.y,
            id_state_manual = True,
            confidence = 1
            ).to_dict()
        
        # turning the new glyph into a dictionary that can be returned
        g = {
            'class_name': class_name,
            'id': new_glyph['id'],
            'image': new_glyph['image_b64'],
            'rle_image': new_glyph['image'], 
            'ncols': new_glyph['ncols'],
            'nrows': new_glyph['nrows'],
            'ulx': new_glyph['ulx'],
            'uly': new_glyph['uly'],
            'id_state_manual': new_glyph['id_state_manual'],
            'confidence': new_glyph['confidence']
            }

        return g
    
    def manual_split(self, glyph_to_split, split_type, settings):
        import segmentation
        # Finding the glyphs that match the incoming ids          
        glyph={}
        for g in settings['glyphs']:
            if(glyph_to_split['id']==g['id']):
                glyph = g

        # No glyph matches the id so the glyph that is being split is also a split glyph
        # A new glyph must be created temporarily so it can be split again
        if glyph == {}:
            glyph = GameraGlyph(
                    gid = glyph_to_split["id"],
                    class_name = glyph_to_split['class_name'],
                    rle_image = glyph_to_split['rle_image'],
                    ncols = glyph_to_split['ncols'],
                    nrows = glyph_to_split['nrows'],
                    ulx = glyph_to_split['ulx'],
                    uly = glyph_to_split['uly'],
                    id_state_manual = glyph_to_split['id_state_manual'],
                    confidence = glyph_to_split['confidence']
                    ).to_dict()
        # Getting the image of the glyph
        gamera_glyph=RunLengthImage(
            glyph['ulx'],
            glyph['uly'],
            glyph['ncols'],
            glyph['nrows'],
            glyph['image'],
            ).get_gamera_image()
        
        # Splitting the glyph into numerous image segments
        splits = getattr(segmentation, split_type).__call__(gamera_glyph)
        
        # Turning the images into a glyph
        glyphs = []
        for split in splits:
            new_glyph = GameraGlyph(
                class_name = "UNCLASSIFIED",
                rle_image = split.to_rle(),
                ncols = split.ncols,
                nrows = split.nrows,
                ulx = split.ul.x,
                uly = split.ul.y,
                id_state_manual = False,
                confidence = 0
                ).to_dict()
            # Transforming the glyph into a dictionary so it can be returned
            g={
                'class_name': "UNCLASSIFIED",
                'id': new_glyph['id'],
                'image': new_glyph['image_b64'],
                'rle_image': new_glyph['image'], 
                'ncols': new_glyph['ncols'],
                'nrows': new_glyph['nrows'],
                'ulx': new_glyph['ulx'],
                'uly': new_glyph['uly'],
                'id_state_manual': new_glyph['id_state_manual'],
                'confidence': new_glyph['confidence']
                }

            glyphs.append(g)

        return glyphs

    def validate_my_user_input(self, inputs, settings, user_input):
        if 'complete' in user_input:
            # We are complete.  Advance to the final stage
            return {
                '@state': ClassifierStateEnum.EXPORT_XML,
                '@changed_glyphs': user_input['glyphs'],
                '@grouped_glyphs': user_input['grouped_glyphs'],
                '@changed_training_glyphs': user_input['changed_training_glyphs']
            }

        # If the user wants to group, group the glyphs and return the new glyph
        elif 'group' in user_input:
            new_glyph = self.manual_group(user_input['glyphs'], settings, user_input['class_name'])

            data = {
            'manual': True,
            'glyph': new_glyph
            }
            return data

        elif 'split' in user_input:
            glyphs = self.manual_split(user_input['glyph'], user_input['split_type'], settings)
            data = {
            'manual': True,
            'glyphs' : glyphs
            }

            return data

        elif "auto_group" in user_input:
            return{
            '@state': ClassifierStateEnum.GROUP_AND_CLASSIFY,
            '@user_options': user_input['user_options'],
            '@changed_glyphs': user_input['glyphs'],
            '@grouped_glyphs': user_input['grouped_glyphs'],
            '@changed_training_glyphs': user_input['changed_training_glyphs']
            }

        else:
            # We are not complete.  Run another correction stage
            changed_glyphs = user_input['glyphs']
            grouped_glyphs = user_input['grouped_glyphs']
            return {
                '@changed_glyphs': changed_glyphs,
                '@grouped_glyphs': grouped_glyphs,
                '@changed_training_glyphs': user_input['changed_training_glyphs']
            }
