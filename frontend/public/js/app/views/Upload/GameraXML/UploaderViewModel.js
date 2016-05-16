import Backbone from "backbone";

export default Backbone.Model.extend({
    defaults: {
        uploadUrl: "",
        progressMessage: "Upload in progres...",
        successMessage: "Successful upload!",
        errorMessage: "Error Uploading!"
    }
});