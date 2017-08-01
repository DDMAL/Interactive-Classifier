import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import Strings from "localization/Strings";
import template from "./glyph-edit.template.html";

export default Marionette.ItemView.extend(
    /**
     * @lends GlyphEditView.prototype
     */
    {
        template,

        ui: {
            classInput: 'input[title="glyph-class"]',
            manualConfirmButton: '.manual-confirm-button'
        },

        events: {
            "submit": "onSubmitForm",
            "click .split" : "split"
        },

        modelEvents: {
            "change": "render"
        },

        /**
         * @class GlyphEditView
         *
         * This view is created when a user clicks on an individual glyph.  This view allows the user to set the class name of
         * that glyph.
         *
         * @constructs
         */
        initialize: function ()
        {
            // Set up an event listener.  When a user clicks on a class name in the
            // ClassTreeView, this view form becomes populated with that name and
            // the form is submitted.
            var that = this;
            this.listenTo(RadioChannels.edit, GlyphEvents.clickGlyphName,
                function (className)
                {
                    that.ui.classInput.val(className);
                    that.onSubmitForm();
                }
            );
        },

        /**
         * We "focus" on the input element so that the user can immediately type without having to click on the form
         * element.
         */
        onShow: function ()
        {
            // Automatically focus on the glyph class input
            this.ui.classInput.focus();
        },

        /**
         * When the user submits the form, we change the class of the glyph model.
         *
         * @param event
         */
        onSubmitForm: function (event)
        {
            if (event)
            {
                event.preventDefault();
            }

            this.model.changeClass(this.ui.classInput.val());            

        },

        /**
         * When the user clicks here, the glyph will be split according to the option selected.
         *
         * @param event
         */
        split: function (event)
        {
            if (event)
            {
                event.preventDefault();
            }
            var selection = document.getElementById("split_option");
            var val = "";
            switch(selection.value)
            {
                case "Split x":
                    val = "splitx";
                    break;
                case "Split x left":
                    val = "splitx_left";
                    break;
                case "Split x right":
                    val = "splitx_right";
                    break;
                case "Split x max":
                    val = "splitx_max";
                    break;
                case "Split y":
                    val = "splity";
                    break;
                case "Split y bottom":
                    val = "splity_bottom";
                    break;
                case "Split y top":
                    val = "splity_top";
                    break;
            }

            this.model.changeClass("_split." + val);
            RadioChannels.edit.trigger(GlyphEvents.splitGlyph, this.model, val);
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
            output.gui = Strings.editGlyph;
            console.log(output.gui);
            return output;
        }
    });