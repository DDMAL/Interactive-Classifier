import Marionette from "marionette";
import ImageView from "views/GlyphList/ImageView";

export default Marionette.CollectionView.extend({
    childView: ImageView,
    tagName: "ul"
});