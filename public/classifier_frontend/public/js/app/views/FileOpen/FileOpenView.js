import Backbone from "backbone";
import Marionette from "marionette";
import GameraClassifier from "models/GameraClassifier";
import FileOpenRowView from "views/FileOpen/FileOpenRowView";


export default Marionette.CollectionView.extend({
    childView: FileOpenRowView,

    tagName: 'table class="table table-striped table-hover table-condensed"',

    initialize: function()
    {
        this.collection = new Backbone.Collection();
        this.collection.url = "/classifiers/";
        this.collection.model = GameraClassifier;
        this.collection.fetch();
    }
});