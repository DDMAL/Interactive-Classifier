import Backbone from "backbone";


export default Backbone.Model.extend({
    default: {
        name: "",
        id: 0,
        owner: undefined,
        page_set: []
    }
});