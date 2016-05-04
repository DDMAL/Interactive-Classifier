import Backbone from "backbone";


export default Backbone.Model.extend({
    defaults: {
        spriteSheetUrl: "#",
        selection: new Backbone.Collection()
    }
});