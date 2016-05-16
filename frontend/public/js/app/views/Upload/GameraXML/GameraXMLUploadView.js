import Backbone from "backbone";
import Marionette from "marionette";
import getCookie from "utils/getCookie";
import LoadingScreenView from "views/widgets/LoadingScreen/LoadingScreenView";
import LoadingScreenViewModel from "views/widgets/LoadingScreen/LoadingScreenViewModel";
import ErrorStatusView from "views/widgets/ErrorStatus/ErrorStatusView";
import ErrorStatusViewModel from "views/widgets/ErrorStatus/ErrorStatusViewModel";
import StatusEnum from "views/widgets/ErrorStatus/StatusEnum";
import template from "./gamera-upload.template.html"

export default Marionette.LayoutView.extend({
    template,

    ui: {
        "file": 'input[type="file"]',
        "button": 'button[type="submit"]'
    },

    events: {
        "submit": "onSubmit"
    },

    regions: {
        statusRegion: ".status-region"
    },

    onSubmit: function (event)
    {
        event.preventDefault();
        this.ui.button.attr("disabled", "disabled");
        this.statusRegion.show(new LoadingScreenView({
            model: new LoadingScreenViewModel({
                text: this.model.get("progressMessage")
            })
        }));
        var that = this;
        Backbone.ajax(this.model.get("uploadUrl"),
            {
                cache: false,
                contentType: false,
                processData: false,
                type: "POST",
                data: this.ui.file[0].files[0],
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    "test": "test"
                },
                success: function (event, event2)
                {
                    console.log(event, event2);
                    that.ui.button.removeAttr("disabled");
                    that.statusRegion.show(new ErrorStatusView({
                        model: new ErrorStatusViewModel({
                            status: StatusEnum.success,
                            text: that.model.get("successMessage")
                        })
                    }))
                },
                error: function ()
                {
                    that.ui.button.removeAttr("disabled");
                    that.statusRegion.show(new ErrorStatusView({
                        model: new ErrorStatusViewModel({
                            status: StatusEnum.error,
                            text: that.model.get("errorMessage")
                        })
                    }))
                }
            }
        );
    }
});