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
        var that = this;
        // setTimeout(function ()
        // {
        var view = new Marionette.CollectionView({
            childView: GlyphTableItemView,
            collection: that.model.get("glyphs")
            // sort: false
        });
        view.childViewOptions = function ()
        {
            return {
                tableViewModel: that.tableViewModel
            }
        };

        that.elementsRegion.show(view);
        // }, 2000);
    }
})