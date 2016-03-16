import Backbone from "backbone";
import Name from "models/Name";

export default Backbone.Collection.extend({
    model: Name,

    comparator: function(name)
    {
        // Newest names first
        return 0 - parseInt(name.get("id"));
    }
});