import Backbone from "backbone";
import GlyphEvents from "events/GlyphEvents";
import RadioChannels from "radio/RadioChannels";
import ClassNameUtils from "utils/ClassNameUtils";

/**
 * A Glyph object within the interactive classifier.
 *
 * @class Glyph
 */
export default Backbone.Model.extend(
    /**
     * @lends Glyph.prototype
     */
    {
        defaults: {
            id: 0,
            class_name: "",
            id_state_manual: false,
            confidence: 0.0,
            ulx: 0,
            uly: 0,
            nrows: 0,
            ncols: 0,
            image_file: "",
            image_b64: "",
            parts: [],
            split: {},
            is_training: false
        },

        /**
         * Creates a new glyph.
         *
         * @param {string} className - The name for the class.
         */
        onCreate: function ()
        {
            RadioChannels.edit.trigger(GlyphEvents.addGlyph, this, this.get("class_name"));
            RadioChannels.edit.trigger(GlyphEvents.setGlyphName, this.get("class_name"));
        },

        /**
         * Change the class of the glyph.
         *
         * This method fires events that might change the location where the
         * glyph is being rendered on the glyph table.
         *
         * @param {string} newClassName - The new name for the class.
         */
        changeClass: function (newClassName)
        {
            // Make sure it's a string
            newClassName = String(newClassName);
            var oldClassName = this.get("class_name");

            // do the sanitization step
            var sanitizedClassName = ClassNameUtils.sanitizeClassName(newClassName);

            this.set(
            {
                class_name: sanitizedClassName,
                id_state_manual: true,
                confidence: 1.0
            });

            // Update glyph table location
            RadioChannels.edit.trigger(GlyphEvents.moveGlyph, this, oldClassName, this.get("class_name"));
            RadioChannels.edit.trigger(GlyphEvents.changeGlyph, this);
            RadioChannels.edit.trigger(GlyphEvents.setGlyphName, this.get("class_name"));

        },

        /**
         * Unclassify a glyph
         *
         * This method fires events that might change the location where the
         * glyph is being rendered on the glyph table.
         *
         *
         */
        unclassify: function ()
        {
            // Make sure it's a string

            var oldClassName = this.get("class_name");

            this.set({
                class_name: "UNCLASSIFIED",
                id_state_manual: false,
                confidence: 0
            });
            // Update glyph table location
            RadioChannels.edit.trigger(GlyphEvents.moveGlyph, this, oldClassName, this.get("class_name"));
            RadioChannels.edit.trigger(GlyphEvents.changeGlyph, this);
            RadioChannels.edit.trigger(GlyphEvents.setGlyphName, this.get("class_name"));
        }
    });