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
import ModalViewModel from "views/widgets/Modal/ModalViewModel";
import ModalView from "views/widgets/Modal/ModalView";
import template from "./dashboard.template.html";


export default Marionette.LayoutView.extend({
    template,

    regions: {
        classCreateRegion: ".glyph-class-create-region",
        glyphTreeRegion: ".glyph-class-tree-region",
        glyphTableRegion: ".glyph-table-region",
        modalTestRegion: ".modal-test"
    },

    onShow: function()
    {
        var glyphCollection = new GlyphCollection();
        glyphCollection.add(this.model.get("glyph_set"));

        // Construct the glyph table data structure
        var tableRowCollection = new GlyphTableRowCollection();
        var groupedGlyphs = _.groupBy(glyphCollection.toJSON(), "short_code");
        _.each(groupedGlyphs, function(value, key)
        {
            tableRowCollection.add({
                short_code: key,
                glyphs: new GlyphCollection(value)
            })
        });

        // Show the tree
        this.glyphTreeRegion.show(new ClassTreeView({collection: tableRowCollection}));

        // Show the glyph table
        var glyphTable = new GlyphTableView({collection: tableRowCollection});
        this.glyphTableRegion.show(glyphTable);

        // Glyph Editing Events
        this.editChannel = Radio.channel("edit");
        this.listenTo(this.editChannel, GlyphEvents.openGlyphEdit, this.openGlyphEditModal);
        this.listenTo(this.editChannel, GlyphEvents.moveGlyph,
            function(glyph,oldShortCode, newShortCode)
            {
                tableRowCollection.moveGlyph(glyph, oldShortCode, newShortCode);
            }
        );
    },

    onDestroy: function()
    {
        console.log("onDestroy");
        this.editChannel.stopListening();
        delete this.editChannel;
    },

    openGlyphEditModal: function(model)
    {
        console.log("Open glyphedit!", model);
        var modal = new ModalView({
            model: new ModalViewModel({
                title: "Edit Glyph",
                isCloseable: true,
                innerView: new GlyphEditView({
                    model: new GlyphEditViewModel({
                        model: model
                    })
                })
            })
        });
        this.modalTestRegion.show(modal);
        modal.open();
    }
});
