import Backbone from "backbone";
import GlobalVars from "config/GlobalVars";

export default Backbone.Model.extend({
    urlRoot: GlobalVars.SITE_URL + "name-nomenclature-membership/",

    initialize: function(options)
    {
        this.url = String(options.url);
    },

    defaults: {
        id: undefined,
        name: undefined,
        nomenclature: undefined,
        glyph: undefined,
        name_string: undefined,
        nomenclature_string: undefined
    }
});
