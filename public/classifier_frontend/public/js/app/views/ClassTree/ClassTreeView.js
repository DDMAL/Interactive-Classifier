import Marionette from "marionette";
import RecursiveUnorderedListView from "views/widgets/RecursiveUnorderedList/RecursiveUnorderedListView";
import RecursiveUnorderedListViewModel from "views/widgets/RecursiveUnorderedList/RecursiveUnorderedListViewModel";
import shortCodeArraytoRecursiveTree from "views/widgets/RecursiveUnorderedList/shortCodeArrayToRecursiveTree";
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