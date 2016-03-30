import Marionette from "marionette";
import template from "./recursive-unordered-list.template.html";


export default Marionette.ItemView.extend({
    template,

    onShow: function()
    {
        var html = this.constructListHtml(this.model);
        console.log(html);
        this.$el.html(this.constructListHtml(this.model));
    },

    /**
     *
     * @param {RecursiveUnorderedListViewModel} node
     * @returns {string}
     */
    constructListHtml: function (node) {
        var output = "";

        if (node.get("value"))
        {
            // Build this level of the recursion
            output = "<li>" + node.get("value");
        }

        // Recursively construct the children
        if (node.get("children").length > 0)
        {
            output += "<ul>";
            // Add the children recursively
            for (var i = 0; i < node.get("children").length; i++)
            {
                output += this.constructListHtml(node.get("children")[i]);
            }
            output += "</ul>";
        }

        if (node.get("value"))
        {
            output += "</li>";
        }

        return output;
    }
});