import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import template from "./glyph-edit.template.html";

export default Marionette.ItemView.extend({
    template,

    ui: {
        classInput: 'input[title="glyph-class"]',
        manualConfirmButton: '.manual-confirm-button'
    },

    events: {
        "submit": "onSubmitForm"
    },

    modelEvents: {
        "change": "render"
    },

    initialize: function()
    {
        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.clickGlyphName,
            function(shortCode)
            {
                that.ui.classInput.val(shortCode);
                that.onSubmitForm();
            }
        );
    },

    onShow: function ()
    {
        // Automatically focus on the glyph class input
        this.ui.classInput.focus();
    },

    onSubmitForm: function(event)
    {
        if (event)
        {
            event.preventDefault();
        }
        this.model.changeClass(this.ui.classInput.val());
    }
});