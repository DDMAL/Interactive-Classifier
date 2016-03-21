import Marionette from "marionette";
import template from "./edit-single-image.template.html";

export default Marionette.ItemView.extend({
    template,
    tagName: "div",

    modelEvents: {
        "change": "render"
    },

    events: {
        "click button[name='delete']": "destroyModel"
    },

    serializeData: function()
    {
        var json = this.model.toJSON();
        json.image_file = this.model.getAbsoluteImageFile();
        json.cantus_url = this.model.getCantusUrl();
        // json.thumbnail = this.model.getAbsoluteThumbnail();
        console.log(json);
        return json;
    },

    destroyModel: function()
    {
        event.preventDefault();
        this.model.destroy();
    }
});