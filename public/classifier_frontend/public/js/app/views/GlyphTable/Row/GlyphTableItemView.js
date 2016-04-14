// import Backbone from "backbone";
import Marionette from "marionette";
import Radio from "backbone.radio";
import GlyphEvents from "events/GlyphEvents";
import template from "./table-glyph.template.html";


export default Marionette.ItemView.extend({
    template,

    tableViewModel: undefined,

    events: {
        "click .glyph": "onClickGlyph"
    },

    initialize: function (options)
    {
        // Call the super constructor
        Marionette.ItemView.prototype.initialize.call(this, options);

        this.tableViewModel = options.tableViewModel;
    },

    modelEvents: {
        "change": "render"
    },

    onClickGlyph: function(event)
    {
        event.preventDefault();
        Radio.trigger("edit", GlyphEvents.openGlyphEdit, this.model);
    },

    serializeData: function ()
    {
        var data = this.model.toJSON();
        data.spriteSheetUrl = this.tableViewModel.get("spriteSheetUrl");
        return data;
    }
});