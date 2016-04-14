import Marionette from "marionette";
import Backbone from "backbone";
import PageListView from "views/PageList/PageListView";
import template from "./classifier-dashboard.template.html";


export default Marionette.LayoutView.extend({
    template,

    regions: {
        pageListRegion: ".page-list"
    },

    onShow: function ()
    {
        var collection = new Backbone.Collection(this.model.get("page_set"));
        this.pageListRegion.show(new PageListView({collection: collection}))
    }
});
