import Marionette from "marionette";
import PageListItemView from "views/PageList/PageListItemView";


export default Marionette.CollectionView.extend({
    childView: PageListItemView,

    tagName: 'div class="row"'
});