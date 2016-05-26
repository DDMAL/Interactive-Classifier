import _ from "underscore";
import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import classNameArrayToRecursiveTree from "./classNameArrayToRecursiveTree";
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
        this.listenTo(RadioChannels.edit, GlyphEvents.setGlyphName, function (newClassName)
        {
            // Add the model to the class_names
            var oldClassNameList = that.model.get("class_names");
            var newClassNameList = _.union(oldClassNameList, [newClassName]);

            if (newClassNameList.length !== oldClassNameList.length)
            {
                console.log("New name!");
                // Set the new list
                that.model.set("class_names", newClassNameList.sort());
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
        var classNames = this.model.get("class_names");
        var mod = new RecursiveUnorderedListViewModel();
        classNameArrayToRecursiveTree(classNames, mod);
        this.classTreeRegion.show(new RecursiveUnorderedListView({model: mod}));
    }
});