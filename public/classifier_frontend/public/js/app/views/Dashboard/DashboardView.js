import Marionette from "marionette";
import Glyph from "models/Glyph";
import GlyphCollection from "collections/GlyphCollection";
import GlyphClassCollection from "collections/GlyphClassCollection";
import ClassTreeView from "views/ClassTree/ClassTreeView";
import GlyphTableView from "views/GlyphTable/GlyphTableView";
import CreateClassView from "views/ClassTree/CreateClassView";
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
        //var classCollection = new GlyphClassCollection();
        //
        //classCollection.add({
        //    shortcode: "Test!"
        //});

        var glyphCollection = new GlyphCollection();
        glyphCollection.add(this.model.get("glyph_set"));

        // Show the tree
        this.glyphTreeRegion.show(new ClassTreeView({collection: glyphCollection}));
        // Show the glyph table
        this.glyphTableRegion.show(new GlyphTableView({collection: glyphCollection}));
        // Show the creation view
        this.classCreateRegion.show(new CreateClassView({collection: classCollection}));


        var test = new ClassTreeView({collection: classCollection});
        var modalViewModel = new ModalViewModel({
            title: "Load GameraXML File",
            innerView: test,
            isCloseable: true
        });
        console.log(modalViewModel);
        var modal = new ModalView({model: modalViewModel});
        this.modalTestRegion.show(modal);
        //modal.open();
    }
});
