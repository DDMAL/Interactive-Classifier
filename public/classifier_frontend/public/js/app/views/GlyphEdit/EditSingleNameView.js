import Marionette from "marionette";
import template from "./edit-single-name.template.html";

export default Marionette.ItemView.extend({
    template,
    tagName: "form",

    modelEvents: {
        "change": "render"
    },

    events: {
        "submit": "submitModel",
        "click button[name='delete']": "destroyModel"
    },

    ui: {
        statusDiv: ".status-message"
    },

    submitModel: function(event)
    {
        // Prevent default functionality
        event.preventDefault();
        // Grab values from the form fields
        this.model.set({
            string: String(this.$("input[name='string']").val())
        });
        var that = this;
        this.model.save(null,
            {
                success: function()
                {
                    that.ui.statusDiv.html('<p class="alert alert-success" role="alert">Name saved successfully.</p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                    return that.trigger("submit");
                },
                error: function(model, event)
                {
                    that.ui.statusDiv.html('<p class="alert alert-danger" role="alert">Error saving name. - ' + event.responseText +  '<p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                }
            }
        );
    },

    destroyModel: function()
    {
        event.preventDefault();
        this.model.destroy();
        return this.trigger("destroy");
    }
});