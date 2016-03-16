import Marionette from "marionette";

import GlyphCollection from "collections/GlyphCollection";

import FetchModal from "views/GlyphList/FetchModal";
import CreateGlyphView from "views/GlyphList/CreateGlyphView";
import UploadMEIView from "views/GlyphList/UploadMEIView";
import GlyphCompositeView from "views/GlyphList/GlyphCompositeView";
import UploadGameraXMLView from "views/GlyphList/UploadGameraXMLView";

import template from "./glyph-dashboard.template.html";

export default Marionette.LayoutView.extend({
    template,

    regions: {
        glyphCreateRegion: ".glyph-create-region",
        glyphListRegion: ".glyph-list-region",
        gameraXMLUploadRegion: ".gamera-xml-upload-region",
        meiUploadRegion: ".mei-upload-region",
        glyphListFetchModalRegion: ".glyph-list-fetch-modal-region"
    },

    onShow: function() {
        var glyphCollection = new GlyphCollection({url: "/classifier/glyphs/"});
        var glyphFetchModal = new FetchModal(
            {
                title: "Fetching neumes...",
                text: "",
                collection: glyphCollection
            }
        );
        this.glyphListFetchModalRegion.show(glyphFetchModal);
        this.glyphCreateRegion.show(new CreateGlyphView({createdCollection: glyphCollection}));
        this.gameraXMLUploadRegion.show(new UploadGameraXMLView({createdCollection: glyphCollection}));
        this.meiUploadRegion.show(new UploadMEIView({createdCollection: glyphCollection}));
        this.glyphListRegion.show(new GlyphCompositeView({collection: glyphCollection}));
        // Open the modal
        glyphCollection.trigger("open-modal");
        // Fetch the glyphs
        glyphCollection.fetch();
    }
});