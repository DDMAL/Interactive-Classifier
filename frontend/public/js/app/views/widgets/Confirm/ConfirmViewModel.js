import Backbone from "backbone";

/**
 * The ViewModel for the ConfirmView.  When the user clicks on the button in the ConfirmView, the callback property
 * is called.
 */
export default Backbone.Model.extend({
    defaults: {
        text: "",
        warning: undefined,
        buttonText: "Confirm",
        callback: function ()
        {
            // Empty function
        }
    },

    /**
     * Trigger the callback function.
     */
    triggerCallback: function ()
    {
        this.get("callback")();
    }
});