import Marionette from "marionette";
import Backbone from "backbone";
import PageListView from "views/PageList/PageListView";
import PageStatsView from "../PageStats/PageStatsView";
import PageStatsViewModel from "../PageStats/PageStatsViewModel";
import template from "./classifier-dashboard.template.html";
import RadioChannels from "../../radio/RadioChannels";
import GlobalUIEvents from "../../events/GlobalUIEvents";


export default Marionette.LayoutView.extend({
    template,

    regions: {
        pageListRegion: ".page-list",
        statsRegion: ".classifier-stats"
    },

    ui: {
        importImageButton: ".import-image",
        importGameraButton: ".import-gamera-xml"
    },

    events: {
        "click @ui.importImageButton": "onClickImportImageButton",
        "click @ui.importGameraButton": "onClickImportGameraButton"
    },

    onShow: function ()
    {
        var collection = new Backbone.Collection(this.model.get("page_set"));
        this.pageListRegion.show(new PageListView({
            collection: collection
        }));

        var stats = new PageStatsViewModel();
        stats.url = this.model.get("url") + "stats/";
        this.statsRegion.show(new PageStatsView({
            model: stats
        }));
        stats.fetch();
    },

    onClickImportImageButton: function (event)
    {
        event.preventDefault();
        RadioChannels.globalUI.trigger(GlobalUIEvents.openImageImportWindow);
    },

    onClickImportGameraButton: function (event)
    {
        event.preventDefault();
        RadioChannels.globalUI.trigger(GlobalUIEvents.openGameraXMLImportWindow);
    }
});
