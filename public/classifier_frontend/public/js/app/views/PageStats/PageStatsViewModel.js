import Backbone from "backbone";

export default Backbone.Model.extend({
    defaults: {
        id_states: [
            {
                id_state_manual: false,
                id__count: 0
            },
            {
                id_state_manual: true,
                id__count: 0
            }
        ],
        glyph_count: 0
    }
});