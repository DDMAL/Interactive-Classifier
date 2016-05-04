import Marionette from "marionette";
import template from "views/GlyphMultiEdit/thumbnail.template.html";


export default Marionette.ItemView.extend({
    template,
    tagName: "tr",

    serializeData: function ()
    {
        console.log("TEST: ", this.model);

        return this.model.toJSON();
    }
});