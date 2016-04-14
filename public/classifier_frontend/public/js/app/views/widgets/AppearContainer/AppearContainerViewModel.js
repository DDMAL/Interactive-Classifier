import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        isAppeared: false,
        innerView: null
    },

    /**
     *
     *
     * @returns {boolean}
     */
    hasAppeared: function ()
    {
        return this.get("isAppeared") === true;
    },

    /**
     *
     */
    appear: function ()
    {
        this.set("isAppeared", true);
    }
});