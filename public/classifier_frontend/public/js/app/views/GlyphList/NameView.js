import Marionette from "marionette";

import template from "./single-image.template.html";

export default Marionette.ItemView.extend({
    template,
    tagName: "li"
});