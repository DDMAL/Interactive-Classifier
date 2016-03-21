import Backbone from "backbone";

export default Backbone.Model.extend({

    defaults: {
        title: "",
        innerView: undefined,
        isCloseable: false
    },

    open: function()
    {
        this.trigger("open");
    },

    close: function()
    {
        this.trigger("close");
    }
});