import Backbone from "backbone";
import GlyphEvents from "events/GlyphEvents";
import RadioChannels from "radio/RadioChannels";
import ClassNameUtils from "utils/ClassNameUtils";

export default Backbone.Model.extend({

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
        image_b64: ""
    },

    /**
     * Change the class of the glyph.
     *
     * This method fires events that might change the location where the
     * glyph is being rendered on the glyph table.
     *
     * @param newClassName
     */
    changeClass: function (newClassName)
    {
        var oldClassName = this.get("class_name");

        // do the sanitization step
        var sanitizedClassName = ClassNameUtils.sanitizeClassName(newClassName);

        this.set({
            class_name: sanitizedClassName,
            id_state_manual: true,
            confidence: 1.0
        });

        // Update glyph table location
        RadioChannels.edit.trigger(GlyphEvents.moveGlyph, this, oldClassName, this.get("class_name"));
        RadioChannels.edit.trigger(GlyphEvents.changeGlyph, this);
        RadioChannels.edit.trigger(GlyphEvents.setGlyphName, this.get("class_name"));
    }
});
