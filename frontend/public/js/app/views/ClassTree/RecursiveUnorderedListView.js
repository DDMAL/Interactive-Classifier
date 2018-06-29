import Marionette from "marionette";
import RadioChannels from "radio/RadioChannels";
import GlyphEvents from "events/GlyphEvents";
import ClassEvents from "events/ClassEvents";
import template from "./recursive-unordered-list.template.html";
import Class from 'models/Class';

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
            "click .class-name": "onClickNode",
            "contextmenu .class-name": "onRightClickName"
        },

        onShow: function ()
        {
            this.$el.html(this.constructListHtml(this.model, ""));

            //If a class is deleted, search through all classes and remove the class
            this.listenTo(RadioChannels.edit, ClassEvents.deleteClass,
                function(deleteClass)
                {
                    this.onDelete(deleteClass);
                }
            );
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

            //the user cannot edit the unclassified class
            if (className.toLowerCase() !== "unclassified")
            {
                // TODO: store classes in a database so won't create more than once
                // This feature is very buggy so it's commented out for now
                var c = new Class();
                c.set("name",className);
                //RadioChannels.edit.trigger(ClassEvents.openClassEdit, c);
            }

        },

        /**
         * Right-clicking one of the class names in the tree fires an event.
         * This event causes the class name to display a renaming textbox.
         *
         *
         * @param rightClickEvent
         */
        onRightClickName: function (rightClickEvent)
        {
            rightClickEvent.preventDefault();

            //Extract the class name from the HTML5 data attribute
            var className = rightClickEvent.target.dataset.name;

            if (className === "UNCLASSIFIED")
            {
                return;
            }
            var renameElem;

            //get the HTML element that corresponds to the class name
            var classList = document.getElementsByClassName("class-name");
            for (var i = 0; i < classList.length; i++)
            {
                if (classList[i].getAttribute('data-name') === className)
                {
                    renameElem = classList[i];
                }
            }

            if (renameElem)
            {
                var tmpClass = new Class({
                    name: className
                });
                RadioChannels.edit.trigger(ClassEvents.openClassEdit, tmpClass);
            }

        },

        onDelete: function(className)
        {
            if (className === "UNCLASSIFIED")
            {
                return;
            }
            var delete_elem;
            var list = document.getElementsByTagName("li");
            for (var i = 0; i < list.length; i++)
            {
                if (list[i].firstChild !== null)
                {
                    if (list[i].firstChild.getAttribute('data-name') === className)
                    {
                        delete_elem = list[i];
                    }
                }
            }

            this.model.deleteChild(className);
            if (delete_elem)
            {
                delete_elem.remove();
            }
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
