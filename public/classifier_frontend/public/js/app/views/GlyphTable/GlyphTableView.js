import Marionette from "marionette";
import GlyphTableItemView from "views/GlyphTable/GlyphTableItemView";

export default Marionette.CollectionView.extend({
    childView: GlyphTableItemView
});