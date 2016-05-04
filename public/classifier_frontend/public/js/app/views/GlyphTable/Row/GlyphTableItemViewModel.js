import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        active: false
    },

    isActive: function ()
    {
        return this.get("active") === true;
    },

    activate: function ()
    {
        this.set("active", true);
    },

    deactivate: function ()
    {
        this.set("active", false);
    }
});