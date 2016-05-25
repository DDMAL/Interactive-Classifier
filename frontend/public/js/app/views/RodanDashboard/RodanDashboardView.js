import _ from "underscore";
import Backbone from "backbone";
import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import GlyphMultiEditView from "views/GlyphMultiEdit/GlyphMultiEditView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";
import ImagePreviewView from "views/ImagePreview/ImagePreviewView";
import ImagePreviewViewModel from "views/ImagePreview/ImagePreviewViewModel";
import RadioChannels from "radio/RadioChannels";
import Strings from "localization/Strings";
import Timer from "utils/Timer";
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

    initialize: function ()
    {
        // Create the preview window
        this.previewView = new ImagePreviewView({
            model: new ImagePreviewViewModel({
                backgroundImage: this.model.get("binaryImage")
            })
        });

        // Construct the glyph table data structure
        this.tableRowCollection = new GlyphTableRowCollection();

        // Selected Glyphs
        this.selectedGlyphs = new Backbone.Collection();
        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.selectGlyph,
            function (glyph)
            {
                that.selectedGlyphs.add(glyph);
            }
        );
        this.listenTo(RadioChannels.edit, GlyphEvents.deselectGlyph,
            function (glyph)
            {
                that.selectedGlyphs.remove(glyph);
            }
        );
        this.listenTo(RadioChannels.edit, GlyphEvents.deselectAllGlyphs,
            function ()
            {
                that.selectedGlyphs.reset();
            }
        );

        // Glyph Editing Events
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
            function ()
            {
                that.openMultiGlyphEdit(that.selectedGlyphs);
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
        var shortCodes = this.model.get("shortCodes");

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
            collection: this.tableRowCollection
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
