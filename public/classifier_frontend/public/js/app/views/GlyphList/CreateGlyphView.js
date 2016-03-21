import Marionette from "marionette";
import Glyph from "models/Glyph";
import ErrorStatusViewModel from "views/widgets/ErrorStatus/ErrorStatusVieWModel";
import ErrorStatusView from "views/widgets/ErrorStatus/ErrorStatusView";
import template from "./create-glyph.template.html";

export default Marionette.LayoutView.extend({
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

    regions: {
        statusDiv: "@ui.statusDiv"
    },

    events: {
        "submit": "createGlyphButtonCallback"
    },

    // SubViewModels
    errorStatusViewModel: undefined,

    initialize: function(options)
    {
        // Assign the collection which contains the created glyphs
        this.createdCollection = options.createdCollection;

        this.errorStatusViewModel = new ErrorStatusViewModel();
    },

    onShow: function()
    {
        console.log("show createglyphview:", this.ui.statusDiv);
        this.getRegion("statusDiv").show(new ErrorStatusView({model: this.errorStatusViewModel}));
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
                success: function()
                {
                    that.errorStatusViewModel.success('Glyph "<a href="' + newGlyph.get("url") + '">' + newGlyph.get("short_code") + '</a>" saved successfully.');
                    // Add the created glyph to the createdCollection
                    that.createdCollection.add(newGlyph);
                    // Empty the short code field
                    that.ui.shortCodeField.val('');
                },
                error: function(model, event)
                {
                    that.errorStatusViewModel.error('Error saving glyph. - ' + event.responseText);
                    //that.ui.statusDiv.find("p").fadeOut(5000);
                }
            }
        );
    }
});