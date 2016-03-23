import Marionette from "marionette";
import _ from "underscore";
import template from "./class-tree.template.html";

export default Marionette.ItemView.extend({
    template,

    collectionEvents: {
        "add": "render"
    },

    serializeData: function() {
        return {
            "short_codes": _.uniq(this.collection.pluck("short_code"))
        }
    }
});