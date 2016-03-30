import Backbone from "backbone";
import Glyph from "models/Glyph";


export default Backbone.Model.extend({

    defaults: Glyph.defaults,

    initialize: function(options)
    {
        this.model = options.model;
        this.loadModelProperties();
        this.on("change:short_code", this.onChangeClass);
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
        // Update the gui
        this.set("id_state_manual", true);
        // Update the internal model
        this.model.save(
            {
                "short_code": this.get("short_code"),
                "id_state_manual": true
            },
            {
                patch: true
            }
        );
    }
});