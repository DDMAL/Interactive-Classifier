import Backbone from "backbone";
import GlobalVars from "config/GlobalVars";

export default Backbone.Model.extend({

    url: GlobalVars.SITE_URL + "images/",

    defaults: {
        image_file: "",
        glyph: 0,
        thumbnail: "",
        ulx: 0,
        uly: 0,
        width: 0,
        height: 0,
        folio_name: ""
    },

    initialize: function(options)
    {
        if (options !== undefined && options.url !== undefined)
        {
            this.url = String(options.url);
        }
    },

    /**
     * Get the absolute url to the image file.
     *
     * @returns {string}
     */
    getAbsoluteImageFile: function()
    {
        var external_image = this.get("external_image");
        if (external_image)
        {
            return this.get("external_image");
        }
        else
        {
            return GlobalVars.STATIC_URL + this.get("image_file");
        }
    },

    getAbsoluteThumbnail: function()
    {
        return GlobalVars.STATIC_URL + this.get("thumbnail");
    },

    getCantusUrl: function()
    {
        var folioName = this.get("folio_name");
        if (!folioName || folioName === null || folioName === "")
        {
            // Handle empty case
            return "";
        }
        else
        {
            // Get the folio code
            var folio = folioName.split("_")[1];
            return ["http://cantus.simssa.ca/manuscript/127/?folio=",
                folio,
                "#z=3&n=5&y=",
                this.get("uly"),
                "&x=",
                this.get("ulx")].join("");
        }
    }
});