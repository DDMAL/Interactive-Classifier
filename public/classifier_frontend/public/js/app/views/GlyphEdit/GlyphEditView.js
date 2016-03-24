import Marionette from "marionette";
import template from "./glyph-edit.template.html";


export default Marionette.ItemView.extend({
    template,

    ui: {
        classInput: 'input[title="glyph-class"]'
    },

    events: {
        "submit": "onSubmitForm"
    },

    onSubmitForm: function(event)
    {
        event.preventDefault();
        console.log("submitForm", this.ui.classInput.val());
        this.model.set("short_code", this.ui.classInput.val());
    }

});