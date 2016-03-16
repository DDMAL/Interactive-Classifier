import Backbone from "backbone";
import GlobalVars from "config/GlobalVars";

export default Backbone.Model.extend({
    urlRoot: GlobalVars.SITE_URL + "nomenclature/",

    defaults: {
        id: undefined,
        nomenclature_name: ""
    },

    initialize: function(options)
    {
        this.url = String(options.url);
    }
});
