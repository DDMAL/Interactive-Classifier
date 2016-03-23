import Backbone from "backbone";
import Glyph from "models/Glyph";

export default Backbone.Collection.extend({
    model: Glyph,

    //initialize: function(options)
    //{
    //    this.url = String(options.url);
    //},

    comparator: "short_code"
});