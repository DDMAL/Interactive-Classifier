import Backbone from "backbone";
import GlyphClass from "models/GlyphClass"

export default Backbone.Collection.extend({
    model: GlyphClass,

    comparator: "shortcode"
});