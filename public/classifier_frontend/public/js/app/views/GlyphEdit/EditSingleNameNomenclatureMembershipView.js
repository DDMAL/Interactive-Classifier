import Marionette from "marionette";
import template from "./edit-single-name-nomenclature-membership.template.html";

export default Marionette.ItemView.extend({
    template,
    tagName: "tr",

    ui: {
        'deleteButton': 'button[name="delete"]'
    },

    events: {
        "click @ui.deleteButton": "destroyModel"
    },

    destroyModel: function()
    {
        this.model.destroy();
    }
});