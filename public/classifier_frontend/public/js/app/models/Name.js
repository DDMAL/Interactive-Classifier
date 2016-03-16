import Backbone from "backbone";
import GlobalVars from "config/GlobalVars";
import getAbsoluteGlyphUrl from "utils/getAbsoluteGlyphUrl";

export default Backbone.Model.extend({

    url: GlobalVars.SITE_URL + "names/",

    defaults: {
        id: undefined,
        string: ""
    },

    initialize: function(options)
    {
        if (options !== undefined && options.url !== undefined)
        {
            this.url = String(options.url);
        }
    },

    /**
     * Set the Name's glyph based on the ID int.
     *
     * @param id
     */
    setGlyph: function(id)
    {
        this.set("glyph", getAbsoluteGlyphUrl(id));
    },

    /**
     * Set the model url to its url attribute.
     */
    transferUrl: function()
    {
        this.url = this.get("url");
    }
});
