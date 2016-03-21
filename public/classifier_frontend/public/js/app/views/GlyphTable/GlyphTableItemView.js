import Marionette from "marionette";
import template from "./table-item.template.html";

export default Marionette.ItemView.extend({
    template,

    tagName: 'div class="col-xs-3 col-md-1"'
});