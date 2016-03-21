import Marionette from "marionette";
import template from "./edit-glyph-properties.template.html";

export default Marionette.ItemView.extend({
    template,

    events: {
        "submit": "saveProperties"
    },

    ui: {
        commentsBox: ".comments-box",
        statusDiv: ".property-status-message"
    },

    saveProperties: function(event)
    {
        console.log("Saving properties");
        // Prevent default functionality
        event.preventDefault();
        var that = this;
        this.model.save(
            {
                comments: String(this.ui.commentsBox.val())
            },
            {
                success: function() {
                    console.log("Success");
                    that.ui.statusDiv.html('<p class="alert alert-success" role="alert">Properties updated successfully.</p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                },
                error: function(model, event) {
                    console.log("Failure.");
                    that.ui.statusDiv.html('<p class="alert alert-danger">Error saving. - ' + event.responseText +  '<p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                }
            }
        );
    }
});