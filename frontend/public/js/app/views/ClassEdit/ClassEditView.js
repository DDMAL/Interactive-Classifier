import Backbone from "backbone";
import Marionette from "marionette";
import Strings from "localization/Strings";
import ClassEvents from "events/ClassEvents";
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
            "submit": "onSubmitForm"
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
        }
});
