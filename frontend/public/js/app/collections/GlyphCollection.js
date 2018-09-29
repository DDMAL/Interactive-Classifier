import Backbone from "backbone";
import Glyph from "models/Glyph";

/**
 * A collection of Glyph models.
 *
 * @class GlyphCollection
 */
export default Backbone.Collection.extend(
    /**
     * @lends GlyphCollection.prototype
     */
    {
        model: Glyph,

        /**
         * In the glyph table, each row shows the manually classified glyphs first.
         *
         * @param glyph
         * @returns {number}
         */
        comparator: function (glyph)
        {
            return -glyph.get("id_state_manual");
        }
    });
