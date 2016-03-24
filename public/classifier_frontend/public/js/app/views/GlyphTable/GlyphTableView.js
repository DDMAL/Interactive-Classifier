import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphTableItemView from "views/GlyphTable/GlyphTableItemView";


export default Marionette.CollectionView.extend({
    childView: GlyphTableItemView,

    childEvents: {},

    initialize: function()
    {
        this.childEvents[GlyphEvents.clickGlyph] = "onClickChild";
    },

    onClickChild: function(child)
    {
        // We want to open a glyph editor for a particular model
        this.trigger(GlyphEvents.openGlyphEdit, child.model);
    }
});
