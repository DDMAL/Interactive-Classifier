import Marionette from "marionette";
import template from "./table-row.template.html";
import GlyphTableItemView from "views/GlyphTable/Row/GlyphTableItemView";


export default Marionette.LayoutView.extend({
    template,
    tagName: "tr",

    regions: {
        "elementsRegion": ".elements"
    },

    onShow: function ()
    {
        this.elementsRegion.show(new Marionette.CollectionView({
            childView: GlyphTableItemView,
            collection: this.model.get("glyphs")
        }))
    }
})