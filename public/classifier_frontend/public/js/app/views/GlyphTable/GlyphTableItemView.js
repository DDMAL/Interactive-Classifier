import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents"
import template from "./table-item.template.html";


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
        console.log("lowest");
        this.trigger(GlyphEvents.clickGlyph);
    }
});