import Marionette from "marionette";

export default Marionette.LayoutView.extend({
    el: 'body',

    regions: {
        container: "#content",
        navigation: "#navigation",
        modal: "#root-modal"
    }
});