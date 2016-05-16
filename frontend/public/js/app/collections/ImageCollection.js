import Backbone from "backbone";
import Image from "models/Image";

export default Backbone.Collection.extend({
    model: Image,

    comparator: function (image)
    {
        // Newest names first
        return 0 - parseInt(image.get("id"));
    }
});