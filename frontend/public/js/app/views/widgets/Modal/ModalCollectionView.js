import Marionette from "marionette";
import ModalView from "views/widgets/Modal/ModalView";

export default Marionette.CollectionView.extend({
    childView: ModalView
});