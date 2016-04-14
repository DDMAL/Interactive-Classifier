import Backbone from "backbone";
import Radio from "backbone.radio";
import Glyph from "models/Glyph";
import GlyphEvents from "events/GlyphEvents";


export default Backbone.Model.extend({

    defaults: Glyph.defaults,

    initialize: function(options)
    {
        this.model = options.model;
        this.loadModelProperties();
        this.on("change", this.onChangeClass);
    },

    loadModelProperties: function()
    {
        this.set(this.model.attributes);
    },

    manualConfirm: function()
    {
        this.set("id_state_manual", true);
        // Update the internal model
        this.model.save(
            {
                "id_state_manual": true
            },
            {
                patch: true
            }
        );
    },

    onChangeClass: function()
    {
        var oldShortCode = this.model.get("short_code");
        var newShortCode = this.get("short_code");

        // Update the gui
        this.set("id_state_manual", true);
        // Update the internal model
        this.model.save(
            {
                "short_code": newShortCode,
                "id_state_manual": true
            },
            {
                patch: true
            }
        );

        // Update glyph table location
        Radio.trigger("edit", GlyphEvents.moveGlyph, this.model, oldShortCode, newShortCode);
    }
});