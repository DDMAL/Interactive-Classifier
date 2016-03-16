import Marionette from "marionette";

import Glyph from "models/Glyph";

import template from "./create-glyph.template.html";

export default Marionette.ItemView.extend({
    template,
    /**
     * The collection that the new glyph will be added to.
     */
    createdCollection: undefined,
    tagName: 'form class="form" action="#"',

    ui: {
        "shortCodeField": "#glyph-short-code-field",
        "statusDiv": ".status-message"
    },

    events: {
        "submit": "createGlyphButtonCallback"
    },

    initialize: function(options)
    {
        // Assign the collection which contains the created glyphs
        this.createdCollection = options.createdCollection;
    },

    createGlyphButtonCallback: function(event)
    {
        // Prevent the event from redirecting the page
        event.preventDefault();
        // Flip the reference
        var newGlyph = new Glyph({
            "short_code": this.ui.shortCodeField.val()
        });
        var that = this;
        newGlyph.save(undefined,
            {
                success: function() {
                    that.ui.statusDiv.html('<p class="alert alert-success" role="alert">Glyph "<a href="' + newGlyph.get("url") + '">' + newGlyph.get("short_code") + '</a>" saved successfully.</p>');
                    // Add the created glyph to the createdCollection
                    that.createdCollection.add(newGlyph);
                    // Empty the short code field
                    that.ui.shortCodeField.val('');
                },
                error: function(model, event) {
                    that.ui.statusDiv.html('<p class="alert alert-danger" role="alert">Error saving glyph. - ' + event.responseText +  '<p>');
                    //that.ui.statusDiv.find("p").fadeOut(5000);
                }
            }
        );
    }
});