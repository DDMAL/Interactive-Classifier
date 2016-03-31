import Marionette from "marionette";
import template from "./main-menu-sub-link.template.html";


export default Marionette.ItemView.extend({
    template,

    tagName: "li"
});