import Marionette from "marionette";
import App from "App";

import template from "./main-menu-link.template.html";

export default Marionette.ItemView.extend({
    template,

    tagName: "li",

    events: {
        "click a": "goToUrl"
    },

    goToUrl: function(event)
    {
        event.preventDefault();
        App.appRouter.routeToPage(event.target.href);
    }
});
