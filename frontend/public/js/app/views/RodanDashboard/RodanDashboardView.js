import _ from "underscore";
import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import GlyphMultiEditView from "../GlyphMultiEdit/GlyphMultiEditView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphTableRowViewModel from "../GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableViewModel from "../GlyphTable/GlyphTableViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";
import ImagePreviewView from "../ImagePreview/ImagePreviewView";
import ImagePreviewViewModel from "../ImagePreview/ImagePreviewViewModel";
import RadioChannels from "../../radio/RadioChannels";
import Strings from "localization/Strings";
import template from "./rodan-dashboard.template.html";
import Timer from "../../utils/Timer";

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

    initialize: function ()
    {
        // Create the preview window
        this.previewView = new ImagePreviewView({
            model: new ImagePreviewViewModel({
                backgroundImage: this.model.get("binaryImage"),
                width: 500,
                height: 500
                // width: this.model.get("width"),
                // height: this.model.get("height")
            })
        });

        // Construct the glyph table data structure
        this.tableRowCollection = new GlyphTableRowCollection();

        // Glyph Editing Events
        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit,
            function (model)
            {
                that.previewView.highlightGlyph(model);
                that.openGlyphEdit(model);
            });
        this.listenTo(RadioChannels.edit, GlyphEvents.moveGlyph,
            function (glyph, oldShortCode, newShortCode)
            {
                that.tableRowCollection.moveGlyph(glyph, oldShortCode, newShortCode);
            }
        );
        this.listenTo(RadioChannels.edit, GlyphEvents.dragSelect,
            function (boundingBox, collection)
            {
                that.openMultiGlyphEdit(collection);
            }
        );
    },

    onShow: function ()
    {
        var timer = new Timer("RodanDashboardView onShow");

        // Create the preview
        this.pagePreviewRegion.show(this.previewView);

        timer.tick();

        var glyphDictionary = this.model.get("glyphDictionary");
        var shortCodes = _.keys(glyphDictionary).sort();

        // Show the tree
        this.glyphTreeRegion.show(new ClassTreeView({
            model: new ClassTreeViewModel({
                short_codes: shortCodes
            })
        }));

        timer.tick();

        var glyphCollections = {};
        // Separate the glyphs by their class
        for (var i = 0; i < shortCodes.length; i++)
        {
            glyphCollections[shortCodes[i]] = new GlyphCollection(glyphDictionary[shortCodes[i]]);
        }

        timer.tick("pre-final render");

        var that = this;
        _.each(shortCodes, function (shortCode)
        {
            var row = new GlyphTableRowViewModel({
                short_code: shortCode,
                glyphs: glyphCollections[shortCode]
            });
            that.tableRowCollection.add(row);
        });

        timer.tick();

        this.glyphTableRegion.show(new GlyphTableView({
            collection: this.tableRowCollection,
            // Let the collection know what the sprite sheet will be
            model: new GlyphTableViewModel({
                spriteSheetUrl: this.model.get("binaryImage")
            })
        }));

        timer.tick("final");
    },

    openGlyphEdit: function (model)
    {
        console.log("Open glyphedit!", model);
        this.glyphEditRegion.show(new GlyphEditView({
            model: model
        }));
    },

    openMultiGlyphEdit: function (collection)
    {
        this.glyphEditRegion.show(new GlyphMultiEditView({
            collection: collection
        }));
    },

    serializeData: function ()
    {
        return {
            classesHeader: Strings.classes,
            editGlyphLabel: Strings.editGlyphLabel,
            editGlyphDescription: Strings.editGlyphDescription
        }
    }
});
