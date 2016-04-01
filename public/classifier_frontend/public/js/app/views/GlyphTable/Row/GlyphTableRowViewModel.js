import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        short_code: "",
        glyphs: undefined
    }
});