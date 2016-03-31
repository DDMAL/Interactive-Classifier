import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        id: 0,
        url: "",
        glyph_set: [],
        uuid: "",
        name: ""
    },

    getGuessAllUrl: function()
    {
        return this.get("url") + "guess/all/"
    }
});