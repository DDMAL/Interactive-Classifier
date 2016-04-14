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
     * Get the relative URL of the page.
     * @returns {string}
     */
    getRelativeUrl: function()
    {
        // TODO: This is a temporary solution.  We need a less janky method.
        var fullUrl = this.get("url");
        return fullUrl.substring(21);
    },

    getClassesUrl: function ()
    {
        return this.get("url") + "classes/";
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