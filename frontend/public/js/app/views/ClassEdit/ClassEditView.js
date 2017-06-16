import Backbone from "backbone";
import Marionette from "marionette";
import Strings from "localization/Strings";
import ClassEvents from "events/ClassEvents";
import RadioChannels from "radio/RadioChannels";
import template from "./class-edit.template.html";
/**
 * The detailed class view
 */
export default Marionette.ItemView.extend({

    	template,
        // A collection representing the menu links

        ui: {
            classInput: 'input[title="class-name"]',
            manualConfirmButton: '.manual-confirm-button'
        },

        events: {
            "click .delete": "delete",
            "click .update": "update"
        },

        modelEvents: {
            "change": "render"
        },


    /**
         * Include model data and also localized strings for form labels.
         *
         * @returns {*|string}
         */
        serializeData: function ()
        {
            // Get the model fields
            var output = this.model.toJSON();
            // Add strings for the localized GUI.
            output.gui = Strings.editClass;
            console.log(output.gui);
            return output;
        },

        update(event)
        {
            console.log("Updating class name... " + this.ui.classInput.val());
        },

        delete: function(event)
        {
            console.log("Something happened in the class edit view");
            if (event)
            {
                event.preventDefault();
            }

            console.log("hrryry");
            var className = "testclassname";
            RadioChannels.edit.trigger(ClassEvents.deleteClass, className); //DCDC if I make a class, this will go in the class

        }
});
