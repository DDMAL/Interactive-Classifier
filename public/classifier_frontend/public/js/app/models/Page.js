import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        id: 0,
        url: "",
        glyph_set: [],
        uuid: "",
        name: ""
    }
});