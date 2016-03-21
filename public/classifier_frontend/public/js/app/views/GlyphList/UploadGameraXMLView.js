import Marionette from "marionette";
import App from "App";
import GlobalVars from "config/GlobalVars";
import UploadProgressModalView from "views/GlyphList/UploadProgressModalView";
import getAbsoluteGlyphUrl from "utils/getAbsoluteGlyphUrl";
import Dropzone from "dropzone";
import template from "./upload-gamera-xml.template.html";

export default Marionette.LayoutView.extend({
    template,

    createdCollection: undefined,
    dropzoneObject: undefined,

    modalView: undefined,
    modalViewTitle: "Uploading GameraXML file...",
    modalViewText: "",

    // API parameters
    uploadUrl: GlobalVars.SITE_URL + "upload/gamera-xml/",
    paramName: "file",

    ui: {
        "dropzone": ".upload-gamera-xml-form"
    },

    regions: {
        modalRegion: ".upload-modal"
    },

    initialize: function(options)
    {
        this.createdCollection = options.createdCollection;
        // Build the progress modal
        this.modalView = new UploadProgressModalView({
            title: this.modalViewTitle,
            text: this.modalViewText
        });
    },

    /**
     * Set the view glyph ID.
     *
     * @param idNum Glyph ID int,
     */
    setGlyphId: function(idNum)
    {
        this.glyphId = getAbsoluteGlyphUrl(parseInt(idNum));
    },

    onShow: function()
    {
        // Show the modal
        this.modalRegion.show(this.modalView);

        // Build the dropzone
        this.dropzoneObject = new Dropzone(this.ui.dropzone.selector,
            {
                url: this.uploadUrl,
                autoProcessQueue: true,
                paramName: this.paramName,
                //acceptedFiles: "image/*",
                headers: {
                    // We need to include the CSRF token again
                    "X-CSRFToken": App.csrftoken
                }
                //params: {
                //    glyph: this.glyphId
                //}
            }
        );
        // Set up the callbacks
        var that = this;
        this.dropzoneObject.on("processing", function()
        {
            that.modalView.open();
        });
        this.dropzoneObject.on("uploadprogress", function(file, percent, bytes)
        {
            console.log(file, percent, bytes);
            //that.modalView.setPercent(percent);
        });
        this.dropzoneObject.on("complete", function()
        {
            that.onSuccess();
        });
    },

    onSuccess: function()
    {
        this.modalView.close();
        // Fetch modal
        this.createdCollection.trigger("open-modal");
        // Re-fetch the data
        this.createdCollection.fetch();
    }
});