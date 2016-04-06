import Backbone from "backbone";
import Marionette from "marionette";
import Page from "models/Page";
import FileOpenRowView from "views/FileOpen/FileOpenRowView";


export default Marionette.CollectionView.extend({
    childView: FileOpenRowView,

    tagName: 'table class="table table-striped table-hover table-condensed"',

    initialize: function()
    {
        this.collection = new Backbone.Collection();
        this.collection.url = "/pages/mine/";
        this.collection.model = Page;
        this.collection.fetch();
    }
});