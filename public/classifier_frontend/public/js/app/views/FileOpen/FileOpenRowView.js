import Marionette from "marionette";
import App from "App";
import RadioChannels from "radio/RadioChannels";
import ModalEvents from "events/ModalEvents";
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
        console.log("clicking A!");
        event.preventDefault();
        // Grab the page model's url
        console.log(App.appRouter);
        console.log(this.model.get("url"));

        // Send out an event to close all of the open modals before starting
        // the page load process
        RadioChannels.modal.trigger(ModalEvents.closeAll);

        App.appRouter.navigate(this.model.getRelativeUrl(),
            {
                trigger: true
            }
        );
    }
});