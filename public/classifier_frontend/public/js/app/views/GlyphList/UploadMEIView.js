import UploadGameraXMLView from "views/GlyphList/UploadGameraXMLView";
import GlobalVars from "config/GlobalVars";

import template from "./upload-mei.template.html";

export default UploadGameraXMLView.extend({
    template,

    modalViewTitle: "Uploading MEI file...",

    // API parameters
    uploadUrl: GlobalVars.SITE_URL + "upload/mei/",
    paramNameL: "image_file",

    ui: {
        "dropzone": ".upload-mei-form"
    }
});