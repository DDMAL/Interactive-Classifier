import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import ClassEvents from "events/ClassEvents";
import template from "./recursive-unordered-list.template.html";

/**
 * @class RecursiveUnorderedListView
 *
 * This view is a recursive unordered list.  This view is the main component of the ClassTreeView.
 *
 * @constructor
 */
export default Marionette.ItemView.extend(
    /**
     * @lends RecursiveUnorderedListView.prototype
     */
    {
        template,

        events: {
            "click .class-name": "onClickNode"
        },

        onShow: function ()
        {
            this.$el.html(this.constructListHtml(this.model, ""));
        },

        /**
         * Clicking one of the class names in the tree fires an event.  This event causes the currently selected glyphs to
         * be assigned the name.
         *
         * @param event
         */
        onClickNode: function (event)
        {
            event.preventDefault();

            // Extract the name from the HTML5 data attribute.
            var className = event.target.dataset.name;
            RadioChannels.edit.trigger(GlyphEvents.clickGlyphName, className);
            RadioChannels.edit.trigger(ClassEvents.openClassEdit);            
        },

        /**
         * Construct an html <ul> element recursively.
         *
         * @param {RecursiveUnorderedListViewModel} node
         * @param {string} parentValue
         * @returns {string}
         */
        constructListHtml: function (node, parentValue)
        {
            var output = "";

            var value = node.get("value"),
                children = node.get("children");

            if (value)
            {
                // Build this level of the recursion
                output = '<li><a href="#" data-name="' + parentValue + value + '" class="class-name">' + value + "</a>";
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