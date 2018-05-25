//import Backbone from "backbone";
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
        return output;
    },

    update: function(event)
    {
        if (event)
        {
            event.preventDefault();
        }
        //trigger renameClass event with parameters (old name, new name)
        RadioChannels.edit.trigger(ClassEvents.renameClass, this.model.get("name"), this.ui.classInput.val());
      },

    delete: function(event)
    {
        if (event)
        {
            event.preventDefault();
        }
        RadioChannels.edit.trigger(ClassEvents.deleteClass, this.model.get("name"));

    }
});
