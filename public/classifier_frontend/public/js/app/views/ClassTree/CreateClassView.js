import Marionette from "marionette";
import ShortCodeUtils from "utils/ShortCodeUtils";
import ErrorStatusView from "views/widgets/ErrorStatus/ErrorStatusView";
import ErrorStatusViewModel from "views/widgets/ErrorStatus/ErrorStatusViewModel";
import template from "./create-class.template.html";

export default Marionette.LayoutView.extend({
    template,
    tagName: "form",

    ui: {
        shortcodeField: 'input[title="shortcode"]'
    },

    regions: {
        errorStatusRegion: ".error-status-region"
    },

    events: {
        "submit": "onSubmit"
    },

    // ViewModels
    errorStatusViewModel: new ErrorStatusViewModel(),

    onShow: function()
    {
        this.errorStatusRegion.show(new ErrorStatusView({model: this.errorStatusViewModel}));
    },

    onSubmit: function(event)
    {
        event.preventDefault();
        // Sanitize the input
        var sanitizedShortCode = ShortCodeUtils.sanitizeShortCode(this.ui.shortcodeField.val());

        if (sanitizedShortCode.length < 1)
        {
            // Empty edge case
            this.errorStatusViewModel.error("Class name required.");
        }
        else if (this.collection.where({shortcode: sanitizedShortCode}).length < 1)
        {
            // Success case
            this.collection.add({shortcode: sanitizedShortCode});
            this.ui.shortcodeField.empty();
            this.errorStatusViewModel.success(sanitizedShortCode + " created successfully.");
        }
        else
        {
            // Already exists case
            this.errorStatusViewModel.error(sanitizedShortCode + " already exists.");
        }
    }
});