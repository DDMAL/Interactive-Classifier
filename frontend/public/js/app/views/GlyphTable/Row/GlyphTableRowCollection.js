import Backbone from "backbone";
import GlyphTableRowViewModel from "views/GlyphTable/Row/GlyphTableRowViewModel";
import GlyphCollection from "collections/GlyphCollection";
import RadioChannels from "radio/RadioChannels";
import ClassEvents from "events/ClassEvents";
import PageEvents from "events/PageEvents";

/**
 * @class GlyphTableRowCollection
 *
 * This is a special kind of collection used in the rows of the GlyphTable.
 *
 * @constructs GlyphTableRowCollection
 */
export default Backbone.Collection.extend(
    /**
     * @lends GlyphTableRowCollection.prototype
     */
    {
        model: GlyphTableRowViewModel,

        comparator: "class_name",

        /*
        * Set whether the collection contains the classifier glyphs or the page glyphs
        *
        * @param {boolean} is_classifier - Whether or not this is the classifier
        */
        setClassifier: function(is_classifier)
        {
            this.is_classifier = is_classifier;
        },

        /**
         * Move a glyph from one table row to another.
         *
         * @param {Glyph} glyph - Glyph model.
         * @param {string} oldClassName - The glyph's old class name.
         * @param {string} newClassName - The glyph's new class name.
         */
        moveGlyph: function (glyph, oldClassName, newClassName)
        {
                var oldRow = this.findWhere({
                    class_name: oldClassName
                });
                if (oldRow)
                {
                    oldRow.get("glyphs").remove(glyph);

                    // Remove the old row if it's empty
                    if (oldRow.get("glyphs").length < 1)
                    {
                        if (!this.is_classifier)
                        {
                            RadioChannels.edit.trigger(ClassEvents.deleteClass, oldClassName);
                        }
                        this.remove(oldRow);
                    }
                }

            // If the glyph is manual, it will be in both the classifier and the glyph table
           // Otherwise, the glyph shouldn't be in the classifier glyphs so a new row shouldn't be created
            if (!this.is_classifier || glyph.attributes.id_state_manual)
            {
                // Add to the new class name collection
                var newRow = this.findWhere({
                    class_name: newClassName
                });
                if (newRow)
                {
                    // There is already a row, so we add to it
                    newRow.get("glyphs").add(glyph);
                }
                else if (newClassName.substring(0,12) !== "_group._part" && newClassName.substring(0,6) !== "_split") // TODO: use startswith instead
                {
                    // There is no row, so we add a new row
                    this.add({
                        class_name: newClassName,
                        glyphs: new GlyphCollection([glyph])
                    });

                    RadioChannels.edit.trigger(PageEvents.changeBackground);
                }
            }
        },

        /**
         * Delete a class so it is no longer shown in the right pane.
         *
         * @param {string} className - The class name.
         */
        deleteClass: function (className)
        {
            var row = this.findWhere(
            {
                class_name: className
            });
            if (row)
            {
                var glyphs = row.get("glyphs");
                while (glyphs.length > 0)
                {
                    var glyph = glyphs.pop();
                    glyph.unclassify();
                }
            }
        },

        /**
         * Add a new glyph to the table.
         *
         * @param {Glyph} glyph - Glyph model.
         * @param {string} className - The class name.
         */
        addGlyph: function(glyph, className)
        {
            // Add to the new class name collection
            var newRow = this.findWhere({
                class_name: className
            });

            if (newRow)
            {
                // There is already a row, so we add to it
                newRow.get("glyphs").add(glyph);
            }
            else
            {
                // There is no row, so we add a new row
                this.add({
                    class_name: className,
                    glyphs: new GlyphCollection([glyph])
                });
            }

            RadioChannels.edit.trigger(PageEvents.changeBackground);

        }

    });