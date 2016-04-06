import Marionette from "marionette";
import Dropzone from "dropzone";
import App from "app";
import template from "./gamera-upload.template.html"


export default Marionette.ItemView.extend({
    template,

    // API parameters
    uploadUrl: "/upload/gamera-xml/",

    ui: {
        "gameraDropzone": ".gamera-dropzone"
    },

    onShow: function()
    {
        new Dropzone(this.ui.gameraDropzone.selector,
            {
                url: this.uploadUrl,
                autoProcessQueue: true,
                paramName: this.paramName,
                headers: {
                    // We need to include the CSRF token again
                    "X-CSRFToken": App.csrftoken
                }
                //params: {
                //    glyph: this.glyphId
                //}
            }
        );
    }
});