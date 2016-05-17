import Marionette from "marionette";
import GlyphMultiEditThumbnailList from "./GlyphMultiEditThumbnailList";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import Strings from "localization/Strings";
import template from "views/GlyphMultiEdit/glyph-multi-edit.template.html";

export default Marionette.LayoutView.extend({
    template,

    regions: {
        thumbnailListRegion: ".thumbnail-list"
    },

    ui: {
        classInput: 'input[title="glyph-class"]',
        manualConfirmButton: '.manual-confirm-button'
    },

    events: {
        "submit": "onSubmitForm"
    },

    initialize: function ()
    {
        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.clickGlyphName,
            function (shortCode)
            {
                that.ui.classInput.val(shortCode);
                that.onSubmitForm();
            }
        );
    },

    onShow: function ()
    {
        this.thumbnailListRegion.show(new GlyphMultiEditThumbnailList({
            collection: this.collection
        }));
    },

    onSubmitForm: function (event)
    {
        if (event)
        {
            event.preventDefault();
        }
        var that = this;
        this.collection.each(function (model)
        {
            model.changeClass(that.ui.classInput.val());
        });
    },

    serializeData: function()
    {
        let output = {};
        output.gui = Strings.glyphMultiEdit;
        return output;
    }
});