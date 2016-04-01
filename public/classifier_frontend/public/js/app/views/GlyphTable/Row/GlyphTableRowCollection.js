import Backbone from "backbone";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphCollection from "collections/GlyphCollection";


export default Backbone.Collection.extend({
    model: GlyphTableRowViewModel,
    comparator: "short_code",

    /**
     * Move a glyph from one table row to another.
     *
     * @param glyph
     * @param oldShortCode
     * @param newShortCode
     */
    moveGlyph: function (glyph, oldShortCode, newShortCode)
    {
        var oldRow = this.findWhere({
            short_code: oldShortCode
        });
        oldRow.get("glyphs").remove(glyph);

        // Remove the old row if it's empty
        if (oldRow.get("glyphs").length < 1)
        {
            this.remove(oldRow);
        }

        // Add to the new shortcode collection
        var newRow = this.findWhere({
            short_code: newShortCode
        });

        if (newRow)
        {
            // There is already a row, so we add to it
            newRow.get("glyphs").add(glyph);
        }
        else
        {
            // There is no row, so we add a new row
            this.add({
                short_code: newShortCode,
                glyphs: new GlyphCollection([glyph])
            });
        }
    }    
});