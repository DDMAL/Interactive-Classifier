import Marionette from "marionette";
import GlyphTableItemView from "views/GlyphTable/Row/GlyphTableItemView";
import template from "./table-row.template.html";

export default Marionette.LayoutView.extend({
    template,
    tagName: "tr",
    tableViewModel: undefined,

    initialize: function (options)
    {
        // Call the super constructor
        Marionette.ItemView.prototype.initialize.call(this, options);

        this.tableViewModel = options.tableViewModel;
    },

    regions: {
        "elementsRegion": ".elements",
        "classifiedElementsRegion": ".classified-elements"
    },

    onShow: function ()
    {
        // Get the index of this particular row within the table
        var index = this.model.collection.indexOf(this.model);
        // Load each row 3000 miliseconds after the other
        var waitTime = index * 500;

        var that = this;
        setTimeout(function ()
        {
            console.log("Rendering row");
            var view = new Marionette.CollectionView({
                childView: GlyphTableItemView,
                collection: that.model.get("glyphs"),
                reorderOnSort: true
                // sort: false
            });
            view.childViewOptions = function ()
            {
                return {
                    tableViewModel: that.tableViewModel
                }
            };

            that.elementsRegion.show(view);

            // Silently enable sorting 5 seconds later...
            // setTimeout(function()
            // {
            //     console.log("Setting delayed sort on ", index);
            //     console.log(view);
            //     view.mergeOptions({
            //         sort: true
            //     });
            //     view.resortView();
            //     console.log(view);
            //     console.log("Delayed sort on", index, "complete.")
            // }, 5000);
        }, waitTime);
    }
})