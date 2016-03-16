import Marionette from "marionette";
import NameView from "views/GlyphList/NameView";

export default Marionette.CollectionView.extend({
    childView: NameView,
    tagName: "ul"
});