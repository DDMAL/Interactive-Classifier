import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        id: 0,
        url: "",
        glyph_set: [],
        uuid: "",
        name: ""
    },

    /**
     * Use Gamera to guess all the unclassified glyphs.
     */
    guessAll: function (onSuccess)
    {
       return Backbone.ajax(this.get("url") + "guess/all/",
           {
               method: "GET",
               success: onSuccess
           });
    },

    /**
     * Reset all of the gamera classifications of the machine-classified glyphs.
     *
     * @param onSuccess
     */
    resetAll: function (onSuccess)
    {
        return Backbone.ajax(this.get("url") + "reset/all/",
            {
                method: "GET",
                success: onSuccess
            });
    }
});