import Marionette from "marionette";
import template from "./confirm.template.html";


export default Marionette.ItemView.extend({
    template,

    ui: {
        button: ".btn"
    },

    events: {
        "click @ui.button": "onClickButton"
    },

    onClickButton: function()
    {
        // Trigger the button click callback!
        this.model.triggerCallback();
    }
});