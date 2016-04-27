import Backbone from "backbone";


export default Backbone.Model.extend({

    url: function() {
        return this.get("url");
    },

    defaults: {
        id: 0,
        short_code: "",
        id_state_manual: false,
        confidence: 0.0,
        ulx: 0,
        uly: 0,
        nrows: 0,
        ncols: 0,
        image_file: "",
        image_b64: "",
        context_thumbnail: ""
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
