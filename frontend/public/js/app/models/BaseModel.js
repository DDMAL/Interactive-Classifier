import Backbone from "backbone";

export default Backbone.Model.extend({
    /**
     * Get the relative URL of the page.
     * @returns {string}
     */
    getRelativeUrl: function ()
    {
        // TODO: This is a temporary solution.  We need a less janky method.
        var fullUrl = this.get("url");
        return fullUrl.substring(21);
    }
});