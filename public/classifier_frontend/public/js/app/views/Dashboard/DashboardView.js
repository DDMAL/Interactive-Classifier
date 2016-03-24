import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphCollection from "collections/GlyphCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import GlyphEditView from "views/GlyphEdit/GlyphEditView";
import GlyphEditViewModel from "views/GlyphEdit/GlyphEditViewModel";
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
        // var modalViewModel = new ModalViewModel({
        //     title: "Load GameraXML File",
        //     innerView: test,
        //     isCloseable: true
        // });
        // var modal = new ModalView({model: modalViewModel});
        // this.modalTestRegion.show(modal);

        var glyphCollection = new GlyphCollection();
        glyphCollection.add(this.model.get("glyph_set"));

        // Show the tree
        this.glyphTreeRegion.show(new ClassTreeView({collection: glyphCollection}));
        // Show the glyph table
        var glyphTable = new GlyphTableView({collection: glyphCollection});
        this.glyphTableRegion.show(glyphTable);

        var that = this;
        glyphTable.on(GlyphEvents.openGlyphEdit, function(model)
        {
            console.log("Open glyphedit!", model);
            var modal = new ModalView({
                model: new ModalViewModel({
                    title: "Edit Glyph",
                    isCloseable: true,
                    innerView: new GlyphEditView({model: new GlyphEditViewModel({model: model})})
                })
            });
            that.modalTestRegion.show(modal);
            modal.open();
        });
        // Show the creation view
        //this.classCreateRegion.show(new CreateClassView({collection: classCollection}));

        //modal.open();
    }
});
