import Marionette from "marionette";
import App from "App";
import template from "./file-open.template.html";


export default Marionette.ItemView.extend({
    template,

    tagName: "tr",

    ui: {
        button: ".btn"
    },

    events: {
        "click @ui.button": "onClick"
    },

    onClick: function(event)
    {
        event.preventDefault();
        // Grab the page model's url
        App.appRouter.navigate(this.model.getRelativeUrl(),
            {
                trigger: true
            }
        );
    }
});