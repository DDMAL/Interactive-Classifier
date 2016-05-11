import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import shortCodeArrayToRecursiveTree from "./shortCodeArrayToRecursiveTree";
import RecursiveUnorderedListView from "./RecursiveUnorderedListView";
import RecursiveUnorderedListViewModel from "./RecursiveUnorderedListViewModel";
import template from "./class-tree.template.html";

export default Marionette.LayoutView.extend({
    template,

    regions: {
        "classTreeRegion": ".class-tree"
    },

    modelEvents: {
        "change": "showSubTree"
    },

    onShow: function()
    {
        this.showSubTree();
    },

    showSubTree: function()
    {
        var shortCodes = this.model.get("short_codes");
        console.log("shortCodes:", shortCodes);
        var mod = new RecursiveUnorderedListViewModel();
        shortCodeArraytoRecursiveTree(shortCodes, mod);
        this.classTreeRegion.show(new RecursiveUnorderedListView({model: mod}));
    }
});