import Marionette from "marionette";
import GlyphTableRowView from "views/GlyphTable/Row/GlyphTableRowView";


export default Marionette.CollectionView.extend({
    tagName: 'table class="table table-hover"',
    childView: GlyphTableRowView,

    childViewOptions: function ()
    {
        return {
            tableViewModel: this.model
        }
    }
});
