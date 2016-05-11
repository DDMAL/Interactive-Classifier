import _ from "underscore";
import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import GlyphEditViewModel from "views/GlyphEdit/GlyphEditViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableViewModel from "views/GlyphTable/GlyphTableViewModel";
import ImagePreviewView from "views/ImagePreview/ImagePreviewView";
import ImagePreviewViewModel from "views/ImagePreview/ImagePreviewViewModel";
import template from "./dashboard.template.html";
import RadioChannels from "../../radio/RadioChannels";

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
                width: this.model.get("width"),
                height: this.model.get("height")
            })
        });
        // Create the preview
        this.pagePreviewRegion.show(previewView);

        // // Construct the glyph table data structure
        var tableRowCollection = new GlyphTableRowCollection();

        // Glyph Editing Events
        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit,
            function(model)
            {
                previewView.highlightGlyph(model);
                that.openGlyphEdit(model);
            });
        this.listenTo(RadioChannels.edit, GlyphEvents.moveGlyph,
            function(glyph,oldShortCode, newShortCode)
            {
                tableRowCollection.moveGlyph(glyph, oldShortCode, newShortCode);
            }
        );

        // Show the tree
        var ctvm = new ClassTreeViewModel();
        ctvm.url = this.model.getClassesUrl();
        this.glyphTreeRegion.show(new ClassTreeView({model: ctvm}));
        // Poll the class tree
        ctvm.fetch();

        // Show the glyph table
        var glyphTable = new GlyphTableView({
            collection: tableRowCollection,
            // Let the collection know what the sprite sheet will be
            model: new GlyphTableViewModel({
                spriteSheetUrl: this.model.get("binary_image")
            })
        });
        this.glyphTableRegion.show(glyphTable);

        _.each(this.model.get("glyph_classes"), function(value)
        {
            var glyphs = new GlyphCollection();
            glyphs.url = "/page/" + that.model.get("id") + "/glyphs/?short_code=" + value;
            console.log(glyphs.url);

            var row = new GlyphTableRowViewModel({
                short_code: value,
                glyphs: glyphs
            });

            // Fetch the glyphs, then add to the table when successful.
            glyphs.fetch({
                success: function ()
                {
                    tableRowCollection.add(row);
                }
            });
        });
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
