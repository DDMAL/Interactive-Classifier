import Marionette from "marionette";
import Dropzone from "dropzone";
import App from "App";
import Image from "models/Image";
import GlobalVars from "config/GlobalVars";
import getAbsoluteGlyphUrl from "utils/getAbsoluteGlyphUrl";
import template from "./upload-image.template.html";

export default Marionette.ItemView.extend({
    template,
    createdCollection: undefined,
    dropzoneObject: undefined,

    ui: {
        "dropzone": ".dropzone-form"
    },

    initialize: function(options)
    {
        if(options !== undefined)
        {
            if (options.createdCollection !== undefined)
            {
                this.createdCollection = options.createdCollection;
            }
            if (options.glyphId !== undefined)
            {
                this.setGlyphId(options.glyphId);
            }
        }
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
        // Build the dropzone
        this.dropzoneObject = new Dropzone(this.ui.dropzone.selector,
            {
                url: GlobalVars.SITE_URL + "images/",
                autoProcessQueue: true,
                paramName: "image_file",
                acceptedFiles: "image/*",
                headers: {
                    // We need to include the CSRF token again
                    "X-CSRFToken": App.csrftoken
                },
                params: {
                    glyph: this.glyphId
                }
            }
        );
        // Set up the callbacks
        var that = this;
        this.dropzoneObject.on("success",
            function(file, attributes) {
                var newModel = new Image({url: attributes.url});
                newModel.set(attributes);
                newModel.set("glyph", that.glyphId);
                that.createdCollection.add(newModel);
            }
        );
    }
});