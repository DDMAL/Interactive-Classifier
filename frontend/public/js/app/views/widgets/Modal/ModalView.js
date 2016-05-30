import Marionette from "marionette";
import template from "./modal.template.html";

/**
 * This view is a single Bootstrap modal.  The modal has an "inner view" which is a view arbitrarily shown within the
 * body of the modal.  So, you can fill the modal with anything that you want.
 *
 * The inner view is a property of the ModalViewModel.
 */
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

    onShow: function ()
    {
        console.log(this.model.get("innerView"));
        if (this.model.get("innerView"))
        {
            this.showInnerView();
        }
    },

    showInnerView: function ()
    {
        console.log("Rendering innerview...");
        this.modalBody.show(this.model.get("innerView"));
    },

    open: function ()
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

    close: function ()
    {
        this.ui.modal.modal('hide');
    }
});