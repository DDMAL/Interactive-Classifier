import Backbone from "backbone";
import Glyph from "models/Glyph";


export default Backbone.Model.extend({

    defaults: Glyph.defaults,

    initialize: function(options)
    {
        this.model = options.model;
        this.loadModelProperties();
    },

    loadModelProperties: function()
    {
        this.set(this.model.attributes);
    }
});