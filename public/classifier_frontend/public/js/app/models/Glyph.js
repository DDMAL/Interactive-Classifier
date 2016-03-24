import Backbone from "backbone";
import GlobalVars from "config/GlobalVars";

export default Backbone.Model.extend({

    urlRoot: GlobalVars.SITE_URL + "glyphs/",

    defaults: {
        //id: 0,
        short_code: "",
        id_state_manual: false,
        confidence: 0.0,
        ulx: 0,
        uly: 0,
        nrows: 0,
        ncols: 0,
        image_file: ""
    },

    /**
     * Get a collection containing the Glyph's names.
     *
     * @param attributeName
     * @param CollectionType
     * @returns {*}
     */
    getCollection: function(attributeName, CollectionType)
    {
        var collectionAttributes = this.get(String(attributeName));
        var collection = new CollectionType();
        collection.add(collectionAttributes);
        return collection;
    }
});
