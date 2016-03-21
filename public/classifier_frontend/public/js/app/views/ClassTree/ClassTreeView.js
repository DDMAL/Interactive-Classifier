import Marionette from "marionette";
import template from "./class-tree.template.html";

export default Marionette.ItemView.extend({
    template,

    collectionEvents: {
        "add": "render"
    }
});