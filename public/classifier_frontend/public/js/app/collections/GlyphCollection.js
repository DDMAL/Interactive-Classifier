import Backbone from "backbone";
import Glyph from "models/Glyph";

export default Backbone.Collection.extend({
    model: Glyph,

    comparator: function(glyph)
    {
        return - glyph.get("confidence");
    }
});