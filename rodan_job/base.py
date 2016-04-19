from rodan.jobs.base import RodanTask


class InteractiveClassifier(RodanTask):
    #############
    # Description
    #############

    name = "Interactive Classifier"
    author = "Andrew Fogarty"
    description = "A GUI for Gamera interactive kNN classification."
    enabled = True
    category = "?"
    interactive = True
    import_port_types = []
    output_port_types = []

    ##################
    # Required Methods
    ##################

    def my_error_information(self, exc, traceback):
        pass

    def get_my_interface(self, inputs, settings):
        pass

    def run_my_task(self, inputs, settings, outputs):
        pass

    def validate_my_user_input(self, inputs, settings, user_input):
        pass
