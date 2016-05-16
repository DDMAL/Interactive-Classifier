import Marionette from "marionette";
import template from "./single-image.template.html";

export default Marionette.ItemView.extend({
    template,
    tagName: "li",

    serializeData: function ()
    {
        return {
            image_file: this.model.getAbsoluteImageFile()
            // thumbnail: this.model.getAbsoluteThumbnail()
        };
    }
});
