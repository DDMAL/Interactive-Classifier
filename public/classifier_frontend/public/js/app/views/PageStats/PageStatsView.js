import Marionette from "marionette";
import template from "./page-stats.template.html";

export default Marionette.ItemView.extend({
    template,

    modelEvents: {
        "change": "render"
    },

    serializeData: function ()
    {
        var data = this.model.toJSON();

        var output = {
            gameraIdCount: 0,
            manualIdCount: 0,
            glyphCount: 0
        };

        if (data.id_states[0])
        {
            output.gameraIdCount = data.id_states[0].id__count;
            output.glyphCount += data.id_states[0].id__count;
        }
        if (data.id_states[1])
        {
            output.manualIdCount = data.id_states[1].id__count;
            output.glyphCount += data.id_states[1].id__count;
        }

        return output;
    }
});