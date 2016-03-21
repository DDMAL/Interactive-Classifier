import Marionette from "marionette";
import App from "App";
import Name from "models/Name";
import Image from "models/Image";
import ImageCollection from "collections/ImageCollection";
import NameCollection from "collections/NameCollection";
import NameCollectionView from "views/GlyphList/NameCollectionView";
import ImageCollectionView from "views/GlyphList/ImageCollectionView";
import template from "./glyph.template.html";

export default Marionette.LayoutView.extend({
    template,
    tagName: "tr",

    regions: {
        names: ".glyph-name-list",
        images: ".glyph-image-list"
    },

    events: {
        "click .edit-button": "goToEdit"
    },

    goToEdit: function(event)
    {
        event.preventDefault();
        App.appRouter.routeToPage(this.model.get("url"));
    },

    onShow: function()
    {
        var nameCollection = this.model.getCollection("name_set", NameCollection, Name);
        var imageCollection;
        try
        {
            imageCollection = this.model.getCollection("image_set", ImageCollection, Image);
        }
        catch (ReferenceError)
        {
            // Just make a blank collection
            imageCollection = new ImageCollection();
        }
        this.names.show(new NameCollectionView({
            collection: nameCollection
        }));
        this.images.show(new ImageCollectionView({
            collection: imageCollection
        }));
    }
});