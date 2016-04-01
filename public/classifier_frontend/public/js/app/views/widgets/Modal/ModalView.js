import Marionette from "marionette";
import template from "./modal.template.html";

export default Marionette.LayoutView.extend({
    template,

    ui: {
        modal: ".modal"
    },

    regions: {
        modalBody: ".modal-body"
    },

    modelEvents: {
        "open": "open",
        "close": "close"
    },

    onShow: function()
    {
        console.log(this.model.get("innerView"));
        if (this.model.get("innerView"))
        {
            this.showInnerView();
        }
    },

    showInnerView: function()
    {
        console.log("Rendering innerview...");
        this.modalBody.show(this.model.get("innerView"));
    },

    open: function()
    {
        console.log(this);
        console.log(this.ui);
        this.ui.modal.modal(
            {
                backdrop: 'static',
                keyboard: false
            }
        );
    },

    close: function()
    {
        this.ui.modal.modal('hide');
    }
});