import Backbone from "backbone";
import GlobalVars from "config/GlobalVars";

export default Backbone.Model.extend({

    urlRoot: GlobalVars.SITE_URL + "glyphs/",

    defaults: {
        //id: 0,
        short_code: "",
        comments: ""
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
