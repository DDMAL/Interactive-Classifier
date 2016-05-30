import Marionette from "marionette";
import GlyphMultiEditThumbnailList from "./GlyphMultiEditThumbnailList";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import Strings from "localization/Strings";
import template from "views/GlyphMultiEdit/glyph-multi-edit.template.html";

/**
 * This is the view that allows the user to set the class name of multiple Glyph models at the same time.
 */
export default Marionette.LayoutView.extend({
    template,

    regions: {
        thumbnailListRegion: ".thumbnail-list"
    },

    ui: {
        classInput: 'input[title="glyph-class"]'
    },

    events: {
        "submit": "onSubmitForm"
    },

    /**
     * Set up an event listener so that when the user clicks on a class name in the ClassTreeView, this view
     * automatically populates its form with that class name and submits the form.
     */
    initialize: function ()
    {
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
     * We also show a list of thumbnails of all the glyphs currently selected.
     */
    onShow: function ()
    {
        this.thumbnailListRegion.show(new GlyphMultiEditThumbnailList({
            collection: this.collection
        }));
    },

    /**
     * When we submit the form, we take the class name from the form and set all of the glyphs to that class name.
     *
     * @param event
     */
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

    /**
     * Include some localized strings.
     *
     * @returns {{}}
     */
    serializeData: function ()
    {
        let output = {};
        output.gui = Strings.glyphMultiEdit;
        return output;
    }
});