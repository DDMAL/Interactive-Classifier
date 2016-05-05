import Marionette from "marionette";
import GlyphMultiEditThumbnailList from "./GlyphMultiEditThumbnailList";
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

    onShow: function()
    {
        this.thumbnailListRegion.show(new GlyphMultiEditThumbnailList({
            collection: this.collection
        }));
    },

    onSubmitForm: function(event)
    {
        console.log(this.ui.classInput.val());
        event.preventDefault();
        console.log("submitForm", this.ui.classInput.val());
        var that = this;
        this.collection.each(function(model)
        {
            model.changeClass(that.ui.classInput.val());
        });
    }
});