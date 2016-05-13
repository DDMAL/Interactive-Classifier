import Marionette from "marionette";
import PageStatsView from "views/PageStats/PageStatsView";
import PageStatsViewModel from "views/PageStats/PageStatsViewModel";
import App from "App";
import Page from "models/Page";
import template from "./page-item.template.html";

export default Marionette.LayoutView.extend({
    template,
    tagName: 'div class="col-sm-4 col-md-3 col-lg-2"',

    regions: {
        statsRegion: ".stats"
    },

    ui: {
        editButton: ".btn"
    },

    events: {
        "click @ui.editButton": "onClickEditButton"
    },

    onShow: function ()
    {
        var mv = new PageStatsViewModel();
        mv.url = "/page/" + this.model.get("id") + "/stats/";

        this.statsRegion.show(new PageStatsView({
            model: mv
        }));

        mv.fetch();
    },

    onClickEditButton: function (event)
    {
        event.preventDefault();

        // Create a page object
        var page = new Page(this.model.toJSON());

        App.appRouter.navigate(page.getRelativeUrl(),
            {
                trigger: true
            }
        );
    }
});