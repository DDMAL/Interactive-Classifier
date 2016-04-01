// import Backbone from "backbone";
import Marionette from "marionette";
import Radio from "backbone.radio";
import GlyphEvents from "events/GlyphEvents";
import template from "./table-glyph.template.html";


export default Marionette.ItemView.extend({
    template,

    events: {
        "click .glyph": "onClickGlyph"
    },

    modelEvents: {
        "change": "render"
    },

    onClickGlyph: function(event)
    {
        event.preventDefault();
        Radio.trigger("edit", GlyphEvents.openGlyphEdit, this.model);
    }
});