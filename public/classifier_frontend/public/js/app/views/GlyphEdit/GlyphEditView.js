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

    onShow: function ()
    {
        // Automatically focus on the glyph class input
        this.ui.classInput.focus();
    },

    onSubmitForm: function(event)
    {
        console.log(this.ui.classInput.val());
        event.preventDefault();
        console.log("submitForm", this.ui.classInput.val());
        this.model.set({
            "short_code": this.ui.classInput.val(),
            "id_state_manual": true
        });
    },

    onClickConfirmButton: function(event)
    {
        event.preventDefault();
        this.model.manualConfirm();
    }

});