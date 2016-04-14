import _ from "underscore";
import Marionette from "marionette";
import Radio from "backbone.radio";

import GlyphEvents from "events/GlyphEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import GlyphEditViewModel from "views/GlyphEdit/GlyphEditViewModel";
import GlyphTableRowCollection from "views/GlyphTable/Row/GlyphTableRowCollection";
import ClassTreeViewModel from "views/ClassTree/ClassTreeViewModel";
import template from "./dashboard.template.html";
import GlyphTableRowViewModel from "../GlyphTable/Row/GlyphTableRowViewModel";
import GlyphTableViewModel from "../GlyphTable/GlyphTableViewModel";


export default Marionette.LayoutView.extend({
    template,

    regions: {
        classCreateRegion: ".glyph-class-create-region",
        glyphTreeRegion: ".glyph-class-tree-region",
        glyphTableRegion: ".glyph-table-region",
        glyphEditRegion: ".glyph-edit-region",
        modalTestRegion: ".modal-test"
    },

    onShow: function()
    {
        // // Construct the glyph table data structure
        var tableRowCollection = new GlyphTableRowCollection();

        // Glyph Editing Events
        this.editChannel = Radio.channel("edit");
        this.listenTo(this.editChannel, GlyphEvents.openGlyphEdit, this.openGlyphEdit);
        this.listenTo(this.editChannel, GlyphEvents.moveGlyph,
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
        // setInterval(function ()
        // {
        //     ctvm.fetch();
        // }, 20000);

        // Show the glyph table
        var glyphTable = new GlyphTableView({
            collection: tableRowCollection,
            // Let the collection know what the sprite sheet will be
            model: new GlyphTableViewModel({
                spriteSheetUrl: this.model.get("binary_image")
            })
        });
        this.glyphTableRegion.show(glyphTable);

        var that = this;
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
