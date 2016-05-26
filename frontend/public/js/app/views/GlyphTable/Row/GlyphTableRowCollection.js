import Backbone from "backbone";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphCollection from "collections/GlyphCollection";

export default Backbone.Collection.extend({
    model: GlyphTableRowViewModel,

    comparator: "class_name",

    /**
     * Move a glyph from one table row to another.
     *
     * @param glyph
     * @param oldClassName
     * @param newClassName
     */
    moveGlyph: function (glyph, oldClassName, newClassName)
    {
        var oldRow = this.findWhere({
            class_name: oldClassName
        });
        oldRow.get("glyphs").remove(glyph);

        // Remove the old row if it's empty
        if (oldRow.get("glyphs").length < 1)
        {
            this.remove(oldRow);
        }

        // Add to the new class name collection
        var newRow = this.findWhere({
            class_name: newClassName
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
                class_name: newClassName,
                glyphs: new GlyphCollection([glyph])
            });
        }
    }
});