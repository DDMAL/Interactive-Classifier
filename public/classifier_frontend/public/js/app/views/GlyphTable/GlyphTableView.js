import Marionette from "marionette";
// import _ from "underscore";
import GlyphTableRowView from "views/GlyphTable/Row/GlyphTableRowView";
import GlyphEvents from "events/GlyphEvents";


export default Marionette.CollectionView.extend({
    tagName: 'table class="table table-hover"',
    childView: GlyphTableRowView,

    events: {
        "click .glyph": "clickGlyph"
    },

    collectionEvents: {
        "change": "render"
    },

    // initialize: function()
    // {
    //     this.childEvents[GlyphEvents.clickGlyph] = "onClickChild";
    // },

    // serializeData: function()
    // {
    //     return {
    //         "glyphs": _.groupBy(this.collection.toJSON(), "short_code")
    //     };
    // },

    clickGlyph: function(event)
    {
        event.preventDefault();
        // Get the glyph id from the dom element
        var id = parseInt(event.currentTarget.name);
        // Load the correct model
        var glyph = this.collection.get(id);
        // We want to open a glyph editor for a particular model
        this.trigger(GlyphEvents.openGlyphEdit, glyph);
    }
});
