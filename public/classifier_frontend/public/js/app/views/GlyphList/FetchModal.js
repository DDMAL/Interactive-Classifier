import UploadProgressModalView from "views/GlyphList/UploadProgressModalView";

export default UploadProgressModalView.extend({
    initialize: function(options)
    {
        this.title = options.title;
        this.text = options.text;
        this.collection = options.collection;

        // Bind the events
        var that = this;
        console.log("Event bindings");
        this.collection.on("open-modal", function()
        {
            that.open();
        });
        this.collection.on("sync", function()
        {
            that.close();
        });
    }
});