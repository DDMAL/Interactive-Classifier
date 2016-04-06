import Marionette from "marionette";
import _ from "underscore";
import RecursiveUnorderedListView from "views/widgets/RecursiveUnorderedList/RecursiveUnorderedListView";
import RecursiveUnorderedListViewModel from "views/widgets/RecursiveUnorderedList/RecursiveUnorderedListViewModel";
import shortCodeArraytoRecursiveTree from "views/widgets/RecursiveUnorderedList/shortCodeArrayToRecursiveTree";
import template from "./class-tree.template.html";

export default Marionette.LayoutView.extend({
    template,

    regions: {
        "classTreeRegion": ".class-tree"
    },

    collectionEvents: {
        "add": "showSubTree",
        "remove": "showSubTree"
    },

    onShow: function()
    {
        this.showSubTree();
    },

    showSubTree: function()
    {
        var shortCodes = _.uniq(this.collection.pluck("short_code"));
        var mod = new RecursiveUnorderedListViewModel();
        shortCodeArraytoRecursiveTree(shortCodes, mod);
        this.classTreeRegion.show(new RecursiveUnorderedListView({model: mod}));
    }
});