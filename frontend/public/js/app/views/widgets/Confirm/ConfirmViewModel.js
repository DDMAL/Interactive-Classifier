import Backbone from "backbone";

export default Backbone.Model.extend({
    defaults: {
        text: "",
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