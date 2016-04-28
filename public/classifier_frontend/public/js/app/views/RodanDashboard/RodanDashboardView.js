import _ from "underscore";
import Marionette from "marionette";
import Radio from "backbone.radio";
import GlyphEvents from "events/GlyphEvents";

import GlyphCollection from "collections/GlyphCollection";

import ClassTreeView from "views/ClassTree/ClassTreeView";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";

import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import GlyphEditViewModel from "views/GlyphEdit/GlyphEditViewModel";

import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphTableRowViewModel from "../GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableViewModel from "../GlyphTable/GlyphTableViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";

import ImagePreviewView from "../ImagePreview/ImagePreviewView";
import ImagePreviewViewModel from "../ImagePreview/ImagePreviewViewModel";
import template from "./rodan-dashboard.template.html";


export default Marionette.LayoutView.extend({
    template,

    regions: {
        classCreateRegion: ".glyph-class-create-region",
        glyphTreeRegion: ".glyph-class-tree-region",
        glyphTableRegion: ".glyph-table-region",
        glyphEditRegion: ".glyph-edit-region",
        pagePreviewRegion: ".page-image-preview-region",
        modalTestRegion: ".modal-test"
    },

    onShow: function()
    {
        // Create the preview window
        var previewView = new ImagePreviewView({
            model: new ImagePreviewViewModel({
                backgroundImage: this.model.get("binary_image"),
                width: 500,
                height: 500
                // width: this.model.get("width"),
                // height: this.model.get("height")
            })
        });
        // Create the preview
        this.pagePreviewRegion.show(previewView);

        // // // Construct the glyph table data structure
        var tableRowCollection = new GlyphTableRowCollection();

        // Glyph Editing Events
        var that = this;
        this.editChannel = Radio.channel("edit");
        this.listenTo(this.editChannel, GlyphEvents.openGlyphEdit,
            function(model)
            {
                previewView.highlightGlyph(model);
                that.openGlyphEdit(model);
            });
        this.listenTo(this.editChannel, GlyphEvents.moveGlyph,
            function(glyph,oldShortCode, newShortCode)
            {
                tableRowCollection.moveGlyph(glyph, oldShortCode, newShortCode);
            }
        );

        var shortCodes = _.uniq(this.collection.pluck("short_code")).sort();
        // Show the tree
        var ctvm = new ClassTreeViewModel({
            short_codes: shortCodes
        });
        this.glyphTreeRegion.show(new ClassTreeView({model: ctvm}));

        var glyphCollections = {};
        // Separate the glyphs by their class
        for (var i = 0; i < shortCodes.length; i++)
        {
            glyphCollections[shortCodes[i]] = new GlyphCollection();
        }

        // Add the glyphs to the glyph collections
        _.each(this.collection.toArray(), function(element)
        {
            var shortCode = element.get("short_code");
            var json = element.toJSON();
            var c = glyphCollections[shortCode];
            glyphCollections[shortCode].add(json);
        });

        console.log(glyphCollections);

        // Show the glyph table
        var glyphTable = new GlyphTableView({
            collection: tableRowCollection,
            // Let the collection know what the sprite sheet will be
            model: new GlyphTableViewModel({
                spriteSheetUrl: this.model.get("binary_image")
            })
        });
        this.glyphTableRegion.show(glyphTable);

        _.each(shortCodes, function(shortCode)
        {
            var row = new GlyphTableRowViewModel({
                short_code: shortCode,
                glyphs: glyphCollections[shortCode]
            });

            tableRowCollection.add(row);
        });
    },

    onDestroy: function()
    {
        console.log("onDestroy");
        this.editChannel.stopListening();
        delete this.editChannel;
    },

    openGlyphEdit: function(model)
    {
        console.log("Open glyphedit!", model);
        this.glyphEditRegion.show(new GlyphEditView({
            model: new GlyphEditViewModel({
                model: model
            })
        }));
    }
});