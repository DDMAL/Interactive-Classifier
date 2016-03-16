import Marionette from "marionette";
import Name from "models/Name";
import template from "./create-single-name.template.html";

export default Marionette.ItemView.extend({
    template,
    glyphUrl: undefined,
    nameCollection: undefined,

    events: {
        "submit": "onSubmit"
    },

    ui: {
        nameStringField: "input[name='string']",
        statusDiv: ".status-message"
    },

    initialize: function(options)
    {
        // We will use the glyphId to construct the name
        this.glyphUrl = options.glyphUrl;
        // The collection of names we will add to
        this.nameCollection = options.nameCollection;
    },

    onSubmit: function(event)
    {
        // Prevent default functionality
        event.preventDefault();

        // Flip the self reference.
        var that = this;

        // Grab values from the form fields
        var name = new Name({
            glyph: this.glyphUrl,
            string: String(this.ui.nameStringField.val())
        });

        name.save(null,
            {
                success: function() {
                    console.log("name test:", name);
                    // For some reason URL isn't getting copied unless we do it manually
                    name.url = name.get("url");
                    // Add the new name to the collection
                    that.nameCollection.add(name);
                    // Print the success message
                    that.ui.statusDiv.html('<p class="alert alert-success" role="alert">Name saved successfully.</p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                    // Clear the user input
                    that.ui.nameStringField.val("");
                },
                error: function(model, event) {
                    that.ui.statusDiv.html('<p class="alert alert-danger" role="alert">Error saving name. - ' + event.responseText +  '<p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                }
            }
        );
    }
});