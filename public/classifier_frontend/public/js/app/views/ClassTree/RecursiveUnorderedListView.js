import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import template from "./recursive-unordered-list.template.html";


export default Marionette.ItemView.extend({
    template,

    events: {
        "click .short-code": "onClickNode"
    },

    onShow: function()
    {
        this.$el.html(this.constructListHtml(this.model, ""));
    },

    onClickNode: function (event)
    {
        event.preventDefault();

        // Extract the name from the HTML5 data attribute.
        var shortCode = event.target.dataset.name;
        RadioChannels.edit.trigger(GlyphEvents.clickGlyphName, shortCode);
    },

    /**
     *
     * @param {RecursiveUnorderedListViewModel} node
     * @param {string} parentValue
     * @returns {string}
     */
    constructListHtml: function (node, parentValue) {
        var output = "";

        var value = node.get("value"),
            children = node.get("children");

        if (value)
        {
            // Build this level of the recursion
            output = '<li><a href="#" data-name="' + parentValue + value + '" class="short-code">' + value + "</a>";
        }

        // Recursively construct the children
        if (children.length > 0)
        {
            output += "<ul>";
            // Add the children recursively
            for (var i = 0; i < children.length; i++)
            {
                var recursiveName = parentValue;
                if (value)
                {
                    recursiveName += value + "."
                }

                output += this.constructListHtml(children[i], recursiveName);
            }
            output += "</ul>";
        }

        if (value)
        {
            output += "</li>";
        }

        return output;
    }
});