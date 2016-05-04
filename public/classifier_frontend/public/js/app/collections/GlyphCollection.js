import Backbone from "backbone";
import Glyph from "models/Glyph";

export default Backbone.Collection.extend({
    model: Glyph,

    comparator: function(a, b)
    {
        return b.get("confidence") - a.get("confidence");
    }
});