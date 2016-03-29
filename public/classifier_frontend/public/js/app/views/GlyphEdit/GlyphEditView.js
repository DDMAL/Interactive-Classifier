import Marionette from "marionette";
import template from "./glyph-edit.template.html";


export default Marionette.ItemView.extend({
    template,

    ui: {
        classInput: 'input[title="glyph-class"]',
        manualConfirmButton: '.manual-confirm-button'
    },

    events: {
        "submit": "onSubmitForm",
        "click @ui.manualConfirmButton": "onClickConfirmButton"
    },

    modelEvents: {
        "change": "render"
    },

    onSubmitForm: function(event)
    {
        event.preventDefault();
        console.log("submitForm", this.ui.classInput.val());
        this.model.set("short_code", this.ui.classInput.val());
    },

    onClickConfirmButton: function(event)
    {
        event.preventDefault();
        this.model.manualConfirm();
    }

});