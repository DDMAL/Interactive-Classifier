import Marionette from "marionette";
import GlyphMultiEditThumbnail from "views/GlyphMultiEdit/GlyphMultiEditThumbnail";


export default Marionette.CollectionView.extend({
    tagName: 'table class="table"',
    childView: GlyphMultiEditThumbnail
})