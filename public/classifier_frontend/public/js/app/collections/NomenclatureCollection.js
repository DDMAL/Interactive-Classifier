import Backbone from "backbone";
import Nomenclature from "models/Nomenclature";

export default Backbone.Collection.extend({
    model: Nomenclature,

    initialize: function(options)
    {
        this.url = String(options.url);
    },

    comparator: function(name)
    {
        // Newest names first
        return 0 - parseInt(name.get("id"));
    }
});