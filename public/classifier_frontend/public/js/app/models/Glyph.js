import Backbone from "backbone";
import GlyphEvents from "../events/GlyphEvents";
import RadioChannels from "../radio/RadioChannels";


export default Backbone.Model.extend({

    url: function() {
        return this.get("url");
    },

    defaults: {
        id: 0,
        short_code: "",
        id_state_manual: false,
        confidence: 0.0,
        ulx: 0,
        uly: 0,
        nrows: 0,
        ncols: 0,
        image_file: "",
        image_b64: "",
        context_thumbnail: ""
    },

    changeClass: function(newShortCode)
    {
        var oldShortCode = this.get("short_code");

        this.set({
            short_code: newShortCode,
            id_state_manual: true,
            confidence: 1.0
        });

        // Update glyph table location
        RadioChannels.edit.trigger(GlyphEvents.moveGlyph, this, oldShortCode, newShortCode);
        RadioChannels.edit.trigger(GlyphEvents.changeGlyph, this);
    }
});
