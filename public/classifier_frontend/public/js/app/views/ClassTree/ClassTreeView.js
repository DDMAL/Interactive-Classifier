import _ from "underscore";
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

    initialize: function ()
    {
        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.setGlyphName, function (newShortCode)
        {
            console.log("Set name to ", newShortCode);
            // Add the model to the short_codes
            var oldShortCodeList = that.model.get("short_codes");
            var newShortCodeList = _.union(oldShortCodeList, [newShortCode]);

            if (newShortCodeList.length !== oldShortCodeList.length)
            {
                console.log("New name!");
                // Set the new list
                that.model.set("short_codes", newShortCodeList.sort());
                // Re-render the view
                that.showSubTree();
            }
        });
    },

    onShow: function ()
    {
        this.showSubTree();
    },

    showSubTree: function ()
    {
        var shortCodes = this.model.get("short_codes");
        console.log("shortCodes:", shortCodes);
        var mod = new RecursiveUnorderedListViewModel();
        shortCodeArrayToRecursiveTree(shortCodes, mod);
        this.classTreeRegion.show(new RecursiveUnorderedListView({model: mod}));
    }
});