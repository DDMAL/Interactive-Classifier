import Marionette from "marionette";
import template from "./page-item.template.html";
import PageStatsView from "../PageStats/PageStatsView";
import PageStatsViewModel from "../PageStats/PageStatsViewModel";


export default Marionette.LayoutView.extend({
    template,

    tagName: 'div class="col-sm-4 col-md-3 col-lg-2"',

    regions: {
        statsRegion: ".stats"
    },

    onShow: function()
    {
        var mv = new PageStatsViewModel();
        mv.url = "/page/" + this.model.get("id") + "/stats/";


        this.statsRegion.show(new PageStatsView({
            model: mv
        }));

        mv.fetch();
    }
})